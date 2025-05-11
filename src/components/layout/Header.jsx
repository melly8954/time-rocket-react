// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../authStore';
import { NotificationIcon, UserIcon, SettingsIcon, LogoutIcon } from '../ui/Icons';
import '../../styles/components/header.css';

const Header = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // 개별적으로 상태와 함수 가져오기
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const nickname = useAuthStore(state => state.nickname);
  const logout = useAuthStore(state => state.logout);
  
  // 스크롤 위치에 따른 헤더 스타일 변경
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginClick = () => {
    navigate('/auth');
  };
  
  const handleLogout = () => {
    logout();
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <header className={`header ${scrollPosition > 50 ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img src="/src/assets/rocket.png" className="logo-icon" />
            <h1 className="logo-text">TimeRocket</h1>
          </Link>
        </div>
        
        <nav className="header-nav">
          <ul className="nav-list">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/">홈</Link>
            </li>
            <li className={location.pathname.includes('/rockets') ? 'active' : ''}>
              <Link to="/rockets">로켓</Link>
            </li>
            <li className={location.pathname.includes('/meetings') ? 'active' : ''}>
              <Link to="/meetings">모임</Link>
            </li>
            <li className={location.pathname.includes('/community') ? 'active' : ''}>
              <Link to="/community">커뮤니티</Link>
            </li>
            <li className={location.pathname.includes('/friends') ? 'active' : ''}>
              <Link to="/friends">친구</Link>
            </li>
          </ul>
        </nav>
        
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button className="notification-button" aria-label="알림">
                <NotificationIcon />
                <span className="notification-badge">3</span>
              </button>
              
              <div className="user-profile-dropdown">
                <div className="user-avatar">
                  <UserIcon />
                </div>
                <div className="dropdown-content">
                  <div className="dropdown-header">
                    <span className="user-nickname">{nickname || "사용자"}</span>
                    <span className="user-level">Lv.15</span>
                  </div>
                  <div className="dropdown-menu">
                    <Link to="/dashboard" className="dropdown-item">
                      <UserIcon className="item-icon" />
                      마이페이지
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <SettingsIcon className="item-icon" />
                      설정
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <LogoutIcon className="item-icon" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
