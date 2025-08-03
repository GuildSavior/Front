// ✅ src/environments/environment.ts (DÉVELOPPEMENT)
export const environment = {
  production: false,
  environmentName: 'DÉVELOPPEMENT', // ✅ AJOUTER pour test
  apiUrl: 'http://127.0.0.1:8000/api', // ✅ Ton serveur local
  discordAuthUrl: 'http://127.0.0.1:8000/api/auth/discord',
  stripePublicKey: 'pk_test_ton_stripe_test_key',
  appUrl: 'http://localhost:4200',
  enableDebugLogs: true,
  debugMode: true
};