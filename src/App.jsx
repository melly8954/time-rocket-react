// src/App.jsx
import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import AuthModal from './components/auth/AuthModal';
import './styles/global.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // 로그인 상태 확인 (로컬 스토리지나 세션으로부터)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(userData));
    }
    
    // 비로그인 사용자에 대한 3분 타이머
    let timer;
    if (!token) {
      timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 3 * 60 * 1000); // 3분
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
  
  // 로그인 처리
  const handleLogin = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setShowAuthModal(false);
  };
  
  // 로그아웃 처리
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <>
      <RouterProvider 
        router={router} 
        context={{ isLoggedIn, currentUser, handleLogin, handleLogout }}
      />
      {showAuthModal && !isLoggedIn && (
        <AuthModal onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;
