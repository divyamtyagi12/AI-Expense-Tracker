// backend/src/routes/expenseRoutes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const listRules = [
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('month must be 1-12'),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('year is invalid'),
  query('category').optional().isInt().withMessage('category must be an id'),
];

const expenseBodyRules = [
  body('categoryId').isInt().withMessage('categoryId is required and must be an integer'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('amount must be a positive number'),
  body('note').optional({ nullable: true }).isLength({ max: 255 }),
  body('expenseDate').isISO8601().withMessage('expenseDate must be a valid date (YYYY-MM-DD)'),
];

const idParamRules = [param('id').isInt().withMessage('Invalid expense id')];

router.get('/', validate(listRules), expenseController.getExpenses);
router.post('/', validate(expenseBodyRules), expenseController.createExpense);
router.put('/:id', validate([...idParamRules, ...expenseBodyRules]), expenseController.updateExpense);
router.delete('/:id', validate(idParamRules), expenseController.deleteExpense);

module.exports = router;
