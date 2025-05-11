// src/components/auth/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/components/auth.css';

const Register = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: ""
  });
  
  const [isNicknameAvailable, setIsNicknameAvailable] = useState("");
  const [emailCode, setEmailCode] = useState(""); // 사용자가 입력한 인증 코드
  const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 발송 여부
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // 이메일 인증 코드 발송
  const sendEmailCode = async () => {
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`http://localhost:8081/api/emails`, { email: formData.email });
      setIsEmailSent(true);
      setError('');
      alert("이메일로 인증 코드를 전송했습니다.");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '인증 코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증코드 확인
  const verifyEmailCode = async () => {
    if (!emailCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`http://localhost:8081/api/emails/verify-code`, {
        email: formData.email,
        verificationCode: emailCode
      });
      setIsEmailVerified(true);
      setError('');
      alert("이메일 인증이 완료되었습니다!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '인증 코드 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 닉네임 중복 확인
  const checkNickname = async () => {
    if (!formData.nickname) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.get(`http://localhost:8081/api/users/duplicate-nickname/${formData.nickname}`);
      setIsNicknameAvailable("사용 가능한 닉네임입니다.");
      setError('');
    } catch (err) {
      console.error(err);
      setIsNicknameAvailable("");
      setError(err.response?.data?.message || '닉네임 중복 확인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!isEmailVerified) {
      setError('이메일 인증을 완료해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (isNicknameAvailable !== "사용 가능한 닉네임입니다.") {
      setError('닉네임 중복 확인을 해주세요.');
      return;
    }
    
    setIsLoading(true);
    const userData = { 
      email: formData.email, 
      password: formData.password, 
      nickname: formData.nickname 
    };

    try {
      await axios.post(`http://localhost:8081/api/users`, userData);
      alert("회원가입이 완료되었습니다!");
      if (onSwitchToLogin) {
        onSwitchToLogin();
      } else {
        navigate('/auth');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form register-form">
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <div className="input-with-button">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="이메일 주소"
              disabled={isEmailSent && isEmailVerified}
            />
            <button 
              type="button" 
              className="verification-button"
              onClick={sendEmailCode}
              disabled={isLoading || (isEmailSent && isEmailVerified)}
            >
              {isEmailVerified ? '인증 완료' : '인증 코드 발송'}
            </button>
          </div>
        </div>
        
        {isEmailSent && !isEmailVerified && (
          <div className="form-group">
            <label htmlFor="emailCode">인증코드</label>
            <div className="input-with-button">
              <input
                type="text"
                id="emailCode"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="이메일로 받은 인증코드 입력"
              />
              <button 
                type="button" 
                className="verification-button"
                onClick={verifyEmailCode}
                disabled={isLoading}
              >
                인증 확인
              </button>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="영문, 숫자, 특수문자 조합 8자 이상"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호 재입력"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <div className="input-with-button">
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              placeholder="사용할 닉네임"
            />
            <button 
              type="button" 
              className="verification-button"
              onClick={checkNickname}
              disabled={isLoading}
            >
              중복 확인
            </button>
          </div>
          {isNicknameAvailable && (
            <p className="verification-success">{isNicknameAvailable}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          className="auth-button" 
          disabled={isLoading}
        >
          {isLoading ? '처리 중...' : '회원가입'}
        </button>
      </form>
      
      {!onSwitchToLogin && (
        <div className="auth-switch">
          <p>
            이미 계정이 있으신가요? <a href="/auth">로그인</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Register;
