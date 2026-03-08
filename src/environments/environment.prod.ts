export const environment = {
  production: true,

  // ← Replace with your Railway backend URL after deploying
  apiUrl: 'https://YOUR_APP.up.railway.app/api',

  // These are public-facing client IDs — safe to commit
  googleClientId: '60315981275-ioc2k141trh0ati4dtphrktcuhbcleoo.apps.googleusercontent.com',
  paypalClientId: 'AR5BwJ4Rjsx9mF4H2PbunNYtepkanVy6le9cDMmjBfjW1pyNVBcOquEDGhhpOmGhQJyNDnRtkB2kHFVJ',

  // EmailJS — injected at build time via Vercel environment variables
  // Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY in Vercel dashboard
  emailjs: {
    serviceId: process.env['EMAILJS_SERVICE_ID'] ?? '',
    templateId: process.env['EMAILJS_TEMPLATE_ID'] ?? '',
    publicKey: process.env['EMAILJS_PUBLIC_KEY'] ?? '',
  },
};
