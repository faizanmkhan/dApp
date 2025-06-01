
import { Award } from 'lucide-react';

interface SessionTrackerProps {
  completedSessions: number;
  targetSessions: number;
}

const SessionTracker = ({ completedSessions, targetSessions }: SessionTrackerProps) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Session Progress</h3>
        <Award className="w-6 h-6 text-yellow-400" />
      </div>
      
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedSessions / targetSessions) * 100}%` }}
          />
        </div>
        
        {/* Session dots */}
        <div className="flex justify-center space-x-3">
          {Array.from({ length: targetSessions }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < completedSessions
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-scale-in'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        
        <div className="text-center">
          <span className="text-2xl font-bold text-white">{completedSessions}</span>
          <span className="text-white/70">/{targetSessions} sessions</span>
        </div>
        
        {completedSessions === targetSessions && (
          <div className="text-center text-yellow-400 font-semibold animate-bounce-subtle">
            🎉 Ready for reward!
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTracker;
