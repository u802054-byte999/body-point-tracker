import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.73e3e729560d4fe5b1d4d5cdb1c626cf',
  appName: 'body-point-tracker',
  webDir: 'dist',
  server: {
    url: "https://73e3e729-560d-4fe5-b1d4-d5cdb1c626cf.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;