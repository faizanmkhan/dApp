
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.35461c2a16e44f5aaacc3117141f933e',
  appName: 'focus-token-flow',
  webDir: 'dist',
  server: {
    url: 'https://35461c2a-16e4-4f5a-aacc-3117141f933e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e1b4b",
      showSpinner: false
    }
  }
};

export default config;
