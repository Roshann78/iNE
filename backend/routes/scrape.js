const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { reliableScrape } = require('../scraper/reliableScrape');

/**
 * Scrapes a single product, logs all attempts to scrape_log,
 * and writes to price_history ONLY on validated success.
 */
async function scrapeAndLog(productId, productUrl, productName) {
  const result = await reliableScrape(
    { url: productUrl, name: productName },
    { maxRetries: 3, headless: true }
  );

  // Log EVERY attempt to scrape_log (golden rule)
  for (const attempt of result.attempts) {
    const { error: logError } = await supabase.from('scrape_log').insert({
      product_id: productId,
      status: attempt.status,
      attempt_number: attempt.attemptNumber,
      error_message: attempt.errorMessage,
      duration_ms: attempt.durationMs,
    });

    if (logError) {
      console.error(`Failed to insert scrape_log: ${logError.message}`);
    }
  }

  // Write to price_history ONLY on validated success (golden rule)
  if (result.success && result.finalResult) {
    const { error: historyError } = await supabase.from('price_history').insert({
      product_id: productId,
      price: result.finalResult.price,
      in_stock: result.finalResult.inStock,
    });

    if (historyError) {
      console.error(`Failed to insert price_history: ${historyError.message}`);
    }
  }

  return result;
}

// POST /api/scrape/:productId — Scrape a single product immediately
router.post('/scrape/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Get the product
    const { data: product, error } = await supabase
      .from('tracked_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log(`Scraping product: ${product.name}`);
    const result = await scrapeAndLog(product.id, product.url, product.name);

    res.json({
      productId: product.id,
      productName: product.name,
      success: result.success,
      result: result.finalResult,
      attempts: result.attempts,
    });
  } catch (err) {
    console.error('Scrape error:', err.message);
    res.status(500).json({ error: 'Scrape failed', message: err.message });
  }
});

// POST /api/scrape/trigger — Scrape ALL tracked products (for cron)
// Sequential with delays to avoid aggressive rate-limiting
router.post('/scrape/trigger', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('tracked_products')
      .select('*');

    if (error) throw error;

    if (!products || products.length === 0) {
      return res.json({ total: 0, succeeded: 0, failed: 0, message: 'No products to scrape' });
    }

    console.log(`\n=== SCRAPE TRIGGER: ${products.length} product(s) ===\n`);

    let succeeded = 0;
    let failed = 0;

    // Process sequentially — NOT in parallel (rate-limiting)
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        console.log(`[${i + 1}/${products.length}] Scraping: ${product.name}`);
        const result = await scrapeAndLog(product.id, product.url, product.name);

        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`Product ${product.name} crashed: ${err.message}`);
        failed++;

        // Still log the crash
        await supabase.from('scrape_log').insert({
          product_id: product.id,
          status: 'failed',
          attempt_number: 1,
          error_message: `Crash: ${err.message}`,
          duration_ms: 0,
        });
      }

      // Short delay between products
      if (i < products.length - 1) {
        console.log('  Waiting 3s before next product...');
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    console.log(`\n=== TRIGGER COMPLETE: ${succeeded} succeeded, ${failed} failed ===\n`);

    res.json({ total: products.length, succeeded, failed });
  } catch (err) {
    console.error('Trigger error:', err.message);
    res.status(500).json({ error: 'Trigger failed', message: err.message });
  }
});

module.exports = router;
