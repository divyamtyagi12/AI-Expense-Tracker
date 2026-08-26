// backend/src/routes/exportRoutes.js

const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { exportExpensesCsv } = require('../controllers/exportController');

const router = Router();

router.use(requireAuth);
router.get('/expenses.csv', exportExpensesCsv);

module.exports = router;
