import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../authStore';
import styles from '../../style/Header.module.css';

const Header = () => {
  const { isLoggedIn, nickname } = useAuthStore();
  const navigate = useNavigate();

  // 인증이 필요한 메뉴 클릭 시 실행되는 함수
  const handleMenuClick = (e, target) => {
    if (!isLoggedIn) {
      e.preventDefault();  // 클릭 이벤트 취소
      navigate('/login');  // 로그인 페이지로 리다이렉트
    } else {
      // 인증된 상태라면 정상적으로 메뉴 이동
      navigate(target);
    }
  };

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
        <Link to="/rocket" className={styles.link} onClick={(e) => handleMenuClick(e, '/rocket')}>로켓 제작</Link>
        <Link to="/display" className={styles.link} onClick={(e) => handleMenuClick(e, '/display')}>진열장</Link>
        <Link to="/chest" className={styles.link} onClick={(e) => handleMenuClick(e, '/chest')}>보관함</Link>
        <Link to="/community" className={styles.link} >커뮤니티</Link>
      </nav>
    </header>
  );
};

export default Header;
