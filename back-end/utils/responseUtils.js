// utils/responseUtils.js

module.exports = {
  // Success responses
  success: (res, data, message = 'Success') => {
    res.status(200).json({ success: true, message, data });
  },
  
  created: (res, data, message = 'Resource created') => {
    res.status(201).json({ success: true, message, data });
  },

  // Error responses
  badRequest: (res, message = 'Bad request') => {
    res.status(400).json({ success: false, message });
  },

  unauthorized: (res, message = 'Unauthorized') => {
    res.status(401).json({ success: false, message });
  },

  forbidden: (res, message = 'Forbidden') => {
    res.status(403).json({ success: false, message });
  },

  notFound: (res, message = 'Not found') => {
    res.status(404).json({ success: false, message });
  },

  conflict: (res, message = 'Conflict') => {
    res.status(409).json({ success: false, message });
  },

  serverError: (res, message = 'Internal server error') => {
    res.status(500).json({ success: false, message });
  }
  
};
