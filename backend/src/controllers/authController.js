// backend/src/controllers/authController.js

const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');

const SALT_ROUNDS = 10;

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.createUser({ name, email, passwordHash });
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) {
      // Same message for "no user" and "wrong password" — avoids leaking
      // which emails are registered.
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (protected)
async function getMe(req, res, next) {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
