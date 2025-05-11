// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import { RocketIcon } from '../components/ui/Icons';
import useAuthStore from '../authStore';
import '../styles/components/auth.css';

const AuthPage = ({ initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  
  // 이미 로그인된 경우 홈으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-stars">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
            }}
          ></div>
        ))}
      </div>
      
      <div className="auth-planets">
        <div className="planet planet-1"></div>
        <div className="planet planet-2"></div>
      </div>
      
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-container">
            <RocketIcon className="auth-logo-icon" />
          </div>
          <h1 className="auth-title">TimeRocket</h1>
        </div>
        
        <div className="auth-description">
          <p>시간과 우주를 넘나드는 여정을 시작하세요</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}>
            로그인
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}>
            회원가입
          </button>
        </div>
        
        <div className="auth-content">
          {activeTab === 'login' ? (
            <Login />
          ) : (
            <Register onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
