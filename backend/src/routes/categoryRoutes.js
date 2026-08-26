// backend/src/routes/categoryRoutes.js

const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth); // every route below requires a logged-in user

const createRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }),
];

const renameRules = [
  param('id').isInt().withMessage('Invalid category id'),
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 50 }),
];

const idParamRules = [param('id').isInt().withMessage('Invalid category id')];

router.get('/', categoryController.getCategories);
router.post('/', validate(createRules), categoryController.createCategory);
router.patch('/:id', validate(renameRules), categoryController.renameCategory);
router.delete('/:id', validate(idParamRules), categoryController.deleteCategory);

module.exports = router;
