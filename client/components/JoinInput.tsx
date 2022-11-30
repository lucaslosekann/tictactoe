'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styles from '../app/page.module.css'
import inputStyle from './JoinInput.module.css'

const JoinInput: React.FC = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState("");


  useEffect(()=>{
    setName(localStorage.getItem('name') ?? "")
  }, [])
  const handleChangeId = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if(value.length <= 5) setId(value.toUpperCase());
  }

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if(value.length <= 20) setName(value);
    localStorage.setItem('name', value)
  }

  return (
    <>
      <div className={inputStyle.outer}>
        <label htmlFor="idInput">ID da sala: </label>
        <input placeholder="Ex: 4HD6S" type="text" name="id" id="idInput" onChange={handleChangeId} value={id} />
        <label htmlFor="nameInput">Seu nome: </label>
        <input placeholder="Ex: Lucas" type="text" name="name" id="nameInput" onChange={handleChangeName} value={name} />
        <Link href={`/online/${id}`} className={styles.link} >Entrar</Link>
      </div>
    </>
  )
}

export default JoinInput;