module.exports = {
    secret : process.env.JWT_SECRET || 'secret',
    algorithm: 'HS256',
    expiresIn: '1h', // Token expiration time
    ttl: '1h'
}
