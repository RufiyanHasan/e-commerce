// Copy this to environment.ts and fill in your own keys.
// Never commit environment.ts — it is in .gitignore.
export const environment = {
  production: false,

  paypalClientId: 'REPLACE_WITH_YOUR_SANDBOX_CLIENT_ID',

  emailjs: {
    serviceId: 'REPLACE_WITH_EMAILJS_SERVICE_ID',
    templateId: 'REPLACE_WITH_EMAILJS_TEMPLATE_ID',
    publicKey: 'REPLACE_WITH_EMAILJS_PUBLIC_KEY',
  },
};
