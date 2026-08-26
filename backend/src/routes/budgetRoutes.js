// backend/src/routes/budgetRoutes.js

const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const {
  getBudget,
  upsertBudget,
  upsertValidation,
  deleteBudget,
} = require('../controllers/budgetController');

const router = Router();

router.use(requireAuth); // all budget endpoints require authentication

router.get('/', getBudget);
router.put('/', upsertValidation, upsertBudget);
router.delete('/', deleteBudget);

module.exports = router;
