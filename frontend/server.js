const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Angular build output can be either:
// - dist/supreme-blue-frontend (classic)
// - dist/supreme-blue-frontend/browser (Angular application builder)
const distRoot = path.join(__dirname, 'dist', 'supreme-blue-frontend');
const distBrowser = path.join(distRoot, 'browser');

const staticDir = fs.existsSync(distBrowser) ? distBrowser : distRoot;
const indexHtml = path.join(staticDir, 'index.html');

app.use(express.static(staticDir, { index: false }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(indexHtml);
});

const port = process.env.PORT || 4200;
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend listening on port ${port}`);
  console.log(`Serving static files from ${staticDir}`);
});
