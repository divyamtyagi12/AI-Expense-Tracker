// backend/src/routes/aiRoutes.js

const { Router } = require('express');
const requireAuth = require('../middleware/auth');
const { analyze, ask, getHistory, clearHistory } = require('../controllers/aiController');

const router = Router();

router.use(requireAuth);

router.post('/analyze', analyze);
router.post('/ask', ask);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;
