import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.softsteps.learn',
  appName: 'Soft Steps',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: '#F5F6F8',
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F5F6F8',
    },
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
}

export default config
