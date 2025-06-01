
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Coins } from 'lucide-react';

interface RewardDisplayProps {
  canClaim: boolean;
  onClaim: () => void;
  totalTokens: number;
}

const RewardDisplay = ({ canClaim, onClaim, totalTokens }: RewardDisplayProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClaim = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClaim();
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Rewards</h3>
        <Coins className="w-6 h-6 text-yellow-400" />
      </div>
      
      <div className="space-y-4">
        {/* Token display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {totalTokens} WORLD
          </div>
          <div className="text-white/70 text-sm">Total Tokens Earned</div>
        </div>
        
        {/* Claim button */}
        <div className="text-center">
          {canClaim ? (
            <Button
              onClick={handleClaim}
              disabled={isAnimating}
              className={`bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                isAnimating ? 'animate-pulse-slow' : ''
              }`}
            >
              <Gift className="w-5 h-5 mr-2" />
              {isAnimating ? 'Claiming...' : 'Claim 10 WORLD'}
            </Button>
          ) : (
            <div className="text-white/50 text-sm">
              Complete 3 sessions to claim rewards
            </div>
          )}
        </div>
        
        {/* Reward info */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-white/70 text-xs text-center">
            🚀 Web3 Integration
            <br />
            Tokens will be minted on blockchain
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardDisplay;
