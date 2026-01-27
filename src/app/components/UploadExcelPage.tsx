import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import { read, utils } from "xlsx";

interface UploadExcelPageProps {
  onNext: (names: string[]) => void;
  onBack: () => void;
}

export function UploadExcelPage({ onNext, onBack }: UploadExcelPageProps) {
  const [names, setNames] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[] = utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Extract names from first column, skip header
          const extractedNames = jsonData
            .slice(1)
            .map((row: any) => row[0])
            .filter((name: any) => name && typeof name === "string");
          
          setNames(extractedNames);
          setIsUploaded(true);
        } catch (error) {
          console.error("Error reading Excel file:", error);
          alert("Error reading file. Please make sure it's a valid Excel file.");
        }
      };
      
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  });

  const handleNext = () => {
    if (names.length > 0) {
      onNext(names);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back to Dashboard
          </Button>
        </div>

        <h1 className="text-3xl mb-8">Upload Guest Name Excel File</h1>

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
                      <p className="text-lg mb-1">✔ Names loaded successfully</p>
                      <p className="text-sm text-gray-600">{fileName}</p>
                      <p className="text-sm text-gray-600">{names.length} names found</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-16 w-16 text-gray-400" />
                    <div>
                      <p className="text-lg mb-1">
                        {isDragActive ? "Drop the file here" : "Drag & drop Excel file here"}
                      </p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Supported formats: .xlsx, .xls
            </p>
          </CardContent>
        </Card>

        {isUploaded && names.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg mb-4">Preview - First 5 Names</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {names.slice(0, 5).map((name, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {names.length > 5 && `... and ${names.length - 5} more names`}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button size="lg" onClick={handleNext} disabled={!isUploaded || names.length === 0}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
