import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sammanbaral.explorecamp',
  appName: 'ExploreCamp',
  webDir: 'dist',
  server: {
    cleartext: true,
    allowNavigation: ['http://10.0.2.2:5000/*'],
    hostname: 'localhost',
    androidScheme: 'http'
  },
  android: {
    webContentsDebuggingEnabled: true
  }
};

export default config;
