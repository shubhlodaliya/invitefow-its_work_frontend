import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { ImageConfig } from "./NamePlacementEditor";

interface ProcessingPageProps {
  names: string[];
  images: string[];
  imageConfigs: ImageConfig[];
  onComplete?: () => void;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export function ProcessingPage({ names, images, imageConfigs, onComplete }: ProcessingPageProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedZipUrl, setGeneratedZipUrl] = useState<string | null>(null);

  const namesCount = names.length;

  useEffect(() => {
    generatePDFs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePDFs = async () => {
    try {
      setError(null);
      setIsComplete(false);
      setProgress(0);

      const zip = new JSZip();
      const totalCards = names.length;
      const orderedConfigs = [...imageConfigs].sort((a, b) => {
        const aOrder = a.order ?? a.imageIndex ?? 0;
        const bOrder = b.order ?? b.imageIndex ?? 0;
        return aOrder - bOrder;
      });

      for (let i = 0; i < totalCards; i++) {
        const name = names[i];
        const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

        for (let pageIndex = 0; pageIndex < orderedConfigs.length; pageIndex++) {
          const config = orderedConfigs[pageIndex];
          const imageUrl = images[config.imageIndex];

          const img = await loadImage(imageUrl);

          // Draw base image to canvas
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // Add text overlay if enabled or if extraText exists
          if (config.enabled || config.extraText) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", img.width.toString());
            svg.setAttribute("height", img.height.toString());

            // Main text (Excel name) - only if enabled
            if (config.enabled) {
              const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
              text.setAttribute("x", ((config.x / 100) * img.width).toString());
              text.setAttribute("y", ((config.y / 100) * img.height).toString());
              text.setAttribute("font-size", `${config.fontSize}px`);
              text.setAttribute("font-family", config.fontFamily);
              text.setAttribute("fill", config.fontColor);
              text.setAttribute("text-anchor", "middle");
              text.setAttribute("dominant-baseline", "middle");
              text.setAttribute("font-weight", config.bold ? "bold" : "normal");
              text.setAttribute("font-style", config.italic ? "italic" : "normal");
              text.setAttribute("text-decoration", config.underline ? "underline" : "none");
              text.setAttribute("style", "text-shadow: 0 0 4px rgba(255,255,255,0.8)");
              text.textContent = name || config.sampleText;

              svg.appendChild(text);
            }

            // Extra text (optional additional text)
            if (config.extraText) {
              const extraText = document.createElementNS("http://www.w3.org/2000/svg", "text");
              extraText.setAttribute("x", (((config.extraX ?? 50) / 100) * img.width).toString());
              extraText.setAttribute("y", (((config.extraY ?? 60) / 100) * img.height).toString());
              extraText.setAttribute("font-size", `${config.fontSize}px`);
              extraText.setAttribute("font-family", config.fontFamily);
              extraText.setAttribute("fill", config.fontColor);
              extraText.setAttribute("text-anchor", "middle");
              extraText.setAttribute("dominant-baseline", "middle");
              extraText.setAttribute("font-weight", config.bold ? "bold" : "normal");
              extraText.setAttribute("font-style", config.italic ? "italic" : "normal");
              extraText.setAttribute("text-decoration", config.underline ? "underline" : "none");
              extraText.setAttribute("style", "text-shadow: 0 0 4px rgba(255,255,255,0.8)");
              extraText.textContent = config.extraText;

              svg.appendChild(extraText);
            }

            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const svgUrl = URL.createObjectURL(svgBlob);

            const svgImg = await loadImage(svgUrl);
            ctx.drawImage(svgImg, 0, 0, img.width, img.height);
            URL.revokeObjectURL(svgUrl);
          }

          const finalImageData = canvas.toDataURL("image/png");

          if (pageIndex > 0) {
            pdf.addPage("a4", "portrait");
          }

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgRatio = img.width / img.height;
          const pageRatio = pageWidth / pageHeight;

          let renderWidth = pageWidth;
          let renderHeight = pageHeight;

          if (imgRatio > pageRatio) {
            renderHeight = pageWidth / imgRatio;
          } else {
            renderWidth = pageHeight * imgRatio;
          }

          const x = (pageWidth - renderWidth) / 2;
          const y = (pageHeight - renderHeight) / 2;

          pdf.addImage(finalImageData, "PNG", x, y, renderWidth, renderHeight);
        }

        const pdfBlob = pdf.output("blob");
        zip.file(`${name}.pdf`, pdfBlob);

        const currentProgress = Math.floor(((i + 1) / totalCards) * 100);
        setProgress(currentProgress);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      setGeneratedZipUrl(zipUrl);
      setProgress(100);
      setIsComplete(true);
    } catch (err: any) {
      console.error("Error generating PDFs:", err);
      setError(err?.message || "Failed to generate PDFs. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!generatedZipUrl) return;

    const link = document.createElement("a");
    link.href = generatedZipUrl;
    link.download = "wedding_cards.zip";
    link.click();

    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          {error ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-3xl">❌</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl mb-2 text-red-600">Error</h2>
                <p className="text-gray-600">{error}</p>
              </div>
              <Button onClick={generatePDFs} variant="outline">
                Try Again
              </Button>
            </div>
          ) : !isComplete ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl mb-2">Generating PDFs...</h2>
                <p className="text-gray-600">Please wait while we create your personalized cards</p>
              </div>
              <div className="space-y-2">
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-gray-600">{progress}% Complete</p>
              </div>
              <div className="text-sm text-gray-500">
                Processing {Math.floor((progress / 100) * namesCount)} of {namesCount} cards
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl mb-2">✔ Files Ready!</h2>
                <p className="text-gray-600">Your personalized wedding cards are ready to download</p>
              </div>

              <Card className="bg-gray-50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Files</p>
                      <p className="text-2xl">{namesCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Format</p>
                      <p className="text-2xl">ZIP</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full gap-2" onClick={handleDownload} disabled={!generatedZipUrl}>
                <Download className="h-5 w-5" />
                Download ZIP File
              </Button>

              <p className="text-xs text-gray-500">The ZIP file contains all your personalized PDF cards</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProcessingPage;
