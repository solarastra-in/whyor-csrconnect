import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Zap, Dices, Sparkles, PartyPopper, Coins } from 'lucide-react';

interface DonationGamesProps {
  onMatchDetermined: (multiplier: number, gameName: string) => void;
}

const multipliers = [1.2, 1.5, 1.8, 2.0];

export function SpinWheelGame({ onComplete }: { onComplete: (multiplier: number) => void }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning || result) return;
    setSpinning(true);
    
    // Random target multiplier
    const targetIdx = Math.floor(Math.random() * multipliers.length);
    const targetMultiplier = multipliers[targetIdx];
    
    // Each segment is 90 degrees (for 4 options)
    const segmentAngle = 360 / multipliers.length;
    // Calculate rotation to land on the center of the target segment
    // We want the top (0 degrees) to be the winning segment after rotation
    const baseSpins = 5 * 360; // Spin 5 times
    // To land target at the top, rotation must end at (360 - targetIdx * segmentAngle)
    const targetRotation = baseSpins + (360 - (targetIdx * segmentAngle));

    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(targetMultiplier);
      onComplete(targetMultiplier);
    }, 3000); // match transition duration
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-48">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 drop-shadow-lg">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 relative animate-bounce">
            <div className="absolute -top-[22px] -left-[10px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-red-400"></div>
          </div>
        </div>
        
        {/* Wheel */}
        <motion.div 
          className="w-full h-full rounded-full border-[6px] border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] overflow-hidden relative bg-white"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {multipliers.map((m, i) => {
            const colors = [
              'bg-gradient-to-br from-pink-500 to-rose-600',
              'bg-gradient-to-br from-purple-500 to-indigo-600',
              'bg-gradient-to-br from-amber-400 to-orange-500',
              'bg-gradient-to-br from-emerald-400 to-teal-500'
            ];
            return (
            <div 
              key={m}
              className={`absolute top-0 left-0 w-full h-full flex justify-center items-start pt-4 text-white font-black text-xl drop-shadow-md ${colors[i]}`}
              style={{ 
                transform: `rotate(${i * 90}deg)`,
                clipPath: 'polygon(50% 50%, 0 0, 100% 0)'
              }}
            >
              <span className="transform -translate-y-2">{m}x</span>
            </div>
          )})}
          {/* Inner circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-amber-400 rounded-full z-10 border-[3px] border-white shadow-inner flex items-center justify-center">
            <div className="w-4 h-4 bg-amber-200 rounded-full shadow-sm"></div>
          </div>
        </motion.div>
      </div>
      
      {!result ? (
        <Button onClick={spin} disabled={spinning} className="w-full font-bold text-lg h-12 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600">
          {spinning ? 'Spinning...' : <><PartyPopper className="mr-2 h-5 w-5" /> Spin the Wheel!</>}
        </Button>
      ) : (
        <div className="text-center animate-in fade-in zoom-in duration-500 space-y-2 relative">
          <PartyPopper className="absolute -left-8 -top-4 h-8 w-8 text-amber-500 animate-bounce" />
          <PartyPopper className="absolute -right-8 -top-4 h-8 w-8 text-pink-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">You Won</p>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-sm">
            {result}x Match!
          </div>
          <p className="text-indigo-600 font-medium">Incredible impact!</p>
        </div>
      )}
    </div>
  );
}

export function ScratchCardGame({ onComplete }: { onComplete: (multiplier: number) => void }) {
  const [scratched, setScratched] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const scratch = () => {
    if (scratched) return;
    setScratched(true);
    const targetMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    setResult(targetMultiplier);
    
    // Small delay to simulate scratching
    setTimeout(() => {
      onComplete(targetMultiplier);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full relative">
      <div 
        className={`w-full max-w-[240px] aspect-video relative rounded-xl overflow-hidden cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.2)] group border-[3px] border-amber-300 transform transition-all duration-300 ${scratched ? 'scale-110' : 'hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]'}`}
        onClick={scratch}
      >
        <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 ${scratched ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 z-0`}>
           <div className="text-center space-y-1">
             <Sparkles className="h-6 w-6 text-amber-500 mx-auto animate-pulse" />
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Match Revealed</p>
             <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">{result}x</p>
           </div>
        </div>
        
        <div className={`absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 flex flex-col items-center justify-center text-white ${scratched ? 'opacity-0 scale-125 blur-md pointer-events-none' : 'opacity-100'} transition-all duration-1000 z-10 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
          <Coins className="h-10 w-10 mb-2 drop-shadow-md group-hover:scale-110 transition-transform duration-300 relative z-10" />
          <span className="font-black tracking-widest text-lg drop-shadow-md relative z-10">SCRATCH</span>
          <span className="text-[10px] uppercase font-semibold opacity-90 tracking-widest mt-1 relative z-10">Reveal your match</span>
        </div>
      </div>
      {scratched && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
          <div className="w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 blur-[60px] opacity-20 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

export function DonationGamification({ onMatchDetermined }: DonationGamesProps) {
  const [activeGame, setActiveGame] = useState<'spin' | 'scratch' | null>(null);

  if (activeGame === 'spin') {
    return <SpinWheelGame onComplete={(m) => onMatchDetermined(m, 'Spin the Wheel')} />;
  }

  if (activeGame === 'scratch') {
    return <ScratchCardGame onComplete={(m) => onMatchDetermined(m, 'Scratch Card')} />;
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">Don't just donate, amplify your impact! Play a mini-game to reveal your company match multiplier (up to 2x!).</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-purple-400 hover:shadow-lg transition-all group overflow-hidden border-2 border-transparent hover:scale-105" onClick={() => setActiveGame('spin')}>
          <CardContent className="p-0 flex flex-col items-center text-center relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 flex flex-col items-center relative z-10 w-full h-full">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform shadow-inner border border-purple-200">
                <Dices className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-sm text-gray-900">Spin the Wheel</h4>
              <p className="text-xs text-gray-500 mt-1">Test your luck on the big wheel!</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:border-amber-400 hover:shadow-lg transition-all group overflow-hidden border-2 border-transparent hover:scale-105" onClick={() => setActiveGame('scratch')}>
          <CardContent className="p-0 flex flex-col items-center text-center relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 flex flex-col items-center relative z-10 w-full h-full">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-110 transition-transform shadow-inner border border-amber-200">
                <Sparkles className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-sm text-gray-900">Scratch Card</h4>
              <p className="text-xs text-gray-500 mt-1">Reveal your hidden multiplier.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
