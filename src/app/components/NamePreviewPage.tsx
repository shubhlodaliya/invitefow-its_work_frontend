import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageConfig } from "./NamePlacementEditor";

interface NamePreviewPageProps {
  names: string[];
  images: string[];
  imageConfigs: ImageConfig[];
  onNext: () => void;
  onBack: () => void;
}

export function NamePreviewPage({ names, images, imageConfigs, onNext, onBack }: NamePreviewPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const enabledConfigs = imageConfigs.filter(config => config.enabled);
  const currentName = names[currentIndex];

  useEffect(() => {
    generatePreviews();
  }, []);

  const generatePreviews = async () => {
    const previews: string[] = [];

    // Generate preview for first name only
    const name = names[0];
    
    for (const config of enabledConfigs) {
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = images[config.imageIndex];
      });

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      
      // Draw image
      ctx.drawImage(img, 0, 0);

      // Create SVG for text
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', img.width.toString());
      svg.setAttribute('height', img.height.toString());

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
      text.textContent = name;

      svg.appendChild(text);

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const svgImg = new Image();
      await new Promise((resolve) => {
        svgImg.onload = resolve;
        svgImg.src = svgUrl;
      });

      ctx.drawImage(svgImg, 0, 0);
      URL.revokeObjectURL(svgUrl);

      previews.push(canvas.toDataURL('image/png'));
    }

    setPreviewImages(previews);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < enabledConfigs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back to Edit
          </Button>
        </div>

        <h1 className="text-3xl mb-4">Preview - How Names Will Appear</h1>
        <p className="text-gray-600 mb-8">
          This shows how "{currentName}" will appear on your cards. All names will be positioned the same way.
        </p>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous Page
              </Button>

              <span className="text-sm font-medium">
                Page {currentIndex + 1} of {enabledConfigs.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex === enabledConfigs.length - 1}
              >
                Next Page
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {previewImages.length > 0 && (
              <div className="bg-white border-2 rounded-lg p-4 flex justify-center">
                <img
                  src={previewImages[currentIndex]}
                  alt={`Preview ${currentIndex + 1}`}
                  className="max-w-full max-h-[600px] object-contain"
                />
              </div>
            )}

            {previewImages.length === 0 && (
              <div className="bg-white border-2 rounded-lg p-12 text-center">
                <p className="text-gray-500">Generating preview...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            ✓ This is exactly how your {names.length} card{names.length > 1 ? 's' : ''} will look
          </p>
          <p className="text-sm text-blue-900 mt-1">
            ✓ Each person's name from your Excel file will be placed in the same position
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back - Change Settings
          </Button>
          <Button size="lg" onClick={onNext}>
            Looks Good - Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
