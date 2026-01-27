import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Slider } from "@/app/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Lock, Move, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";

interface NamePlacementEditorProps {
  images: string[];
  onNext: (configs: ImageConfig[]) => void;
  onBack: () => void;
}

export interface ImageConfig {
  imageIndex: number;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  locked: boolean;
  enabled: boolean;
}

export function NamePlacementEditor({ images, onNext, onBack }: NamePlacementEditorProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>(
    images.map((_, index) => ({
      imageIndex: index,
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: "Noto Sans Gujarati",
      fontColor: "#000000",
      bold: false,
      italic: false,
      underline: false,
      locked: false,
      enabled: false,
    }))
  );

  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentConfig = imageConfigs[currentImageIndex];

  const updateCurrentConfig = (updates: Partial<ImageConfig>) => {
    setImageConfigs((prev) =>
      prev.map((config, index) =>
        index === currentImageIndex ? { ...config, ...updates } : config
      )
    );
  };

  const handleMouseDown = () => {
    if (!currentConfig.locked) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && !currentConfig.locked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      updateCurrentConfig({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const generateZIP = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        images: imageConfigs
          .filter(config => config.enabled)
          .map(config => ({
            filename: `image${config.imageIndex + 1}.png`,
            imageBase64: images[config.imageIndex].split(',')[1], // Remove data URL prefix
            textBoxes: [
              {
                text: "Sample Name",
                x: config.x,
                y: config.y,
                fontSize: config.fontSize,
                color: config.fontColor,
                bold: config.bold,
                italic: config.italic,
                underline: config.underline
              },
              {
                text: "નમૂનો નામ",
                x: config.x,
                y: config.y + 5,
                fontSize: config.fontSize,
                color: config.fontColor,
                bold: config.bold,
                italic: config.italic,
                underline: config.underline
              }
            ]
          }))
      };

      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ZIP');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cards.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating ZIP:', error);
      alert('Failed to generate ZIP. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        </div>

        <h1 className="text-3xl mb-8">Place Names on Each Image</h1>

        {/* Image Navigation Tabs */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousImage}
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <Tabs value={currentImageIndex.toString()} onValueChange={(v) => setCurrentImageIndex(parseInt(v))}>
                <TabsList>
                  {images.map((_, index) => (
                    <TabsTrigger key={index} value={index.toString()} className="relative">
                      Image {index + 1}
                      {imageConfigs[index].enabled && imageConfigs[index].locked && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: Preview Canvas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">
                  Image {currentImageIndex + 1} Preview
                </h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Add name to this image:</Label>
                  <input
                    type="checkbox"
                    checked={currentConfig.enabled}
                    onChange={(e) => updateCurrentConfig({ enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div
                className={`relative bg-white border-2 rounded-lg overflow-hidden ${
                  currentConfig.enabled ? "border-gray-300 cursor-move" : "border-gray-200 opacity-50"
                }`}
                style={{ aspectRatio: "3/4", maxHeight: "600px" }}
                onMouseDown={currentConfig.enabled ? handleMouseDown : undefined}
                onMouseMove={currentConfig.enabled ? handleMouseMove : undefined}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                {currentConfig.enabled && (
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <text
                      x={`${currentConfig.x}%`}
                      y={`${currentConfig.y}%`}
                      fontSize={`${currentConfig.fontSize}px`}
                      fontFamily={currentConfig.fontFamily}
                      fill={currentConfig.fontColor}
                      fontWeight={currentConfig.bold ? "bold" : "normal"}
                      fontStyle={currentConfig.italic ? "italic" : "normal"}
                      textDecoration={currentConfig.underline ? "underline" : "none"}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ textShadow: "0 0 4px rgba(255,255,255,0.8)" }}
                    >
                      {currentConfig.fontFamily.includes('Gujarati') ? 'નમૂનો નામ' : 'Sample Name'}
                    </text>
                  </svg>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Controls */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg">Image {currentImageIndex + 1} Settings</h3>

                {!currentConfig.enabled && (
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-900">
                    Name placement is disabled for this image. Enable it to customize.
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Font Size: {currentConfig.fontSize}px</Label>
                  <Slider
                    value={[currentConfig.fontSize]}
                    onValueChange={([value]) => updateCurrentConfig({ fontSize: value })}
                    min={12}
                    max={72}
                    step={1}
                    disabled={!currentConfig.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={currentConfig.fontColor}
                      onChange={(e) => updateCurrentConfig({ fontColor: e.target.value })}
                      className="w-20 h-10 cursor-pointer"
                      disabled={!currentConfig.enabled}
                    />
                    <Input
                      type="text"
                      value={currentConfig.fontColor}
                      onChange={(e) => updateCurrentConfig({ fontColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                      disabled={!currentConfig.enabled}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={currentConfig.fontFamily}
                    onValueChange={(value) => updateCurrentConfig({ fontFamily: value })}
                    disabled={!currentConfig.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Noto Sans Gujarati">Noto Sans Gujarati</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Text Style</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={currentConfig.bold ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentConfig({ bold: !currentConfig.bold })}
                      disabled={!currentConfig.enabled}
                    >
                      <strong>B</strong>
                    </Button>
                    <Button
                      variant={currentConfig.italic ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentConfig({ italic: !currentConfig.italic })}
                      disabled={!currentConfig.enabled}
                    >
                      <em>I</em>
                    </Button>
                    <Button
                      variant={currentConfig.underline ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentConfig({ underline: !currentConfig.underline })}
                      disabled={!currentConfig.enabled}
                    >
                      <u>U</u>
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={currentConfig.locked ? "default" : "outline"}
                  onClick={() => updateCurrentConfig({ locked: !currentConfig.locked })}
                  disabled={!currentConfig.enabled}
                >
                  {currentConfig.locked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Position Locked
                    </>
                  ) : (
                    <>
                      <Move className="h-4 w-4 mr-2" />
                      Lock Position
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 space-y-2">
                <p>💡 <strong>Tips:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Drag the name to position it</li>
                  <li>Lock position when satisfied</li>
                  <li>Configure each page separately</li>
                  <li>Disable pages that don't need names</li>
                </ul>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={() => onNext(imageConfigs)}
              >
                Next - Merge Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
