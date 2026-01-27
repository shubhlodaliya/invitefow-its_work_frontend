import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { FileText, Files } from "lucide-react";

interface MergeSettingsPageProps {
  namesCount: number;
  pageCount: number;
  onNext: (settings: MergeSettings) => void;
  onBack: () => void;
}

export interface MergeSettings {
  mergePages: boolean;
  namingPattern: string;
}

export function MergeSettingsPage({ namesCount, pageCount, onNext, onBack }: MergeSettingsPageProps) {
  const [settings, setSettings] = useState<MergeSettings>({
    mergePages: true,
    namingPattern: "name",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
        </div>

        <h1 className="text-3xl mb-8">Merge & Output Settings</h1>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label className="text-lg mb-4 block">PDF Output Options</Label>
              <RadioGroup
                value={settings.mergePages ? "merge" : "separate"}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, mergePages: value === "merge" }))
                }
              >
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <RadioGroupItem value="merge" id="merge" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="merge" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Files className="h-5 w-5" />
                          <span className="text-base">Merge all pages per guest</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Each PDF will contain all {pageCount} pages for one guest
                        </p>
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <RadioGroupItem value="separate" id="separate" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="separate" className="cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-5 w-5" />
                          <span className="text-base">Separate pages</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Create separate PDFs for each page
                        </p>
                      </Label>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="border-t pt-6">
              <Label className="text-lg mb-4 block">File Naming Pattern</Label>
              <RadioGroup
                value={settings.namingPattern}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, namingPattern: value }))}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="name" id="name" />
                    <Label htmlFor="name" className="cursor-pointer">
                      Use guest name (e.g., Amit_Patel.pdf)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="number" id="number" />
                    <Label htmlFor="number" className="cursor-pointer">
                      Use numbers (e.g., Card_001.pdf)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total Names</p>
                <p className="text-2xl">{namesCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Pages per PDF</p>
                <p className="text-2xl">{settings.mergePages ? pageCount : 1}</p>
              </div>
              <div>
                <p className="text-gray-600">Total PDFs</p>
                <p className="text-2xl">{settings.mergePages ? namesCount : namesCount * pageCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Naming Pattern</p>
                <p className="text-lg">
                  {settings.namingPattern === "name" ? "Guest_Name.pdf" : "Card_###.pdf"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" onClick={() => onNext(settings)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
