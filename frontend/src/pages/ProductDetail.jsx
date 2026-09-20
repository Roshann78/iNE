import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getPriceHistory, getScrapeLogs, scrapeProduct } from '../api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [productData, historyData, logsData] = await Promise.all([
        getProduct(id),
        getPriceHistory(id),
        getScrapeLogs(id),
      ]);
      setProduct(productData);
      setHistory(historyData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to load product data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeNow = async () => {
    setScraping(true);
    setScrapeMessage('');
    try {
      const result = await scrapeProduct(id);
      if (result.success) {
        setScrapeMessage(`Scraped successfully! Price: $${result.result.price}`);
      } else {
        setScrapeMessage('Scrape failed after all retries.');
      }
      // Reload data
      await loadData();
    } catch (err) {
      setScrapeMessage('Scrape error: ' + err.message);
    } finally {
      setScraping(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!product) return <p className="error">Product not found.</p>;

  // Prepare chart data
  const chartData = history.map((h) => ({
    date: new Date(h.scraped_at).toLocaleString(),
    price: parseFloat(h.price),
  }));

  return (
    <div>
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

      <h1>{product.name}</h1>

      <div className="actions">
        <button onClick={handleScrapeNow} disabled={scraping} className="btn">
          {scraping ? 'Scraping...' : 'Scrape Now'}
        </button>
        {scrapeMessage && <span className="message">{scrapeMessage}</span>}
      </div>

      {/* Price History Chart */}
      <section>
        <h2>Price History</h2>
        {chartData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4a90d9"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="empty-state">No price data yet. Hit "Scrape Now" to get the first reading.</p>
        )}
      </section>

      {/* Price History Table */}
      <section>
        <h2>Price History Table</h2>
        {history.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Price</th>
                <th>In Stock</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{new Date(h.scraped_at).toLocaleString()}</td>
                  <td>${parseFloat(h.price).toFixed(2)}</td>
                  <td>{h.in_stock ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No history entries.</p>
        )}
      </section>

      {/* Scrape Logs Table */}
      <section>
        <h2>Scrape Logs</h2>
        {logs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Attempt</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={`log-${log.status}`}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.attempt_number}</td>
                  <td>
                    <span className={`status-badge status-${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{log.duration_ms ? `${log.duration_ms}ms` : '—'}</td>
                  <td className="error-cell">{log.error_message || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No scrape logs yet.</p>
        )}
      </section>
    </div>
  );
}
