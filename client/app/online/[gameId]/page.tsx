'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './gamepage.module.css';

let socket: Socket;
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
  xTurn: boolean
}

const onlineGame = ({ params }: {
  params: {
    gameId: string
  }
}) => {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [table, setTable] = useState([] as string[][]);
  const [isX, setIsX] = useState(false);
  const [xTurn, setXTurn] = useState(true);

  const handlePlay = (row: number, cell: number) => {
    if (!socket) return;
    if (!gameStarted) return;
    if (isX != xTurn) return
    if (table[row][cell] != "") return;
    socket.emit('makeMove', { row, cell });
  }


  useEffect(() => {

    if (!localStorage.getItem('name')) {
      router.back();
      return
    }
    if (params.gameId.length != 5) {
      router.back();
      return
    }


    socket = io('http://168.138.143.251:3002', {
      query: {
        roomid: params.gameId,
        userName: localStorage.getItem('name')
      }
    });
    socket.on('gameStart', (room: Room) => {
      setTable(room.table);
      setXTurn(room.xTurn);
      setIsX(room.players[socket.id].isX);
      setGameStarted(true)
    })
    socket.on('gameUpdate', (room: Room) => {
      setTable(room.table);
      setXTurn(room.xTurn);
      setGameStarted(room.started);
    })

    socket.on('connect', () => {
      console.log(socket.id)
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      router.back();
    });



    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('gameStart');
      socket.disconnect()
    };
  }, []);


  return <div className={styles.container}>
    {isConnected ? (
      gameStarted ? (
        <>
          <h1>{xTurn != isX ? "Oponente jogando" : "Sua vez de jogar"}</h1>
          <div className={styles.gameTable}>
            {table.map((row, idx1) => {
              return <div className={styles.row} key={'ROW' + idx1}>
                {row.map((cell, idx2) => {
                  return <div onClick={() => handlePlay(idx1, idx2)} key={'CELL' + idx2 + idx1} className={styles.cell}>{cell}</div>
                })}
              </div>
            })}
          </div>
        </>
      ) : (
        <div>Esperando por outros jogadores</div>
      )
    ) : (
      <div>Conectando...</div>
    )}
  </div>;
}

export default onlineGame;