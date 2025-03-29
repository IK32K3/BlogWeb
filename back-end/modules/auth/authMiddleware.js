const jwt = require('jsonwebtoken');
const { config } = require('configs');
const { User, Role } = require('models');
const responseUtils = require('utils/responseUtils');

// Middleware to verify if the user is authenticated
const authenticated = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseUtils.unauthorized(res, 'Authentication required');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    if (!token) {
      return responseUtils.unauthorized(res, 'Authentication required');
    }
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return responseUtils.unauthorized(res, 'Invalid or expired token');
    }
    
    // Find user
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });
    
    if (!user) {
      return responseUtils.unauthorized(res, 'User not found');
    }
    
    if (!user.is_active) {
      return responseUtils.unauthorized(res, 'Account is disabled');
    }
    
    // Attach user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      role_id: user.role_id
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return responseUtils.error(res, error.message);
  }
};

// Middleware to authorize user based on their role
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseUtils.unauthorized(res, 'Authentication required');
    }
    
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      return responseUtils.unauthorized(res, 'Insufficient permissions');
    }
  };
};

// Middleware to check if user is an admin
const isAdmin = authorize(['Admin']);
const isBlogOwner = authorize(['Admin', 'Blog Owner']);
const isAuthenticated = authorize(['Admin', 'Blog Owner', 'Editor', 'Viewer']);

// Middleware to check if user is the owner of a resource
const isResourceOwner = (model) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return responseUtils.unauthorized(res, 'Authentication required');
      }
      
        // Check if user is an admin
      if (req.user.role === 'Admin') {
        return next();
      }
      
      const resourceId = req.params.id || req.params.postId || req.body.id;
      if (!resourceId) {
        return responseUtils.invalidated(res, { errors: [{ message: 'Resource ID is required' }] });
      }
      
      const resource = await model.findByPk(resourceId);
      if (!resource) {
        return responseUtils.notFound(res);
      }
      
      // Check if user is the owner
      if (resource.user_id === req.user.id) {
        next();
      } else {
        return responseUtils.unauthorized(res, 'You are not the owner of this resource');
      }
    } catch (error) {
      console.error('Resource owner check error:', error);
      return responseUtils.error(res, error.message);
    }
  };
};

module.exports = {
  authenticated,
  authorize,
  isAdmin,
  isBlogOwner,
  isAuthenticated,
  isResourceOwner
};