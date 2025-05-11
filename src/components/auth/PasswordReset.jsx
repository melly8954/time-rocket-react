// src/components/auth/PasswordReset.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/components/auth.css';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isTempSent, setIsTempSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendTempPassword = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:8081/api/emails/temp-password', { email });
      setIsTempSent(true);
      setError('');
      alert('임시 비밀번호가 이메일로 발송되었습니다.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '임시 비밀번호 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTempPassword = async () => {
    if (!tempPassword) {
      setError('임시 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:8081/api/emails/verify-temporary-password', {
        email,
        tempPassword,
      });
      alert('임시 비밀번호 인증 및 변경이 완료되었습니다.');
      navigate("/auth");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '인증에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetEmail = () => {
    setIsTempSent(false);
    setEmail('');
    setTempPassword('');
    setError('');
  };

  return (
    <div className="auth-container password-reset-container">
      <div className="auth-card">
        <h2>비밀번호 재설정</h2>
        {error && <div className="auth-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <div className="input-with-button">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="가입한 이메일 주소"
              disabled={isTempSent}
            />
            {!isTempSent ? (
              <button 
                type="button" 
                className="verification-button"
                onClick={handleSendTempPassword}
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '임시 비밀번호 발급'}
              </button>
            ) : (
              <button 
                type="button" 
                className="verification-button secondary"
                onClick={handleResetEmail}
              >
                이메일 재입력
              </button>
            )}
          </div>
        </div>
        
        {isTempSent && (
          <div className="form-group">
            <label htmlFor="tempPassword">임시 비밀번호</label>
            <input
              type="password"
              id="tempPassword"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="이메일로 받은 임시 비밀번호"
            />
          </div>
        )}
        
        {isTempSent && (
          <button 
            className="auth-button"
            onClick={handleVerifyTempPassword}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '임시 비밀번호 인증'}
          </button>
        )}
        
        <div className="auth-switch">
          <p>
            <a href="/auth">로그인 페이지로 돌아가기</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
