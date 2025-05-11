// src/components/auth/PasswordChange.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../authStore';
import '../../styles/components/auth.css';

const PasswordChange = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const accessToken = useAuthStore(state => state.accessToken);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.patch(`http://localhost:8081/api/users/${userId || 'me'}/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken')}`
        }
      });
      
      alert('비밀번호가 성공적으로 변경되었습니다.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container password-change-container">
      <div className="auth-card">
        <h2>비밀번호 변경</h2>
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">현재 비밀번호</label>
            <input
              type="password"
              id="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="현재 비밀번호 입력"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="영문, 숫자, 특수문자 조합 8자 이상"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="새 비밀번호 재입력"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '비밀번호 변경'}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            <a href="/dashboard">마이페이지로 돌아가기</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;
