import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, Trophy, ArrowRight, Star } from 'lucide-react';

const REWARDS = [
  { label: '₹500 Match', color: '#3b82f6' }, // blue-500
  { label: '₹1000 Match', color: '#10b981' }, // emerald-500
  { label: 'VIP Badge', color: '#f59e0b' }, // amber-500
  { label: '₹2000 Match', color: '#ef4444' }, // red-500
  { label: 'Extra PTO', color: '#8b5cf6' }, // violet-500
  { label: '₹5000 Gift', color: '#ec4899' }, // pink-500
];

export function GamifiedEngagement() {
  const [progress, setProgress] = useState(85);
  const goal = 100;
  const isUnlocked = progress >= goal;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleSimulateDonation = () => {
    setProgress(Math.min(100, progress + 15));
  };

  const handleSpin = () => {
    if (spinning || result || !isUnlocked) return;
    setSpinning(true);
    
    // Spin between 5 to 10 full rotations plus a random segment
    const segmentAngle = 360 / REWARDS.length;
    const randomSegment = Math.floor(Math.random() * REWARDS.length);
    
    // Add offset so it lands nicely in the middle of a segment
    const extraDegrees = (randomSegment * segmentAngle) + (segmentAngle / 2); 
    const totalRotation = rotation + (360 * 5) + (360 - extraDegrees); // 360 - to account for clockwise rotation vs top pointer
    
    setRotation(totalRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setResult(REWARDS[randomSegment].label);
    }, 4000); // matches CSS transition duration
  };

  // Generate conic gradient for the wheel
  const wheelGradient = `conic-gradient(from 0deg, ${REWARDS.map((r, i) => 
    `${r.color} ${i * (360 / REWARDS.length)}deg ${(i + 1) * (360 / REWARDS.length)}deg`
  ).join(', ')})`;

  return (
    <Card className="overflow-hidden border-2 border-indigo-100 shadow-sm relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-12 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Gift className="h-5 w-5 text-indigo-500" />
              Impact Rewards Wheel
            </CardTitle>
            <CardDescription className="mt-1">
              Reach your monthly matching goal to spin the wheel for bonus charity funds!
            </CardDescription>
          </div>
          {result && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1 animate-bounce">
              <Star className="w-4 h-4 fill-current" /> {result}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
          
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-700">Monthly Match Progress</span>
                <span className={isUnlocked ? "text-green-600" : "text-indigo-600"}>
                  {progress}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className={`h-3 ${isUnlocked ? '[&>div]:bg-green-500' : '[&>div]:bg-indigo-500'}`} 
              />
              <p className="text-xs text-gray-500">
                {isUnlocked 
                  ? "Goal reached! You've unlocked a spin." 
                  : "Donate ₹1,500 more to unlock this month's spin."}
              </p>
            </div>

            {!isUnlocked ? (
              <Button onClick={handleSimulateDonation} variant="outline" className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                Simulate Donation <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSpin} 
                disabled={spinning || !!result}
                className={`w-full text-white shadow-md ${result ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'}`}
              >
                {spinning ? 'Spinning...' : result ? 'Prize Claimed!' : 'Spin the Wheel!'}
                {!spinning && !result && <Sparkles className="w-4 h-4 ml-2" />}
              </Button>
            )}

            {result && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900">Congratulations!</h4>
                  <p className="text-sm text-green-800 mt-1">
                    You won a <strong>{result}</strong>. It has been automatically added to your giving account balance.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 flex justify-center relative py-4">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
              <div className="w-6 h-8 bg-gray-900 rounded-t-sm" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
            </div>

            {/* The Wheel */}
            <div 
              className={`w-64 h-64 rounded-full border-4 border-gray-900 shadow-xl relative overflow-hidden transition-all ease-[cubic-bezier(0.1,0.7,0.1,1)] duration-[4000ms] ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}
              style={{ 
                background: wheelGradient,
                transform: `rotate(${rotation}deg)` 
              }}
            >
              {/* Labels (rotated) */}
              {REWARDS.map((reward, i) => {
                const angle = (i * (360 / REWARDS.length)) + (180 / REWARDS.length);
                return (
                  <div 
                    key={i}
                    className="absolute inset-0 flex justify-center w-full h-full text-white font-bold text-xs"
                    style={{ 
                      transform: `rotate(${angle}deg)`,
                      textShadow: '0px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div className="pt-4">{reward.label}</div>
                  </div>
                );
              })}
              
              {/* Inner Circle / Hub */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-gray-900 z-10 flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 bg-gray-300 rounded-full border border-gray-400"></div>
              </div>
            </div>
            
            {/* Overlay if locked */}
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-gray-900/80 text-white px-4 py-2 rounded-full font-medium text-sm backdrop-blur-sm flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Locked
                </div>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
