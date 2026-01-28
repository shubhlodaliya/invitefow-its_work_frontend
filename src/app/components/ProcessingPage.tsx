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

const ensureFontsLoaded = async (configs: ImageConfig[]) => {
  if (!("fonts" in document)) return;
  const uniqueFamilies = Array.from(new Set(configs.map((c) => c.fontFamily).filter(Boolean)));
  const maxSize = Math.max(...configs.map((c) => c.fontSize || 16), 16);
  const loaders = uniqueFamilies.flatMap((family) => {
    const quoted = family.includes(" ") ? `"${family}"` : family;
    return [
      document.fonts.load(`400 ${maxSize}px ${quoted}`),
      document.fonts.load(`700 ${maxSize}px ${quoted}`),
    ];
  });
  await Promise.allSettled(loaders);
  await (document.fonts as FontFaceSet).ready;
};

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

      // Ensure webfonts are available before rasterizing SVG to image
      await ensureFontsLoaded(imageConfigs);

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

          if (pageIndex > 0) {
            pdf.addPage("a4", "portrait");
          }

          // PDF page dimensions
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          
          // Render at high resolution (4x) for quality, then scale down in PDF
          const scale = 4;
          const canvasWidth = pageWidth * scale;
          const canvasHeight = pageHeight * scale;
          
          // Create high-resolution canvas
          const canvas = document.createElement("canvas");
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");

          // Calculate image position to fit canvas
          const imgRatio = img.width / img.height;
          const pageRatio = pageWidth / pageHeight;
          let renderWidth = canvasWidth;
          let renderHeight = canvasHeight;
          if (imgRatio > pageRatio) {
            renderHeight = canvasWidth / imgRatio;
          } else {
            renderWidth = canvasHeight * imgRatio;
          }
          const xOffset = (canvasWidth - renderWidth) / 2;
          const yOffset = (canvasHeight - renderHeight) / 2;

          // Draw image at high resolution
          ctx.drawImage(img, xOffset, yOffset, renderWidth, renderHeight);

          // Draw text at scaled size for high resolution
          if (config.enabled || config.extraText) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = config.fontColor;
            
            let fontStyle = "";
            if (config.italic) fontStyle += "italic ";
            if (config.bold) fontStyle += "bold ";
            // Scale font size by the same factor
            ctx.font = `${fontStyle}${config.fontSize * scale}px "${config.fontFamily}"`;

            // Main text
            if (config.enabled) {
              const textX = xOffset + (config.x / 100) * renderWidth;
              const textY = yOffset + (config.y / 100) * renderHeight;
              ctx.fillText(name || config.sampleText || "", textX, textY);
            }

            // Extra text
            if (config.extraText) {
              const extraX = xOffset + ((config.extraX ?? 50) / 100) * renderWidth;
              const extraY = yOffset + ((config.extraY ?? 60) / 100) * renderHeight;
              ctx.fillText(config.extraText, extraX, extraY);
            }
          }

          // Convert high-res canvas to JPEG with compression for smaller file size
          // Quality 0.92 = excellent quality but much smaller than PNG
          const canvasImage = canvas.toDataURL("image/jpeg", 0.92);
          pdf.addImage(canvasImage, "JPEG", 0, 0, pageWidth, pageHeight);
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