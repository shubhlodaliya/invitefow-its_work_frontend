import { useState, useRef, useEffect } from "react";
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
  names: string[];
  onNext: (configs: ImageConfig[]) => void;
  onBack: () => void;
}

export interface ImageConfig {
  imageIndex: number;
  x: number;
  y: number;
  fontSize: number;
  designHeight?: number;
  renderHeight?: number;
  renderWidth?: number;
  fontFamily: string;
  fontColor: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  locked: boolean;
  enabled: boolean;
  sampleText?: string;
  order?: number;
  extraText?: string;
  extraX?: number;
  extraY?: number;
}

export function NamePlacementEditor({ images, names, onNext, onBack }: NamePlacementEditorProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [displayOrder, setDisplayOrder] = useState<number[]>(() => images.map((_, idx) => idx));
  const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>(
    images.map((_, index) => ({
      imageIndex: index,
      x: 50,
      y: 50,
      fontSize: 24,
      designHeight: 850,
      renderHeight: 850,
      renderWidth: 850,
      fontFamily: "Noto Sans Gujarati",
      fontColor: "#000000",
      bold: false,
      italic: false,
      underline: false,
      locked: false,
      enabled: false,
      sampleText: names[0] || "Sample Name",
      order: index,
      extraText: undefined,
      extraX: 50,
      extraY: 60,
    }))
  );

  const firstName = names[0] || "Sample Name";

  const [isDragging, setIsDragging] = useState(false);
  const [draggingTarget, setDraggingTarget] = useState<'main' | 'extra' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [renderMetrics, setRenderMetrics] = useState<{ rw: number; rh: number; offsetX: number; offsetY: number } | null>(null);

  const computeRenderMetrics = () => {
    const container = containerRef.current;
    const imgEl = imgRef.current;
    if (!container || !imgEl) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = imgEl.naturalWidth || imgEl.width;
    const ih = imgEl.naturalHeight || imgEl.height;
    if (!cw || !ch || !iw || !ih) return;
    const imgAR = iw / ih;
    const contAR = cw / ch;
    let rw: number, rh: number, offsetX = 0, offsetY = 0;
    if (imgAR > contAR) {
      // Image fits by width
      rw = cw;
      rh = cw / imgAR;
      offsetY = (ch - rh) / 2;
    } else {
      // Image fits by height
      rh = ch;
      rw = ch * imgAR;
      offsetX = (cw - rw) / 2;
    }
    setRenderMetrics({ rw, rh, offsetX, offsetY });

    // Persist the rendered height used during placement so PDF can scale font size consistently
    const cfg = imageConfigs[displayOrder[currentImageIndex]];
    if (cfg && (cfg.designHeight !== rh || cfg.renderHeight !== rh || cfg.renderWidth !== rw)) {
      updateCurrentConfig({ designHeight: rh, renderHeight: rh, renderWidth: rw });
    }
  };

  useEffect(() => {
    computeRenderMetrics();
    const handler = () => computeRenderMetrics();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageIndex]);

  const currentImageRealIndex = displayOrder[currentImageIndex];
  const currentConfig = imageConfigs[currentImageRealIndex];

  const updateCurrentConfig = (updates: Partial<ImageConfig>) => {
    setImageConfigs((prev) =>
      prev.map((config, index) =>
        index === currentImageRealIndex ? { ...config, ...updates } : config
      )
    );
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, target: 'main' | 'extra') => {
    if (!currentConfig.locked) {
      e.stopPropagation();
      setIsDragging(true);
      setDraggingTarget(target);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && draggingTarget && !currentConfig.locked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const rm = renderMetrics;
      if (!rm) return;
      const localX = e.clientX - rect.left - rm.offsetX;
      const localY = e.clientY - rect.top - rm.offsetY;
      const x = Math.max(0, Math.min(100, (localX / rm.rw) * 100));
      const y = Math.max(0, Math.min(100, (localY / rm.rh) * 100));
      
      if (draggingTarget === 'main') {
        updateCurrentConfig({ x, y });
      } else if (draggingTarget === 'extra') {
        updateCurrentConfig({ extraX: x, extraY: y });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggingTarget(null);
  };

  const setExtraText = (value?: string) => {
    updateCurrentConfig({ extraText: value || undefined });
  };

  const togglePreset = (preset: string) => {
    if (currentConfig.extraText === preset) {
      setExtraText(undefined);
    } else {
      setExtraText(preset);
    }
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
          <Card className="flex items-center justify-center">
            <CardContent className="p-6 w-full flex flex-col items-center">
              <div className="flex items-center justify-between mb-4 w-full">
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
                  currentConfig.enabled || currentConfig.extraText ? "border-gray-300" : "border-gray-200 opacity-50"
                }`}
                style={{ aspectRatio: "3/4", maxHeight: "850px", width: "100%" }}
                onMouseMove={currentConfig.enabled || currentConfig.extraText ? handleMouseMove : undefined}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                ref={containerRef}
              >
                <img
                  src={images[currentImageRealIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  ref={imgRef}
                  onLoad={computeRenderMetrics}
                />
                {renderMetrics && (
                  <>
                    {currentConfig.enabled && (
                      <svg
                        className="absolute"
                        style={{ left: renderMetrics.offsetX, top: renderMetrics.offsetY, width: renderMetrics.rw, height: renderMetrics.rh, pointerEvents: currentConfig.locked ? "none" : "auto" }}
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
                          style={{ textShadow: "0 0 4px rgba(255,255,255,0.8)", cursor: currentConfig.locked ? "default" : "move" }}
                          onMouseDown={(e) => handleMouseDown(e as any, 'main')}
                        >
                          {currentConfig.sampleText || firstName}
                        </text>
                      </svg>
                    )}
                    {currentConfig.extraText && (
                      <svg
                        className="absolute"
                        style={{ left: renderMetrics.offsetX, top: renderMetrics.offsetY, width: renderMetrics.rw, height: renderMetrics.rh, pointerEvents: currentConfig.locked ? "none" : "auto" }}
                      >
                        <text
                          x={`${currentConfig.extraX ?? 50}%`}
                          y={`${currentConfig.extraY ?? 60}%`}
                          fontSize={`${currentConfig.fontSize}px`}
                          fontFamily={currentConfig.fontFamily}
                          fill={currentConfig.fontColor}
                          fontWeight={currentConfig.bold ? "bold" : "normal"}
                          fontStyle={currentConfig.italic ? "italic" : "normal"}
                          textDecoration={currentConfig.underline ? "underline" : "none"}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{ textShadow: "0 0 4px rgba(255,255,255,0.8)", cursor: currentConfig.locked ? "default" : "move" }}
                          onMouseDown={(e) => handleMouseDown(e as any, 'extra')}
                        >
                          {currentConfig.extraText}
                        </text>
                      </svg>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Controls */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg">Image {currentImageIndex + 1} Settings</h3>

                {!currentConfig.enabled && !currentConfig.extraText && (
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
                    disabled={!currentConfig.enabled && !currentConfig.extraText}
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
                      disabled={!currentConfig.enabled && !currentConfig.extraText}
                    />
                    <Input
                      type="text"
                      value={currentConfig.fontColor}
                      onChange={(e) => updateCurrentConfig({ fontColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                      disabled={!currentConfig.enabled && !currentConfig.extraText}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={currentConfig.fontFamily}
                    onValueChange={(value) => updateCurrentConfig({ fontFamily: value })}
                    disabled={!currentConfig.enabled && !currentConfig.extraText}
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
                      disabled={!currentConfig.enabled && !currentConfig.extraText}
                    >
                      <strong>B</strong>
                    </Button>
                    <Button
                      variant={currentConfig.italic ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentConfig({ italic: !currentConfig.italic })}
                      disabled={!currentConfig.enabled && !currentConfig.extraText}
                    >
                      <em>I</em>
                    </Button>
                    <Button
                      variant={currentConfig.underline ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateCurrentConfig({ underline: !currentConfig.underline })}
                      disabled={!currentConfig.enabled && !currentConfig.extraText}
                    >
                      <u>U</u>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Text (Optional)</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={currentConfig.extraText === "સર્વો" ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePreset("સર્વો")}
                    >
                      સર્વો
                    </Button>
                    <Button
                      variant={currentConfig.extraText === "સજોડે" ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePreset("સજોડે")}
                    >
                      સજોડે
                    </Button>
                    <Button
                      variant={currentConfig.extraText && currentConfig.extraText !== "સર્વો" && currentConfig.extraText !== "સજોડે" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setExtraText(currentConfig.extraText ? undefined : "")}
                    >
                      Add text box
                    </Button>
                  </div>
                  <Input
                    value={currentConfig.extraText || ""}
                    onChange={(e) => setExtraText(e.target.value || undefined)}
                    placeholder="Write custom text"
                  />
                </div>

                <Button
                  className="w-full"
                  variant={currentConfig.locked ? "default" : "outline"}
                  onClick={() => updateCurrentConfig({ locked: !currentConfig.locked })}
                  disabled={!currentConfig.enabled && !currentConfig.extraText}
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
                onClick={() => {
                  const orderedConfigs = displayOrder.map((idx, order) => ({ ...imageConfigs[idx], order }));
                  onNext(orderedConfigs);
                }}
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
