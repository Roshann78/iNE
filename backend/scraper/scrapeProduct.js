const { chromium } = require('playwright');

/**
 * Scrapes price/stock data from a product page on demo.inelabteamdev.com
 * Uses Playwright to let the browser handle the challenge/session/price flow,
 * then intercepts the /api/products/:id/price network response.
 *
 * @param {string} productUrl - Full URL of the product page
 * @param {object} options
 * @param {boolean} options.headless - Run browser in headless mode (default: true)
 * @returns {Promise<{price: number, inStock: boolean}>}
 */
async function scrapeProduct(productUrl, { headless = true } = {}) {
  let browser = null;

  try {
    browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Set up network interception for the price endpoint
    let priceData = null;
    let lastErrorStatus = null;

    const priceResponsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Timed out waiting for price response after 45s (last status: ${lastErrorStatus || 'none'})`
          )
        );
      }, 45000);

      page.on('response', async (response) => {
        const url = response.url();

        // Match /api/products/<id>/price
        if (/\/api\/products\/[^/]+\/price/.test(url)) {
          const status = response.status();

          if (status === 200) {
            try {
              const json = await response.json();
              priceData = json;
              clearTimeout(timeout);
              resolve(json);
            } catch (err) {
              // JSON parse failed, keep waiting
              lastErrorStatus = `200 (parse error: ${err.message})`;
            }
          } else {
            // Track non-200 status (e.g. 429)
            lastErrorStatus = status;
          }
        }
      });
    });

    // Also watch for the site's own failure message in the DOM
    const failureCheck = async () => {
      try {
        const failureText = await page.textContent('body');
        if (
          failureText &&
          failureText.includes("Couldn't load the price")
        ) {
          return true;
        }
      } catch {
        // Page might not be ready
      }
      return false;
    };

    // Navigate to the product page
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Race between: price response arriving vs site giving up
    const checkInterval = setInterval(async () => {
      const failed = await failureCheck();
      if (failed && !priceData) {
        clearInterval(checkInterval);
      }
    }, 2000);

    try {
      const result = await priceResponsePromise;
      clearInterval(checkInterval);

      // Parse price and stock from the response
      const price = parseFloat(result.price || result.salePrice || result.currentPrice);
      const inStock =
        typeof result.inStock === 'boolean'
          ? result.inStock
          : typeof result.stock === 'boolean'
            ? result.stock
            : result.inStock !== undefined
              ? Boolean(result.inStock)
              : true; // Default to true if not specified

      return { price, inStock };
    } catch (err) {
      clearInterval(checkInterval);

      // Check if the site's own UI showed failure
      const siteGaveUp = await failureCheck();
      if (siteGaveUp) {
        throw new Error(
          `Site gave up loading price after internal retries (last status: ${lastErrorStatus || 'unknown'})`
        );
      }

      throw err;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeProduct };
