// src/components/layout/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../authStore';
import Header from './Header';
import Footer from './Footer';
import SpaceBackground from '../ui/SpaceBackground';
import AuthModal from '../auth/AuthModal';

const Layout = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [visitTime, setVisitTime] = useState(Date.now());
  
  // 커뮤니티 페이지 방문 시 3분 타이머 설정
  useEffect(() => {
    if (location.pathname.includes('/community') && !isLoggedIn) {
      setVisitTime(Date.now());
      
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 3 * 60 * 1000); // 3분
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isLoggedIn]);

  return (
    <div className="app-container">
      <SpaceBackground />
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      
      {showAuthModal && !isLoggedIn && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Layout;
