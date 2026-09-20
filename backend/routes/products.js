const express = require('express');
const router = express.Router();
const supabase = require('../db');

// POST /api/products — Track a new product
router.post('/products', async (req, res) => {
  try {
    const { storeProductId, name, url } = req.body;

    if (!storeProductId || !name || !url) {
      return res.status(400).json({ error: 'Missing required fields: storeProductId, name, url' });
    }

    // Check if already tracked
    const { data: existing } = await supabase
      .from('tracked_products')
      .select('id')
      .eq('store_product_id', storeProductId)
      .single();

    if (existing) {
      return res.json({ product: existing, message: 'Product already tracked' });
    }

    const { data, error } = await supabase
      .from('tracked_products')
      .insert({ store_product_id: storeProductId, name, url })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ product: data });
  } catch (err) {
    console.error('Track product error:', err.message);
    res.status(500).json({ error: 'Failed to track product', message: err.message });
  }
});

// GET /api/products — List all tracked products
router.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tracked_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ products: data || [] });
  } catch (err) {
    console.error('List products error:', err.message);
    res.status(500).json({ error: 'Failed to list products', message: err.message });
  }
});

// GET /api/products/:id — Get a single tracked product
router.get('/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tracked_products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    res.json({ product: data });
  } catch (err) {
    console.error('Get product error:', err.message);
    res.status(500).json({ error: 'Failed to get product', message: err.message });
  }
});

// GET /api/products/:id/history — Price history for a product
router.get('/products/:id/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .eq('product_id', req.params.id)
      .order('scraped_at', { ascending: true });

    if (error) throw error;

    res.json({ history: data || [] });
  } catch (err) {
    console.error('Price history error:', err.message);
    res.status(500).json({ error: 'Failed to get price history', message: err.message });
  }
});

// GET /api/products/:id/logs — Scrape logs for a product
router.get('/products/:id/logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scrape_log')
      .select('*')
      .eq('product_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ logs: data || [] });
  } catch (err) {
    console.error('Scrape logs error:', err.message);
    res.status(500).json({ error: 'Failed to get scrape logs', message: err.message });
  }
});

module.exports = router;
