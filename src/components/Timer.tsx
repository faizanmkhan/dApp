
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerProps {
  onSessionComplete: () => void;
  isActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const Timer = ({ onSessionComplete, isActive, onStart, onPause, onReset }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const TOTAL_TIME = 25 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            onSessionComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleReset = () => {
    setTimeLeft(TOTAL_TIME);
    onReset();
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-sm mx-auto">
      {/* Circular Progress Timer - Smaller for mobile */}
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 220 220">
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r="100"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="110"
            cy="110"
            r="100"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl md:text-6xl font-light text-white mb-1 md:mb-2 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm md:text-lg text-white/70">
            {timeLeft === 0 ? 'Session Complete!' : 'Focus Time'}
          </div>
        </div>
      </div>

      {/* Control buttons - Mobile optimized */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full px-4">
        {!isActive ? (
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            disabled={timeLeft === 0}
          >
            <Play className="w-5 h-5 mr-2" />
            {timeLeft === TOTAL_TIME ? 'Start Focus' : 'Resume'}
          </Button>
        ) : (
          <Button
            onClick={onPause}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
          >
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
        )}
        
        <Button
          onClick={handleReset}
          size="lg"
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Timer;
