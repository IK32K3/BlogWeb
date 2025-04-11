module.exports = {
    secret: process.env.JWT_SECRET_KEY || 'secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET_KEY || 'refreshSecret',
    algorithm: 'HS256',
    resetTokenExpiration: '15m',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default 1 hour for access token
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Default 7 days for refresh token
    ttl: '1h'
};
