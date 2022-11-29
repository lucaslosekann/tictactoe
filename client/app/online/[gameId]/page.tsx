import React from 'react';

// import { Container } from './styles';
const onlineGame = ({ params }: {
  params: {
    gameId: string
  }
}) => {
  return <div>
    {params.gameId}
  </div>;
}

export default onlineGame;