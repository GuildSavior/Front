// ✅ src/environments/environment.prod.ts (PRODUCTION)
export const environment = {
  production: true,
  apiUrl: 'http://api.guildsavior.online/api',
  discordAuthUrl: 'http://api.guildsavior.online/api/auth/discord',
  appUrl: 'http://api.guildsavior.online', // ✅ URL de production
  discordCallbackUrl: 'http://api.guildsavior.online/auth/discord/callback',
  enableDebugLogs: false,
  debugMode: false,
  environmentName: 'PRODUCTION'
};