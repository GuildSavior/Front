// ✅ src/environments/environment.prod.ts (PRODUCTION)
export const environment = {
  production: true,
<<<<<<< HEAD
  apiUrl: 'http://api.guildsavior.online/api',
  discordAuthUrl: 'http://api.guildsavior.online/api/auth/discord',
  appUrl: 'http://api.guildsavior.online/', // ✅ URL de production
  discordCallbackUrl: 'http://api.guildsavior.online/auth/discord/callback',
=======
  apiUrl: 'https://api.guildsavior.online/api',
  discordAuthUrl: 'http://82.112.255.241:8080/api/auth/discord',
  appUrl: 'http://api.guildsavior.online', // ✅ URL de production
  discordCallbackUrl: 'http://82.112.255.241:8080/auth/discord/callback',
>>>>>>> 3e18a1c9109bb5bf3a45020e61ff07a46d503899
  enableDebugLogs: false,
  debugMode: false,
  environmentName: 'PRODUCTION'
};