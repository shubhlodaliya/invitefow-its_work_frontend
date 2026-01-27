import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { PlusCircle, Download, Calendar, FileText } from "lucide-react";

interface Project {
  id: string;
  name: string;
  nameCount: number;
  date: string;
}

import { useParams, Navigate } from "react-router-dom";

interface DashboardPageProps {
  onCreateNew: () => void;
  onLogout: () => void;
  userEmail: string;
  userId: string;
}

const mockProjects: Project[] = [
  { id: "1", name: "Raj & Priya Wedding", nameCount: 150, date: "2024-01-15" },
  { id: "2", name: "Kumar Family Event", nameCount: 85, date: "2024-01-10" },
  { id: "3", name: "Reception Cards", nameCount: 200, date: "2024-01-05" },
];

export function DashboardPage({ onCreateNew, onLogout, userEmail }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">💍</div>
            <h1 className="text-xl">Wedding Card PDF Generator</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">Welcome, {userEmail}</div>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button size="lg" onClick={onCreateNew} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Card Project
          </Button>
        </div>

        {/* Project History */}
        <div>
          <h2 className="text-2xl mb-4">Project History</h2>
          <div className="grid gap-4">
            {mockProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg">{project.name}</h3>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>{project.nameCount} names</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
