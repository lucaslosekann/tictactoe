interface ServerToClientEvents {

}

interface ClientToServerEvents {

}

interface InterServerEvents {

}

interface SocketData {
  name: string;
}

import express from 'express';
import { Server } from 'socket.io';
const http = require('http');


const app = express();
const server = http.createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>();


io.on('connection', (socket) => {
  socket.data.name = "Lucas"
});

server.listen(3002, () => {
  console.log('Websocket listening on *:3002');
});