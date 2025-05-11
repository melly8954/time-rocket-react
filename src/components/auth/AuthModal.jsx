// src/components/auth/AuthModal.jsx
import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import useAuthStore from '../../authStore';
import '../../styles/components/authModal.css';

const AuthModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const setIsLoggedIn = useAuthStore(state => state.setIsLoggedIn);
  const setAccessToken = useAuthStore(state => state.setAccessToken);
  const setUserId = useAuthStore(state => state.setUserId);
  const setNickname = useAuthStore(state => state.setNickname);
  
  const handleLogin = (userData, token) => {
    setAccessToken(token);
    setIsLoggedIn(true);
    setUserId(userData.userId);
    setNickname(userData.nickname);
    onClose();
  };
  
  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <button className="modal-close-button" onClick={onClose}>×</button>
        
        <div className="modal-logo">
          <img src="/src/assets/rocket.png" alt="TimeRocket" className="modal-logo-image" />
          <h2>TimeRocket</h2>
        </div>
        
        <p className="modal-message">
          TimeRocket의 모든 기능을 이용하려면 로그인이 필요합니다.
        </p>
        
        <div className="auth-tabs">
          <button 
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            로그인
          </button>
          <button 
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            회원가입
          </button>
        </div>
        
        <div className="auth-content">
          {activeTab === 'login' ? (
            <Login onLogin={handleLogin} isModal={true} />
          ) : (
            <Register onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </div>
        
        <div className="continue-as-guest">
          <button className="guest-button" onClick={onClose}>
            로그인 없이 둘러보기
          </button>
          <p className="guest-note">
            일부 기능이 제한될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
