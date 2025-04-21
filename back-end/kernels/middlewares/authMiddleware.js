const jwt = require('jsonwebtoken');
const { config } = require('configs'); // Assuming configs path might need adjustment
const { User, Role } = require('models'); // Assuming models path might need adjustment
const responseUtils = require('utils/responseUtils'); // Assuming utils path might need adjustment

// Middleware to verify if the user is authenticated
const authenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // More robust check for bearer token presence and format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Use 401 for authentication issues
      return responseUtils.unauthorized(res, 'Authentication required. Token missing or invalid format.');
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    let decoded;
    try {
      // Consider using async verify if your library supports it or if you have complex checks
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      // Differentiate between expired and invalid tokens if needed
      if (error instanceof jwt.TokenExpiredError) {
          return responseUtils.unauthorized(res, 'Token expired.');
      }
      // Use 401 for invalid token issues
      return responseUtils.unauthorized(res, 'Invalid token.');
    }

    // Validate decoded payload structure (optional but good practice)
    if (!decoded || typeof decoded.userId !== 'number') {
         // Use 401 as the token content is essentially invalid for authentication
        return responseUtils.unauthorized(res, 'Invalid token payload.');
    }

    const userId = decoded.userId;
    // No need for isNaN check if typeof check passed, but doesn't hurt

    // Consider adding caching here for user/role data if performance becomes an issue
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: 'role', // Ensure 'role' alias matches your Sequelize association definition
        attributes: ['name'] // Only fetch the role name if that's all you need
      }]
    });

    if (!user) {
      // Use 401 as the user identified by the token doesn't exist
      return responseUtils.unauthorized(res, 'User not found.');
    }

    if (!user.is_active) {
      // Use 403 Forbidden as the user is authenticated but not allowed access
      return responseUtils.forbidden(res, 'Account is disabled.');
    }

    // Attach user to request object
    // Ensure role name exists before accessing it
    const roleName = user.role ? user.role.name : null;
    if (!roleName) {
        console.error(`User ${user.id} does not have a valid role assigned.`);
        // Use 500 Internal Server Error as this indicates a data integrity issue
        return responseUtils.serverError(res, 'User role configuration error.');
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: roleName, // Use the fetched role name
      role_id: user.role_id // Keep role_id if needed elsewhere
    };

    next();
  } catch (error) {
    // Use a more robust logger in production (e.g., Winston, Pino)
    console.error('Authentication error:', error);
    // Use 500 Internal Server Error for unexpected errors during authentication
    return responseUtils.serverError(res, 'An internal error occurred during authentication.');
  }
};

// Middleware to authorize user based on their role
// Accepts an array or a single string role
const authorize = (allowedRoles) => {
  // Normalize allowedRoles to always be an array, convert to lowercase for case-insensitive comparison
  const roles = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles])
                .map(role => role.toLowerCase());

  return (req, res, next) => {
    // Ensure authenticated middleware ran first
    if (!req.user || !req.user.role) {
        // 401 if user info is missing (shouldn't happen if authenticated runs first)
      return responseUtils.unauthorized(res, 'Authentication required.');
    }

    // Case-insensitive role check
    if (roles.includes(req.user.role.toLowerCase())) {
      next(); // User has one of the allowed roles
    } else {
      // Use 403 Forbidden for authorization failures
      return responseUtils.forbidden(res, 'Insufficient permissions.');
    }
  };
};

// Middleware checks - Use consistent casing for roles ('Admin', 'Blogger', 'Viewer')
const isAdmin = authorize(['Admin']);
const isBlogOwnerRole = authorize(['Admin', 'Blogger']); // Renamed for clarity (checks role, not ownership)

// Corrected: Typo 'Blogger ' had a space. Assuming 'Viewer' is a valid role.
// This checks if the user is authenticated AND has one of these specific roles.
const isAuthenticatedUserWithRole = authorize(['Admin', 'Blogger', 'Viewer']);

// If you just need to check if *any* valid user is logged in,
// the `authenticated` middleware itself is sufficient. You'd just apply `authenticated`.
// Example: router.get('/profile', authenticated, (req, res) => { ... });

/**
 * Middleware to check if user is the owner of a resource or an Admin.
 * @param {Sequelize.Model} model - The Sequelize model to check ownership against.
 * @param {object} [options] - Optional configuration.
 * @param {string} [options.idParam='id'] - The name of the route parameter containing the resource ID (e.g., 'postId').
 * @param {string} [options.foreignKey='user_id'] - The name of the foreign key field on the model linking to the User.
 */
const isResourceOwner = (model, options = {}) => {
  const idParam = options.idParam || 'id'; // Default to 'id'
  const foreignKey = options.foreignKey || 'user_id'; // Default to 'user_id'

  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        // Should be caught by `authenticated` first, but good defense
        return responseUtils.unauthorized(res, 'Authentication required.');
      }

      // Admins bypass the ownership check
      // Case-insensitive comparison for role
      if (req.user.role?.toLowerCase() === 'admin') {
        return next();
      }

      // Get resource ID from route parameters ONLY. Avoid req.body for ID checks.
      const resourceId = req.params[idParam];
      if (!resourceId) {
          console.warn(`Resource ID parameter ':${idParam}' not found in route for ownership check.`);
          // Use 400 Bad Request as the request URL seems malformed
          return responseUtils.badRequest(res, `Resource ID ':${idParam}' missing in URL.`);
      }

      // Optional: Validate resourceId format here (e.g., is it a number/UUID?)

      // Find the resource and select only the foreign key field for efficiency
      const resource = await model.findOne({
        where: { id: resourceId },
        attributes: [foreignKey],
        raw: true // Makes it return a plain object
      });

      if (!resource) {
        // Use 404 Not Found if the resource itself doesn't exist
        return responseUtils.notFound(res, 'Resource not found.');
      }

      // Check if the foreign key exists on the resource and matches the user's ID
      if (resource[foreignKey] === req.user.id) {
        next(); // User is the owner
      } else {
        // Use 403 Forbidden if the user is not the owner
        return responseUtils.forbidden(res, 'You do not have permission to access or modify this resource.');
      }
    } catch (error) {
      console.error('Resource owner check error:', error);
      // Use 500 Internal Server Error for unexpected errors during the check
      return responseUtils.serverError(res, 'An internal error occurred checking resource ownership.');
    }
  };
};

module.exports = {
  authenticated,
  authorize,
  isAdmin,
  isBlogOwnerRole, // Use the more descriptive name
  isAuthenticatedUserWithRole, // Use the more descriptive name
  // You might not need to export isAuthenticatedUserWithRole if `authenticated` is sufficient
  isResourceOwner
};