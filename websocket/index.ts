interface ServerToClientEvents {
  gameStart: (room: Room) => void;
  gameUpdate: (room: Room) => void;
}

interface ClientToServerEvents {
  makeMove: (coord: {
    row: number,
    cell: number
  }) => void;
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
  table: string[][];
  xTurn: boolean;
}
interface Rooms {
  [id: string] : Room;
}


const GET_DEFAULT_TABLE : ()=>string[][] = ()=>([
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
]);


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
      xTurn: true,
      players: {},
      started: false,
      table: GET_DEFAULT_TABLE()
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
    rooms[socket.data.room].xTurn = true;
    io.to(socket.data.room).emit('gameStart', activeRoom);
  }



  socket.on('makeMove', ({ cell, row })=>{
    if(!socket.data.room)return;
    const room = rooms[socket.data.room]
    const player = room.players[socket.id]
    if(!player)return;
    if(room.xTurn != player.isX)return;
    if(room.table[row][cell] != "")return;
    room.xTurn = !room.xTurn;
    room.table[row][cell] = player.isX ? 'X' : 'O';
    if(checkEndGame([...room.table]).end){
      room.xTurn = true;
      room.table = GET_DEFAULT_TABLE();
      room.started = true;
      io.to(socket.data.room).emit('gameUpdate', room)
      return;
    };
    io.to(socket.data.room).emit('gameUpdate', room)
  })
  socket.on('disconnect', ()=>{
    if(socket.data.room){
      socket.leave(socket.data.room);
    }
    delete activeRoom.players[socket.id];
    if(socket.data.room){
      rooms[socket.data.room].started = false;
      rooms[socket.data.room].table = GET_DEFAULT_TABLE();
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


function checkEndGame(table: string[][]) : {end: boolean, xWin?: boolean, tie?: boolean} {
  let endObj = {
    end:false,
    xWin: false,
    tie: false
  }

  //Horizontal Checking
  table.forEach(row => {
    let X = row.every((cell) => cell == 'X')
    let O = row.every((cell) => cell == 'O')
    if(X){
      endObj =  {
        end: true,
        xWin: true,
        tie: false
      };
    }else if(O){
      endObj =  {
        end: true,
        xWin: false,
        tie: false
      };
    }
  })

  //Vertical Checking
  for (let i = 0; i < table.length; i++) {
    const column = [table[0][i],table[1][i],table[2][i]];
    let X = column.every((cell) => cell == 'X')
    let O = column.every((cell) => cell == 'O')
    if(X){
      endObj =  {
        end: true,
        xWin: true,
        tie: false
      };
    }else if(O){
      endObj =  {
        end: true,
        xWin: false,
        tie: false
      };
    }
  }


  //Diagonal Checking
  if(table[0][0] == 'X' && table[1][1] == 'X' && table[2][2] == 'X'){
    endObj =  {
      end: true,
      xWin: true,
      tie: false
    };
  };
  if(table[0][0] == 'O' && table[1][1] == 'O' && table[2][2] == 'O'){
    endObj =  {
      end: true,
      xWin: false,
      tie: false
    };
  };

  //Opposite Diagonal Checking
  if(table[0][2] == 'X' && table[1][1] == 'X' && table[2][0] == 'X'){
    endObj =  {
      end: true,
      xWin: true,
      tie: false
    };
  };
  if(table[0][2] == 'O' && table[1][1] == 'O' && table[2][0] == 'O'){
    endObj =  {
      end: true,
      xWin: false,
      tie: false
    };
  };

  if(table.every(row => row.every(cell => cell != ""))){
    endObj.end = true;
    endObj.tie = true;
  };
  return endObj;
} 