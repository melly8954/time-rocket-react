// src/components/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authStore";
import axios from "axios";
import '../../styles/components/auth.css';

const Login = ({ onLogin, isModal = false }) => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setAccessToken, setUserId, setNickname, rememberMe, setRememberMe } = useAuthStore();
  
  const [userData, setUserData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!userData.username || !userData.password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("password", userData.password);
    formData.append("rememberMe", rememberMe);
    
    try {
      const response = await axios.post("http://localhost:8081/api/users/login", formData, { withCredentials: true });
      const accessToken = response.headers["authorization"];
      
      // 상태 저장
      setAccessToken(accessToken);
      setIsLoggedIn(true);
      localStorage.setItem('accessToken', accessToken);
      
      // accessToken 포함해서 유저 정보 요청
      const userInfo = await axios.get("http://localhost:8081/api/users/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true,
      });
      
      setUserId(userInfo.data.data.userId);
      setNickname(userInfo.data.data.nickname);
      
      setIsLoading(false);
      
      if (onLogin) {
        onLogin(userInfo.data.data, accessToken);
      }
      
      if (!isModal) {
        navigate('/');
      }
      
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '로그인에 실패했습니다.');
      setIsLoading(false);
      return false;
    }
  };
  
  const handleForgotPassword = () => {
    navigate('/password-reset');
  };
  
  return (
    <div className="auth-form login-form">
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">아이디 또는 이메일</label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            placeholder="아이디 또는 이메일을 입력하세요"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        
        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>로그인 상태 유지</span>
          </label>
          
          <button 
            type="button" 
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            비밀번호 찾기
          </button>
        </div>
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      
      <div className="social-login">
        <p>소셜 계정으로 로그인</p>
        <div className="social-buttons">
          <a href="http://localhost:8081/oauth2/authorization/google" className="social-button google">
            <span className="social-icon">G</span>
          </a>
          <a href="http://localhost:8081/oauth2/authorization/kakao" className="social-button kakao">
            <span className="social-icon">K</span>
          </a>
          <a href="http://localhost:8081/oauth2/authorization/naver" className="social-button naver">
            <span className="social-icon">N</span>
          </a>
        </div>
      </div>
      
      {!isModal && (
        <div className="auth-switch">
          <p>
            아직 계정이 없으신가요? <a href="/signup">회원가입</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
