import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SocialShareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  hoursEarned: number;
}

export function SocialShare({ open, onOpenChange, projectName, hoursEarned }: SocialShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // In a real app, use html2canvas or similar to convert the DOM node to an image
    // For this prototype, we'll just show an alert
    alert('Image downloaded! You can now share it on your social networks.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Impact!</DialogTitle>
          <DialogDescription>
            You've completed your volunteer shift. Share your achievement with your network to inspire others!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center justify-center">
          {/* Branded Image Summary Container */}
          <Card 
            ref={cardRef} 
            className="w-[300px] h-[300px] relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center p-6 text-center shadow-lg border-0"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            
            <div className="z-10 flex flex-col items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">I Volunteered!</h3>
                <p className="text-sm text-indigo-100 mb-4">{projectName}</p>
              </div>
              <div className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-lg shadow-md">
                {hoursEarned} Hours Contributed
              </div>
              <p className="text-xs text-indigo-200 mt-2 font-medium tracking-wide uppercase">
                #TechForGood #CorporateSocialResponsibility
              </p>
            </div>
          </Card>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 justify-center sm:justify-between w-full">
          <div className="flex gap-2 w-full sm:w-auto justify-center">
            <Button variant="outline" size="icon" className="text-blue-600 border-blue-200 hover:bg-blue-50" title="Share to LinkedIn">
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-blue-400 border-blue-200 hover:bg-blue-50" title="Share to Twitter">
              <Twitter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-pink-600 border-pink-200 hover:bg-pink-50" title="Share to Instagram">
              <Instagram className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={handleDownload} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4 mr-2" /> Download Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
