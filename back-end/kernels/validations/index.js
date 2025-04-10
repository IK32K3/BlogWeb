// kernels/validations/index.js
const { ExpressValidator } = require("express-validator");
const response = require("utils/responseUtils"); // Assuming this path is correct

// Use the custom instance if needed, otherwise use the default export
// Using default export for simplicity unless custom config is strictly needed
const { validationResult } = require('express-validator');

/*
// If you absolutely need the custom instance from before:
const { validationResult } = new ExpressValidator(
  {},
  {},
  {
    errorFormatter: (error) => ({
      field: error.path || error.param,
      message: error.msg,
    }),
  }
);
*/

const validate = (validationChains) => { // Renamed for clarity
  // Basic check if the input is an array as expected
  if (!Array.isArray(validationChains)) {
      console.error("Validation Configuration Error: validate() expects an array of validation chains.");
      return (req, res, next) => {
          next(new Error("Server Configuration Error: Invalid validation rules provided."));
      };
  }

  return async (req, res, next) => {
    try {
      // REMOVED THE NESTED LOOPS HERE
      // Run all validation chains provided in the array concurrently
      await Promise.all(validationChains.map(chain => {
          // Ensure 'chain' is a valid runnable object
          if (chain && typeof chain.run === 'function') {
             return chain.run(req); // Run the chain directly
          } else {
             console.error("Validation Configuration Error: Invalid item found in validation array:", chain);
             throw new Error("Server Configuration Error: Invalid validation rule detected.");
          }
      }));

      // Check the results
      const errors = validationResult(req); // Use the imported validationResult
      if (errors.isEmpty()) {
        return next(); // No errors, proceed
      }

      // Errors found, use your response utility
      return response.invalidated(res, { // Use your response method
        errors: errors.array(),
      });

    } catch (error) {
       // Catch errors during validation run or config issues
       console.error("Error during validation middleware execution:", error);
       next(error); // Pass to Express error handler
    }
  };
};

module.exports = { validate };