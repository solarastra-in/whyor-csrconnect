import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Scan } from 'lucide-react';

interface ProjectQRCodeProps {
  projectId: string;
  projectName: string;
}

export function ProjectQRCode({ projectId, projectName }: ProjectQRCodeProps) {
  // Generate a check-in URL based on the project ID
  const checkInUrl = `${window.location.origin}/check-in/${projectId}`;

  return (
    <Card className="border border-indigo-100 shadow-sm max-w-sm mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-center gap-2">
          <Scan className="w-5 h-5 text-indigo-600" />
          Attendance QR Code
        </CardTitle>
        <CardDescription>
          Project leads: Scan to verify employee check-in for {projectName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white border-2 border-indigo-50 rounded-xl shadow-inner">
          <QRCodeSVG 
            value={checkInUrl} 
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#1e1b4b" // Deep indigo
          />
        </div>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="w-full text-indigo-700 border-indigo-200 hover:bg-indigo-50">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
