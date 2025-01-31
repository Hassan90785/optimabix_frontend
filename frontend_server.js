require('dotenv').config();  // Add this line to load .env variables

const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'dist/optimabix/browser' directory
app.use(express.static(path.join(__dirname, 'dist/optimabix/browser')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/optimabix/browser/index.html'));
});

let httpsServer;

const cert = fs.readFileSync(process.env.CERT_PATH);
const ca = fs.readFileSync(process.env.CA_PATH);
const key = fs.readFileSync(process.env.PK_PATH);
const httpsOptions = {cert, ca, key};

httpsServer = https.createServer(httpsOptions, app);

const port = process.env.PORT || 443;
httpsServer.listen(port, process.env.HOST, () => {
  console.log(`HTTPS server running on https://${process.env.HOST}:${port}`);
});
