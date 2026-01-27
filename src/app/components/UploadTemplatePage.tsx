import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Upload, Image, CheckCircle, X } from "lucide-react";

interface UploadTemplatePageProps {
  onNext: (images: string[]) => void;
  onBack: () => void;
}

export function UploadTemplatePage({ onNext, onBack }: UploadTemplatePageProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploaded, setIsUploaded] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const imagePromises = acceptedFiles.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const imageDataUrls = await Promise.all(imagePromises);
      setImages(imageDataUrls);
      setIsUploaded(true);
    } catch (error) {
      console.error("Error processing images:", error);
      alert("Error processing image files. Please try again.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/svg+xml": [".svg"],
      "image/webp": [".webp"],
    },
    maxFiles: 10,
  });

  const handleNext = () => {
    if (images.length > 0) {
      onNext(images);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (newImages.length === 0) {
      setIsUploaded(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        </div>

        <h1 className="text-3xl mb-8">Upload Wedding Card Images</h1>

        <Card className="mb-6">
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : isUploaded
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                {isUploaded ? (
                  <>
                    <CheckCircle className="h-16 w-16 text-green-600" />
                    <div>
                      <p className="text-lg mb-1">✔ Images uploaded successfully</p>
                      <p className="text-sm text-gray-600">{images.length} images uploaded</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages([]);
                          setIsUploaded(false);
                        }}
                      >
                        Change Images
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-16 w-16 text-gray-400" />
                    <div>
                      <p className="text-lg mb-1">
                        {isDragActive ? "Drop the images here" : "Drag & drop image files here"}
                      </p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 text-center">
                ✓ Supported formats: JPG, PNG, SVG, WEBP (max 10 images)
              </p>
              <p className="text-sm text-gray-600 text-center">
                ✓ Upload your wedding card images
              </p>
            </div>
          </CardContent>
        </Card>

        {isUploaded && images.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg mb-4">Image Previews</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <p className="text-xs text-center mt-1">Image {index + 1}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button size="lg" onClick={handleNext} disabled={!isUploaded || images.length === 0}>
            Next - Place Names on Images
          </Button>
        </div>
      </div>
    </div>
  );
}
