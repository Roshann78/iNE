const BASE_URL = 'https://demo.inelabteamdev.com';

/**
 * Search products on the mock store via the catalog API.
 * This is a plain HTTP call — no Playwright needed.
 *
 * @param {string} query - Search term
 * @returns {Promise<Array<{storeProductId: string, name: string, url: string, brand: string, category: string}>>}
 */
async function searchProducts(query) {
  try {
    const url = `${BASE_URL}/api/catalog?page=1&pageSize=20&search=${encodeURIComponent(query)}`;
    console.log(`Searching catalog: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Catalog search failed with status ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('Catalog response missing items array');
      return [];
    }

    return data.items.map((item) => ({
      storeProductId: item.id,
      name: item.name,
      slug: item.slug,
      brand: item.brand || '',
      category: item.category || '',
      sku: item.sku || '',
      description: item.description || '',
      url: `${BASE_URL}/product/${item.slug}`,
    }));
  } catch (err) {
    console.warn(`Search error: ${err.message}`);
    return [];
  }
}

module.exports = { searchProducts };
