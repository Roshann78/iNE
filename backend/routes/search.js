const express = require('express');
const router = express.Router();
const { searchProducts } = require('../scraper/search');

// GET /api/search?q= — Search the mock store catalog
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json({ results: [] });
    }

    const results = await searchProducts(query);
    res.json({ results });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
});

module.exports = router;
