const express = require('express');
const router = express.Router();

// GET /api/search?q= — will be implemented in Stage 3
router.get('/search', (req, res) => {
  res.json({ results: [], message: 'Search not yet implemented' });
});

module.exports = router;
