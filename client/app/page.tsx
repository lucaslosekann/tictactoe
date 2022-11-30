import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <div>
        <h1>Jogo da velha</h1>
        <Link href={'/online'} className={styles.link} >Online</Link>
        <Link href={'/offline'} className={styles.link} >Offline</Link>
      </div>
    </div>
  )
}
