'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { io, Socket} from 'socket.io-client';

let socket: Socket;

const onlineGame = ({ params }: {
  params: {
    gameId: string
  }
}) => {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  useEffect(() => {

    if(!localStorage.getItem('name')){
      router.back();
      return
    }
    if(params.gameId.length != 5){
      router.back();
      return
    }


    socket = io('http://168.138.143.251:3002',{
      query: {
        roomid: params.gameId,
        userName: localStorage.getItem('name')
      }
    });
    socket.on('gameStart', ()=>{
      setGameStarted(true)
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


  return <div>
    {isConnected ? (
      gameStarted ? (
        <div>TABULEIRO</div>
      ): (
        <div>Esperando por outros jogadores</div>
      )
    ) : (
      <div>Conectando...</div>
    )}
  </div>;
}

export default onlineGame;