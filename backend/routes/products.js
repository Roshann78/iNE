const express = require('express');
const router = express.Router();

// Stub routes — will be implemented in Stage 3
router.post('/products', (req, res) => {
  res.json({ message: 'Not yet implemented' });
});

router.get('/products', (req, res) => {
  res.json({ products: [] });
});

router.get('/products/:id/history', (req, res) => {
  res.json({ history: [] });
});

router.get('/products/:id/logs', (req, res) => {
  res.json({ logs: [] });
});

module.exports = router;
