const { config } = require("configs");
const jwt = require("jsonwebtoken");

module.exports = {
  sign: (userId, userRole) => {
    const access_token = jwt.sign(
      {
        userId: Number(userId),
        role: userRole,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.ttl,
      }
    );

    return access_token;
  },
  signRefreshToken: (userId, userRole) => {
    const refresh_token = jwt.sign(
      {
        userId: Number(userId),
        role: userRole,
      },
      config.jwt.refreshSecret,
      {
        expiresIn: "1y",
      }
    );

    return refresh_token;
  },
};

