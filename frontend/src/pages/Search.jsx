import { useState } from 'react';
import { searchProducts, trackProduct } from '../api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [trackedIds, setTrackedIds] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setMessage('');
    try {
      const data = await searchProducts(query);
      setResults(data);
      if (data.length === 0) setMessage('No products found.');
    } catch (err) {
      setMessage('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (product) => {
    try {
      await trackProduct(product);
      setTrackedIds((prev) => new Set([...prev, product.storeProductId]));
      setMessage(`"${product.name}" is now being tracked!`);
    } catch (err) {
      setMessage('Failed to track: ' + err.message);
    }
  };

  return (
    <div>
      <h1>Search Products</h1>
      <p className="subtitle">Search the store catalog and start tracking products</p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a product..."
          className="search-input"
        />
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      {results.length > 0 && (
        <div className="results">
          <h2>Results ({results.length})</h2>
          <div className="results-list">
            {results.map((product) => (
              <div key={product.storeProductId} className="result-item">
                <div className="result-info">
                  <strong>{product.name}</strong>
                  <span className="result-meta">
                    {product.brand && `Brand: ${product.brand}`}
                    {product.category && ` · ${product.category}`}
                  </span>
                </div>
                <button
                  onClick={() => handleTrack(product)}
                  disabled={trackedIds.has(product.storeProductId)}
                  className="btn btn-small"
                >
                  {trackedIds.has(product.storeProductId) ? 'Tracked ✓' : 'Track'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
