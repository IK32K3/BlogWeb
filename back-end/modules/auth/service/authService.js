const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { config } = require('configs'); // Assuming configs are accessible
const { User, Role } = require('models'); // Assuming models are accessible
const jwtUtils = require('utils/jwtUtils'); // Assuming utils are accessible
const validator = require('validator');

// Constants (can be kept here or in config)
const SALT_ROUNDS = config.hashing.bcrypt.rounds || 10;
const PASSWORD_MIN_LENGTH = 8;

// Custom Error classes (optional but recommended for better handling)
class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

class ConflictError extends AuthError {
  constructor(message) {
    super(message, 409); // 409 Conflict
  }
}

class UnauthorizedError extends AuthError {
  constructor(message) {
    super(message, 401); // 401 Unauthorized
  }
}

class ForbiddenError extends AuthError {
  constructor(message) {
    super(message, 403); // 403 Forbidden
  }
}

class NotFoundError extends AuthError {
  constructor(message) {
    super(message, 404); // 404 Not Found
  }
}


const authService = {
  /**
   * Handles user registration logic.
   * @param {object} userData - Contains username, email, password, description, avatar.
   * @returns {Promise<object>} - { user, tokens }
   * @throws {AuthError|ConflictError}
   */
    registerUser: async (userData) => {
    const { username, email, password, description, avatar } = userData;

    // --- Check for existing user ---
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] }
    });
    if (existingUser) {
      const field = existingUser.username === username ? 'username' : 'email';
      throw new ConflictError(`${field} already exists`);
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Get default role ---
    const defaultRole = await Role.findOne({
      where: { name: 'Viewer' },
      attributes: ['id', 'name'] // Chỉ lấy những cột cần thiết
    });
    if (!defaultRole) {
      console.error("Default role 'Blogger' not found in database.");
      throw new Error('User registration configuration error.');
    }

    // --- Create user with explicit fields ---
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role_id: defaultRole.id,
      description: description || '',
      is_active: true,
      avatar: avatar || ''
    }, {
      fields: ['username', 'email', 'password', 'role_id', 'description', 'is_active', 'avatar']
    });

    // --- Generate tokens ---
    const tokens = {
      access_token: jwtUtils.sign(user.id, defaultRole.name),
      refresh_token: jwtUtils.signRefreshToken(user.id, defaultRole.name)
    };

    // --- Return user and tokens ---
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: defaultRole.name
      },
      tokens
    };

  },

  /**Add commentMore actions
   * Handles user login logic.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>} - { user, tokens }
   * @throws {UnauthorizedError|ForbiddenError}
   */
  loginUser: async (usernameOrEmail, password) => {
    // --- Find user with role ---
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name'],
        required: true // Use INNER JOIN instead of LEFT JOIN
      }],
      attributes: ['id', 'username', 'email', 'password', 'is_active'] // Select only necessary fields
    });

    if (!user) {
      throw new UnauthorizedError('Invalid usernameOrEmail credentials');
    }

    if (!user.is_active) {
      throw new ForbiddenError('Account is disabled');
    }
    if (!user.role || !user.role.name) {
      console.error(`Role data missing for user: ${usernameOrEmail}`);
      throw new Error('User data configuration error.'); // Internal server error
  }
    // --- Verify password ---
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid password credentials');
    }

    // --- Generate tokens ---
    const tokens = {
      access_token: jwtUtils.sign(user.id, user.role.name),
      refresh_token: jwtUtils.signRefreshToken(user.id, user.role.name)
    };

    // --- Return necessary data ---
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name
      },
      tokens
    };
  },
  /**
   * Handles forgot password request logic.
   * @param {string} email
   * @returns {Promise<string|null>} - Reset token (or null if user not found)
   * @throws {AuthError}
   */
  requestPasswordReset: async (email) => {
    if (!validator.isEmail(email)) {
      throw new AuthError('Invalid email format');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return null to prevent email enumeration in controller response
      return null;
    }

    // --- Generate reset token ---
    const resetToken = jwt.sign(
      { userId: user.id, action: 'password_reset' },
      config.jwt.secret,
      { expiresIn: '15m' } // Configurable expiration
    );

    // Note: Email sending logic should ideally be handled
    // by the controller or a dedicated EmailService after this returns.
    return resetToken;
  },

  /**
   * Handles password reset logic using a token.
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise<boolean>} - true if successful
   * @throws {AuthError|UnauthorizedError|NotFoundError}
   */
  performPasswordReset: async (token, newPassword) => {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      throw new AuthError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
    }

    // --- Verify token ---
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
      if (!decoded || decoded.action !== 'password_reset') {
        throw new Error(); // Throw generic error to catch below
      }
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // --- Find user ---
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      // Should not happen if token was valid, but check anyway
      throw new NotFoundError('User associated with token not found');
    }

    // --- Hash new password ---
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // --- Update password ---
    await user.update({ password: hashedPassword });

    return true; // Indicate success
  },

  /**
   * Handles access token refresh logic.
   * @param {string} refreshToken
   * @returns {Promise<string>} - New access token
   * @throws {UnauthorizedError}
   */
  refreshAccessToken: async (refreshToken) => {
    // --- Verify refresh token ---
    let decoded;
    try {
        if (!config.jwt.refreshSecret) {
            throw new Error('Refresh secret is not configured'); // Add a safeguard for missing secret
        }
        decoded = jwt.verify(refreshToken, config.jwt.refreshSecret); // Ensure refreshSecret is correct
        if (!decoded || !decoded.userId) {
            throw new Error();
        }
    } catch (error) {
        console.error('Refresh token verification failed:', error.message);
        throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // --- Find user with role ---
    const user = await User.findByPk(decoded.userId, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['name']
        }],
        attributes: ['id', 'is_active'] // Only fetch necessary fields
    });

    // Check if user exists, is active, and role loaded
    if (!user) {
        console.error('User not found for refresh token:', decoded.userId);
        throw new UnauthorizedError('User not found');
    }
    if (!user.is_active) {
        console.error('Inactive user attempted token refresh:', user.id);
        throw new UnauthorizedError('User account is inactive');
    }
    if (!user.role || !user.role.name) {
        console.error('Role data missing for user:', user.id);
        throw new Error('User data configuration error');
    }

    // --- Generate new access token ---
    const accessToken = jwtUtils.sign(user.id, user.role.name);

    return accessToken;
  },

  /**
   * Check if username exists
   * @param {string} username
   * @returns {Promise<boolean>} - true if username exists
   */
  checkUsernameExists: async (username) => {
    const user = await User.findOne({
      where: { username },
      attributes: ['id'] // Only fetch id for efficiency
    });
    return !!user;
  },

  /**
   * Check if email exists
   * @param {string} email
   * @returns {Promise<boolean>} - true if email exists
   */
  checkEmailExists: async (email) => {
    const user = await User.findOne({
      where: { email },
      attributes: ['id'] // Only fetch id for efficiency
    });
    return !!user;
  },

  /**
   * Handles user logout logic.
   * @param {string} refreshToken
   * @returns {Promise<boolean>} - true if successful
   */
  logoutUser: async (refreshToken) => {
    // Nếu bạn lưu refresh token ở DB, hãy xóa nó ở đây.
    // Ví dụ:
    // await RefreshToken.destroy({ where: { token: refreshToken } });
    // Nếu không lưu, chỉ cần trả về true
    return true;
  }
};

module.exports = authService;