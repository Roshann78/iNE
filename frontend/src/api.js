const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function searchProducts(query) {
  const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return data.results || [];
}

export async function trackProduct(product) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      storeProductId: product.storeProductId,
      name: product.name,
      url: product.url,
    }),
  });
  if (!res.ok) throw new Error('Failed to track product');
  return res.json();
}

export async function getTrackedProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return data.products || [];
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  const data = await res.json();
  return data.product;
}

export async function getPriceHistory(id) {
  const res = await fetch(`${API_URL}/api/products/${id}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  const data = await res.json();
  return data.history || [];
}

export async function getScrapeLogs(id) {
  const res = await fetch(`${API_URL}/api/products/${id}/logs`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  const data = await res.json();
  return data.logs || [];
}

export async function scrapeProduct(productId) {
  const res = await fetch(`${API_URL}/api/scrape/${productId}`, { method: 'POST' });
  if (!res.ok) throw new Error('Scrape failed');
  return res.json();
}
