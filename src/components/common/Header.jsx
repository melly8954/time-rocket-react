import React from 'react'
import { Link } from 'react-router-dom'
import useAuthStore from '../../authStore';

const Header = () => {
  const { isLoggedIn, nickname } = useAuthStore(); // 로그인 상태 가져오기
  return (
    <header style={styles.header}>
      <div style={styles.topBar}>
        <div style={styles.logoSection}>
          <img
            src="/logo.png" // public/logo.png 경로에 로고 이미지 두기
            alt="logo"
            style={styles.logo}
          />
          <Link to="/" style={styles.titleLink}>
            <h1 style={styles.title}>Time Rocket</h1>
          </Link>
        </div>
        <div style={styles.authButtons}>
          {isLoggedIn ? (
            <>
              <span>{nickname}님 환영합니다!</span>
              <Link to="/logout" style={styles.authLink}>로그아웃</Link>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.authLink}>로그인</Link>
              <Link to="/signup" style={styles.authLink}>회원가입</Link>
            </>
          )}
        </div>
      </div>
      <nav style={styles.nav}>
        <Link to="/rocket" style={styles.link}>로켓 제작</Link>
        <Link to="/display" style={styles.link}>진열장</Link>
        <Link to="/chest" style={styles.link}>보관함</Link>
        <Link to="/community" style={styles.link}>커뮤니티</Link>
      </nav>
    </header>
  )
}

const styles = {
  header: {
    backgroundColor: '#fcebd3',
    color: '#1f3a57',
    padding: '10px 20px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    height: '40px',
  },
  title: {
    fontSize: '24px',
    margin: 0,
  },
  authButtons: {
    display: 'flex',
    gap: '15px',
  },
  authLink: {
    color: '#1f3a57',
    textDecoration: 'none',
    fontSize: '16px',
  },
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    borderTop: '1px solid #444',
    paddingTop: '10px',
  },
  link: {
    color: '#1f3a57',
    textDecoration: 'none',
    fontSize: '18px',
  },
}

export default Header
