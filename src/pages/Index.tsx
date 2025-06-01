
import { useState, useEffect } from 'react';
import Timer from '../components/Timer';
import SessionTracker from '../components/SessionTracker';
import RewardDisplay from '../components/RewardDisplay';
import { useToast } from '@/hooks/use-toast';
import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

const verifyPayload: VerifyCommandInput = {
	action: 'voting-action', // This is your action ID from the Developer Portal
	verification_level: VerificationLevel.Orb, // Orb | Device
}

const handleVerify = async () => {
	if (!MiniKit.isInstalled()) {
		return
	}
	// World App will open a drawer prompting the user to confirm the operation, promise is resolved once user confirms or cancels
	const {finalPayload} = await MiniKit.commandsAsync.verify(verifyPayload)
		if (finalPayload.status === 'error') {
			return console.log('Error payload', finalPayload)
		}

		// Verify the proof in the backend
		const verifyResponse = await fetch('/api/verify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
			payload: finalPayload as ISuccessResult, // Parses only the fields we need to verify
			action: 'start-timer',
		}),
	})

	// TODO: Handle Success!
	const verifyResponseJson = await verifyResponse.json()
	if (verifyResponseJson.status === 200) {
		console.log('Verification success!')
	}  else {
    console.error('Backend verification failed:', result)
} }

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const { toast } = useToast();
  
  const TARGET_SESSIONS = 3;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('focusApp_completedSessions');
    const savedTokens = localStorage.getItem('focusApp_totalTokens');
    
    if (savedSessions) setCompletedSessions(parseInt(savedSessions));
    if (savedTokens) setTotalTokens(parseInt(savedTokens));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('focusApp_completedSessions', completedSessions.toString());
  }, [completedSessions]);

  useEffect(() => {
    localStorage.setItem('focusApp_totalTokens', totalTokens.toString());
  }, [totalTokens]);

  const handleSessionComplete = () => {
    setIsActive(false);
    const newCompletedSessions = completedSessions + 1;
    setCompletedSessions(newCompletedSessions);
    
    toast({
      title: "🎉 Session Complete!",
      description: "Great job staying focused for 25 minutes!",
    });

    // Show special message when reaching target
    if (newCompletedSessions === TARGET_SESSIONS) {
      setTimeout(() => {
        toast({
          title: "🚀 Milestone Reached!",
          description: "You can now claim your FOCUS tokens!",
        });
      }, 1500);
    }
  };

  const handleClaimReward = () => {
    setTotalTokens(prev => prev + 10);
    setCompletedSessions(0); // Reset session counter
    
    toast({
      title: "🎁 Reward Claimed!",
      description: "10 FOCUS tokens added to your wallet!",
    });
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => setIsActive(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 safe-area-inset">
        {/* Header - Optimized for mobile */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Focus World
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto px-2">
            Stay focused, earn tokens. Complete three sessions and get rewarded.
          </p>
        </div>

        {/* Main content - Mobile-first layout */}
        <div className="space-y-6">
          {/* Timer - Full width on mobile */}
          <div className="flex justify-center">
            <Timer
              onSessionComplete={handleSessionComplete}
              isActive={isActive}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
            />
          </div>

          {/* Session Tracker and Rewards - Stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SessionTracker 
              completedSessions={completedSessions}
              targetSessions={TARGET_SESSIONS}
            />
            <RewardDisplay
              canClaim={completedSessions >= TARGET_SESSIONS}
              onClaim={handleClaimReward}
              totalTokens={totalTokens}
            />
          </div>
        </div>

        {/* Tips section - Compact for mobile */}
        <div className="mt-12">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-semibold text-white mb-4 text-center">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/70">
              <div className="text-center space-y-2">
                <div className="text-2xl md:text-3xl">⏰</div>
                <div className="font-semibold text-sm md:text-base">25-Minute Sessions</div>
                <div className="text-xs md:text-sm">Focus for 25 minutes using the dApp</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl md:text-3xl">🎯</div>
                <div className="font-semibold text-sm md:text-base">Track Progress</div>
                <div className="text-xs md:text-sm">Complete 3 sessions to unlock token rewards</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl md:text-3xl">🪙</div>
                <div className="font-semibold text-sm md:text-base">Earn WORLD Tokens</div>
                <div className="text-xs md:text-sm">Get rewarded with blockchain tokens for your focus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
