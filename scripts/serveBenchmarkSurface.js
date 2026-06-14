require('dotenv').config();

const express = require('express');
const path = require('path');

const analyticsRoutes = require('../routes/analytics');

const app = express();

app.use(express.json());
app.use('/renders', express.static(path.join(__dirname, '../public/renders')));
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'benchmark-preview-api',
    timestamp: new Date().toISOString()
  });
});

const port = Number(process.env.BENCHMARK_PREVIEW_PORT || 5000);

app.listen(port, () => {
  console.log(`Benchmark preview API listening on http://127.0.0.1:${port}`);
});