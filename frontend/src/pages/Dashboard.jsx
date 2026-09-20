import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTrackedProducts } from '../api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getTrackedProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading tracked products...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="subtitle">Your tracked products</p>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products tracked yet.</p>
          <Link to="/" className="btn">Search & Track Products</Link>
        </div>
      ) : (
        <div className="product-list">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="product-card"
            >
              <div className="product-card-info">
                <strong>{product.name}</strong>
                <span className="product-meta">
                  Added: {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
