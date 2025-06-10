// utils/responseUtils.js

module.exports = {
  // Success responses
  success: (res, data = null, message = 'Success', status = 200) => {
    res.status(status).json({
      success: true,
      message,
      data
    });
  },
  
  created: (res, data = null, message = 'Resource created') => {
    res.status(201).json({
      success: true,
      message,
      data
    });
  },

  // Error responses
  error: (res, error = null, message = 'Error occurred', status = 500) => {
    const response = {
      success: false,
      message: error?.message || message
    };

    // Only include error details in development
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = {
        name: error.name,
        stack: error.stack
      };
    }

    res.status(status).json(response);
  },

  badRequest: (res, message = 'Bad request', error = null) => {
    res.status(400).json({
      success: false,
      message,
      error: error?.message
    });
  },

  unauthorized: (res, message = 'Unauthorized', error = null) => {
    res.status(401).json({
      success: false,
      message,
      error: error?.message
    });
  },

  forbidden: (res, message = 'Forbidden', error = null) => {
    res.status(403).json({
      success: false,
      message,
      error: error?.message
    });
  },

  notFound: (res, message = 'Not found', error = null) => {
    res.status(404).json({
      success: false,
      message,
      error: error?.message
    });
  },

  conflict: (res, message = 'Conflict', error = null) => {
    res.status(409).json({
      success: false,
      message,
      error: error?.message
    });
  },

  serverError: (res, message = 'Internal server error', error = null) => {
    res.status(500).json({
      success: false,
      message,
      error: error?.message
    });
  }
};
