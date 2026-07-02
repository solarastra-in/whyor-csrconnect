import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useVolunteer } from '@/src/contexts/VolunteerContext';
import { toast } from 'sonner';
import { SocialShare } from '@/src/components/SocialShare';

interface PostProjectSurveyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectName: string;
  onComplete: () => void;
}

export function PostProjectSurvey({ open, onOpenChange, projectId, projectName, onComplete }: PostProjectSurveyProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { addCommunityPoints } = useVolunteer();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Reward points (e.g., 50 points for feedback)
    addCommunityPoints(50);
    
    toast.success('Feedback Submitted!', {
      description: 'You earned 50 Community Points for sharing your experience.',
    });
    
    setIsSubmitting(false);
    setShowShare(true);
  };

  const handleShareClose = () => {
    setShowShare(false);
    setRating(0);
    setFeedback('');
    onComplete();
  };

  return (
    <>
      <Dialog open={open && !showShare} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Post-Project Survey</DialogTitle>
            <DialogDescription>
              Thank you for volunteering for <span className="font-semibold text-gray-900">{projectName}</span>! Please take a moment to share your feedback.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium text-gray-700">How would you rate this experience?</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`p-1 transition-colors ${
                      (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Any thoughts or highlights you'd like to share?</label>
              <Textarea
                placeholder="What went well? Any suggestions for next time? (Optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none h-24"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-center">
              <span className="text-sm text-blue-800 font-medium flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                Complete to earn 50 Community Points!
              </span>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
              {isSubmitting ? 'Submitting...' : 'Submit & Claim Points'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <SocialShare 
        open={showShare} 
        onOpenChange={handleShareClose} 
        projectName={projectName} 
        hoursEarned={4} // Hardcoded for demo purposes
      />
    </>
  );
}
