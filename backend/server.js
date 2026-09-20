require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route imports (will be added in Stage 3)
const searchRoutes = require('./routes/search');
const productsRoutes = require('./routes/products');
const scrapeRoutes = require('./routes/scrape');

app.use('/api', searchRoutes);
app.use('/api', productsRoutes);
app.use('/api', scrapeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
