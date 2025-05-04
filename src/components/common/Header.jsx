import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../authStore';
import styles from '../../style/Header.module.css';

const Header = () => {
  const { isLoggedIn, nickname } = useAuthStore();

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.logoSection}>
          <img src="/logo.png" alt="logo" className={styles.logo} />
          <Link to="/" className={styles.titleLink}>
            <h1 className={styles.title}>Time Rocket</h1>
          </Link>
        </div>
        <div className={styles.authButtons}>
          {isLoggedIn ? (
            <>
              <span>{nickname}님 환영합니다!</span>
              <Link to="/logout" className={styles.authLink}>로그아웃</Link>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.authLink}>로그인</Link>
              <Link to="/signup" className={styles.authLink}>회원가입</Link>
            </>
          )}
        </div>
      </div>
      <nav className={styles.nav}>
        <Link to="/rocket" className={styles.link}>로켓 제작</Link>
        <Link to="/display" className={styles.link}>진열장</Link>
        <Link to="/chest" className={styles.link}>보관함</Link>
        <Link to="/community" className={styles.link}>커뮤니티</Link>
      </nav>
    </header>
  );
};

export default Header;