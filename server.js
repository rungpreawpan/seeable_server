const express = require('express');
const http = require('http');
const app = require('./src/app');

require('dotenv').config();

const PORT = 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
