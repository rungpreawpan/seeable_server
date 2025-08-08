const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

require('dotenv').config();

const PORT = 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// socket
io.on('connection', (socket) => {
  console.log('Client connected via Socket.IO');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.set('io', io);
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
