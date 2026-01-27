import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import { ImageConfig } from "./NamePlacementEditor";
import jsPDF from "jspdf";
import JSZip from "jszip";

interface ProcessingPageProps {
  names: string[];
  images: string[];
  imageConfigs: ImageConfig[];
  onComplete?: () => void;
}

export function ProcessingPage({ names, images, imageConfigs, onComplete }: ProcessingPageProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedZipUrl, setGeneratedZipUrl] = useState<string | null>(null);
  
  const namesCount = names.length;

  useEffect(() => {
    generatePDFs();
  }, []);

  const generatePDFs = async () => {
    try {
      setProgress(0);
      setError(null);

      // Filter enabled images
      const enabledConfigs = imageConfigs.filter(config => config.enabled);
      
      if (enabledConfigs.length === 0) {
        setError("No images are enabled for PDF generation");
        return;
      }

      const zip = new JSZip();
      const totalCards = names.length;

      // Generate PDF for each name
      for (let i = 0; i < totalCards; i++) {
        const name = names[i];
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        });

        // Add each enabled page to the PDF
        for (let pageIndex = 0; pageIndex < enabledConfigs.length; pageIndex++) {
          const config = enabledConfigs[pageIndex];
          
          if (pageIndex > 0) {
            pdf.addPage();
          }

          // Load image
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = images[config.imageIndex];
          });

          // Create SVG with text
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('width', img.width.toString());
          svg.setAttribute('height', img.height.toString());
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', ((config.x / 100) * img.width).toString());
          text.setAttribute('y', ((config.y / 100) * img.height).toString());
          text.setAttribute('font-size', `${config.fontSize}px`);
          text.setAttribute('font-family', config.fontFamily);
          text.setAttribute('fill', config.fontColor);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.setAttribute('font-weight', config.bold ? 'bold' : 'normal');
          text.setAttribute('font-style', config.italic ? 'italic' : 'normal');
          text.setAttribute('text-decoration', config.underline ? 'underline' : 'none');
          text.setAttribute('style', 'text-shadow: 0 0 4px rgba(255,255,255,0.8)');
          text.textContent = name;

          svg.appendChild(text);

          // Convert SVG to image
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);

          const svgImg = new Image();
          await new Promise((resolve) => {
            svgImg.onload = resolve;
            svgImg.src = svgUrl;
          });

          // Create canvas to composite image and SVG text
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;

          // Draw the base image
          ctx.drawImage(img, 0, 0);

          // Draw the SVG text on top
          ctx.drawImage(svgImg, 0, 0);

          // Clean up SVG URL
          URL.revokeObjectURL(svgUrl);

          // Convert canvas to image (PNG for quality)
          const finalImageData = canvas.toDataURL('image/png', 1.0);

          // Calculate dimensions to fit A4
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgRatio = img.width / img.height;
          const pageRatio = pageWidth / pageHeight;
          
          let imgWidth = pageWidth;
          let imgHeight = pageHeight;
          
          if (imgRatio > pageRatio) {
            imgHeight = pageWidth / imgRatio;
          } else {
            imgWidth = pageHeight * imgRatio;
          }

          // Center the image
          const x = (pageWidth - imgWidth) / 2;
          const y = (pageHeight - imgHeight) / 2;

          // Add final image with SVG text to PDF
          pdf.addImage(finalImageData, 'PNG', x, y, imgWidth, imgHeight);
        }

        // Add PDF to ZIP
        const pdfBlob = pdf.output('blob');
        zip.file(`${name}.pdf`, pdfBlob);

        // Update progress
        const currentProgress = Math.floor(((i + 1) / totalCards) * 100);
        setProgress(currentProgress);
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      setGeneratedZipUrl(zipUrl);
      setProgress(100);
      setIsComplete(true);
    } catch (err: any) {
      console.error('Error generating PDFs:', err);
      setError(err.message || 'Failed to generate PDFs. Please try again.');
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

              <p className="text-xs text-gray-500">
                The ZIP file contains all your personalized PDF cards
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
