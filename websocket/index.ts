interface ServerToClientEvents {
  gameStart: () => void;
}

interface ClientToServerEvents {

}

interface InterServerEvents {

}

interface SocketData {
  name: string;
  room: string;
  activeRoom?: Room;
}

interface Room {
  players: {
    [id: string]: {
      timestamp: string;
      name: string;
      isX: boolean;
    };
  }
  started: boolean;
  table: string[];
}
interface Rooms {
  [id: string] : Room;
}


const DEFAULT_TABLE : string[] = [];


import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: '*'
  }
});


var rooms : Rooms = {};


io.on('connection', (socket) => {
  if(typeof socket.handshake.query.userName != 'string'
    || typeof socket.handshake.query.roomid != 'string'){
    console.log('TYPE ERROR')
    socket.disconnect();
    return;
  }
  socket.data.name = socket.handshake.query.userName;
  socket.data.room = socket.handshake.query.roomid;
  if((Object.entries(rooms[socket.data.room]?.players ?? {}).length) >= 2){
    console.log('MAX PLAYERS')
    socket.disconnect();
    return
  }
  if(io.sockets.adapter.rooms.get(socket.data.room)?.has(socket.id)){
    console.log('ALREADY IN ROOM')
    socket.disconnect();
    return;
  }
  socket.join(socket.data.room)
  let activeRoom : Room;
  if(rooms[socket.data.room]){
    activeRoom = rooms[socket.data.room]
    activeRoom.players[socket.id] = {
      timestamp : Date.now().toString(),
      name: socket.data.name,
      isX: getIsX(socket.data.room)
    }
    console.log(`${socket.data.name}-${socket.id} entrou na sala ${socket.data.room}`);
  }else{
    activeRoom = {
      players: {},
      started: false,
      table: DEFAULT_TABLE
    }
    activeRoom.players[socket.id] = {
      timestamp : Date.now().toString(),
      name: socket.data.name,
      isX: getIsX(socket.data.room)
    }
    rooms[socket.data.room] = activeRoom;
    console.log('Sala '+ socket.data.room + ' criada!')
    console.log(`${socket.data.name}-${socket.id} entrou na sala ${socket.data.room}`);
  } 
  socket.data.activeRoom = activeRoom;

  if((Object.entries(rooms[socket.data.room]?.players ?? {}).length) === 2){
    rooms[socket.data.room].started = true;
    io.to(socket.data.room).emit('gameStart');
  }

  socket.on('disconnect', ()=>{
    if(socket.data.room){
      socket.leave(socket.data.room);
    }
    delete activeRoom.players[socket.id];
    if(socket.data.room){
      rooms[socket.data.room].started = false;
      rooms[socket.data.room].table = DEFAULT_TABLE;
    }
    if(Object.entries(activeRoom.players ?? {}).length == 0){
      if(socket.data.room){
        delete rooms[socket.data.room]
        console.log('Sala '+ socket.data.room + ' deletada!')
      }
    }
  })
});


httpServer.listen(3002);



function getIsX(room: string) : boolean{
  const playersInRoom = Object.entries(rooms[room]?.players ?? {})
  if(playersInRoom.length == 0){
    return Math.random() < 0.5;
  }else{
    return !playersInRoom[0][1].isX
  }
}