export default {
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_key_unificha_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};