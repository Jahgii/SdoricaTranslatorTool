export const environment = {
  production: true,
  allowedDomains: process.env.ALLOWED_DOMAIN as string,
  googleClientId: process.env.GOOGLE_CLIENT_ID as string
};
