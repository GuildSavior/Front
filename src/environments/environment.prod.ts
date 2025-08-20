// ✅ src/environments/environment.prod.ts (PRODUCTION)
export const environment = {
  production: true,
  apiUrl: 'https://api.guildsavior.online/api',
  discordAuthUrl: 'http://82.112.255.241:8080/api/auth/discord',
  appUrl: 'http://api.guildsavior.online', // ✅ URL de production
  discordCallbackUrl: 'http://82.112.255.241:8080/auth/discord/callback',
  enableDebugLogs: false,
  debugMode: false,
  environmentName: 'PRODUCTION'
};