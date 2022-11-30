import Link from 'next/link';
import React from 'react';
import JoinInput from '../../components/JoinInput';
import styles from '../page.module.css'


const online: React.FC = () => {
  return (
    <div className={styles.container}>
      <div>
        <h1>Online</h1>
        <Link href={'/online'} className={styles.link} >Criar novo jogo</Link>
        <JoinInput />
      </div>
    </div>
  )
}

export default online;