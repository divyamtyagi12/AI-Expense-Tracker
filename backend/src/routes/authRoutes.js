// backend/src/routes/authRoutes.js

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', validate(registerRules), authController.register);
router.post('/login', validate(loginRules), authController.login);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
