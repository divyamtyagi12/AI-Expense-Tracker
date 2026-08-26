// backend/src/middleware/validate.js
// Reusable wrapper: pass an array of express-validator rules, and this
// middleware runs them, then returns a 400 with details if any fail.
// Keeps validation error-handling consistent across every route.

const { validationResult } = require('express-validator');

function validate(rules) {
  return async (req, res, next) => {
    await Promise.all(rules.map((rule) => rule.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  };
}

module.exports = validate;
