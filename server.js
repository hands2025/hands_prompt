const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Parsing JSON
app.use(express.json());

// Static files (index.html, CSS, JS)
app.use(express.static(__dirname));

// Routing API
app.use('/api/generate', require('./api/generate'));
app.use('/api/translate', require('./api/translate'));

app.listen(port, () => {
  console.log(`✅ Server jalan di http://localhost:${port}`);
});
