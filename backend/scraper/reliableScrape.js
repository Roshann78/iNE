const { scrapeProduct } = require('./scrapeProduct');

/**
 * Reliability wrapper around scrapeProduct.
 * Retries up to maxRetries times with backoff, validates results,
 * and returns a detailed attempts log.
 *
 * NEVER throws — always resolves with the full attempts array.
 *
 * @param {object} product - { url, name, storeProductId }
 * @param {object} options
 * @param {number} options.maxRetries - Max attempts (default: 3)
 * @param {boolean} options.headless - Headless mode (default: true)
 * @returns {Promise<{success: boolean, finalResult: {price, inStock}|null, attempts: Array}>}
 */
async function reliableScrape(product, { maxRetries = 3, headless = true } = {}) {
  const attempts = [];
  let finalResult = null;
  let success = false;

  // Backoff delays in ms
  const backoffDelays = [2000, 5000, 10000, 15000, 20000];

  for (let i = 1; i <= maxRetries; i++) {
    const startTime = Date.now();
    let status = 'failed';
    let errorMessage = null;

    try {
      console.log(`  Attempt ${i}/${maxRetries} for ${product.name || product.url}...`);

      const result = await scrapeProduct(product.url, { headless });

      // Validate the result
      if (!validateResult(result)) {
        throw new Error(
          `Validation failed: price=${result.price} (type: ${typeof result.price}), inStock=${result.inStock} (type: ${typeof result.inStock})`
        );
      }

      // Success
      finalResult = result;
      success = true;
      status = 'success';
      console.log(`  ✓ Attempt ${i} succeeded: $${result.price}, inStock: ${result.inStock}`);
    } catch (err) {
      errorMessage = err.message || String(err);
      console.log(`  ✗ Attempt ${i} failed: ${errorMessage}`);

      // Determine if we should retry
      if (i < maxRetries) {
        status = 'retried';

        // Check for Retry-After hint in the error message
        const retryAfterMatch = errorMessage.match(/retryAfter[:\s]*(\d+)/i);
        let waitMs;

        if (retryAfterMatch) {
          waitMs = parseInt(retryAfterMatch[1]) * 1000;
          console.log(`  ⏳ Honoring Retry-After: waiting ${waitMs}ms...`);
        } else {
          waitMs = backoffDelays[Math.min(i - 1, backoffDelays.length - 1)];
          console.log(`  ⏳ Backoff: waiting ${waitMs}ms...`);
        }

        await sleep(waitMs);
      } else {
        status = 'failed';
      }
    }

    const durationMs = Date.now() - startTime;

    attempts.push({
      attemptNumber: i,
      status,
      errorMessage,
      durationMs,
    });

    // Stop retrying on success
    if (success) break;
  }

  return { success, finalResult, attempts };
}

/**
 * Validates a scrape result:
 * - price must be a positive, finite number
 * - inStock must be a strict boolean
 */
function validateResult(result) {
  if (!result) return false;

  const { price, inStock } = result;

  if (typeof price !== 'number' || !isFinite(price) || price <= 0) {
    return false;
  }

  if (typeof inStock !== 'boolean') {
    return false;
  }

  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { reliableScrape, validateResult };
