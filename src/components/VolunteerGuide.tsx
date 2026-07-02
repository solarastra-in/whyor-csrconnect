import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Search, Trophy, CheckCircle2 } from 'lucide-react';

export function VolunteerGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if this is the first time the user has logged in
    const hasSeenGuide = localStorage.getItem('hasSeenVolunteerGuide');
    if (!hasSeenGuide) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('hasSeenVolunteerGuide', 'true');
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const steps = [
    {
      title: "Welcome to Your Hub",
      description: "Ready to make an impact? This portal is your central place for discovering causes, managing your volunteer profile, and tracking your positive influence.",
      icon: <Heart className="w-12 h-12 text-pink-500 mb-4 mx-auto" />
    },
    {
      title: "Discovery Feed",
      description: "Browse the Discovery Feed to find a curated list of volunteering opportunities. Filter by interests, location, or causes you care about to find the perfect match.",
      icon: <Search className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
    },
    {
      title: "Impact Tracking",
      description: "Log your hours and track your impact over time. See how your contributions add up, earn badges, and watch your positive influence grow on your dashboard.",
      icon: <Trophy className="w-12 h-12 text-amber-500 mb-4 mx-auto" />
    },
    {
      title: "Profile Settings",
      description: "Customize your experience in Profile Settings. Set your interests, manage notification preferences, and keep your volunteer resume up to date.",
      icon: <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 mx-auto" />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center pt-6 pb-2">
            {steps[step].icon}
            <DialogTitle className="text-2xl mb-2">{steps[step].title}</DialogTitle>
            <DialogDescription className="text-base text-slate-600">
              {steps[step].description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all ${idx === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}
            />
          ))}
        </div>

        <DialogFooter className="sm:justify-between flex-row">
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="text-slate-500"
          >
            Skip Tour
          </Button>
          <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {step === steps.length - 1 ? "Get Started" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
