const express = require('express');
const router = express.Router();

// Stub routes — will be implemented in Stage 3
router.post('/scrape/:productId', (req, res) => {
  res.json({ message: 'Not yet implemented' });
});

router.post('/scrape/trigger', (req, res) => {
  res.json({ message: 'Not yet implemented' });
});

module.exports = router;
