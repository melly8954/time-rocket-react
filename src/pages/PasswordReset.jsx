import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertModal } from '../components/common/Modal'; // AlertModal import 추가
import styles from '../style/PasswordReset.module.css';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isTempSent, setIsTempSent] = useState(false);
  const navigate = useNavigate();

  // 모달 상태 관리 추가
  const [alertModal, setAlertModal] = useState({ 
    isOpen: false, 
    message: '', 
    type: 'default',
    title: '알림'
  });

  const showAlert = (message, type = 'default', title = '알림') => {
    setAlertModal({ 
      isOpen: true, 
      message, 
      type,
      title 
    });
  };

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  // 통합된 에러 처리 함수
  const handleApiError = (err, defaultMessage = '오류가 발생했습니다.') => {
    console.error('API 오류:', err);
    
    if (err.response) {
      const errorMessage = err.response.data?.message || defaultMessage;
      showAlert(errorMessage, 'danger', '오류');
    } else {
      showAlert('서버에 연결할 수 없습니다.', 'danger', '연결 오류');
    }
  };

  const handleSendTempPassword = async () => {
    if (!email.trim()) {
      showAlert('이메일을 입력해주세요.', 'warning', '입력 오류');
      return;
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('올바른 이메일 형식을 입력해주세요.', 'warning', '입력 오류');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/emails/temp-password', { email });
      showAlert('임시 비밀번호가 이메일로 발송되었습니다.\n이메일을 확인해주세요.', 'success', '발송 완료');
      setIsTempSent(true);
    } catch (err) {
      console.error('임시 비밀번호 발송 실패:', err);
      handleApiError(err, '임시 비밀번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyTempPassword = async () => {
    if (!tempPassword.trim()) {
      showAlert('임시 비밀번호를 입력해주세요.', 'warning', '입력 오류');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/emails/verify-temporary-password', {
        email,
        tempPassword,
      });
      
      showAlert('임시 비밀번호 인증 및 변경이 완료되었습니다!\n로그인 페이지로 이동합니다.', 'success', '인증 완료');
      
      // 모달이 닫힌 후 홈으로 이동
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error('임시 비밀번호 인증 실패:', err);
      handleApiError(err, '임시 비밀번호 인증에 실패했습니다.');
    }
  };

  const handleResetEmail = () => {
    setIsTempSent(false);
    setEmail('');
    setTempPassword('');
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isTempSent) {
        handleSendTempPassword();
      } else {
        handleVerifyTempPassword();
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2>비밀번호 재설정</h2>
        
        <div className={styles.stepIndicator}>
          <span className={`${styles.step} ${!isTempSent ? styles.active : styles.completed}`}>
            1. 이메일 입력
          </span>
          <span className={`${styles.step} ${isTempSent ? styles.active : ''}`}>
            2. 임시 비밀번호 인증
          </span>
        </div>

        <label>이메일</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="가입하신 이메일을 입력하세요"
          disabled={isTempSent}
          className={isTempSent ? styles.disabled : ''}
        />

        <div className={styles.btnGroup}>
          {!isTempSent ? (
            <button 
              className={styles.submitBtn} 
              onClick={handleSendTempPassword}
              disabled={!email.trim()}
            >
              임시 비밀번호 발급
            </button>
          ) : (
            <button className={styles.cancelBtn} onClick={handleResetEmail}>
              이메일 재입력
            </button>
          )}
        </div>

        {isTempSent && (
          <div className={styles.tempPasswordSection}>
            <div className={styles.infoBox}>
              <p>📧 <strong>{email}</strong>로 임시 비밀번호를 발송했습니다.</p>
              <p>이메일을 확인하고 임시 비밀번호를 입력해주세요.</p>
            </div>
            
            <label>임시 비밀번호 입력</label>
            <input
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="이메일로 받은 임시 비밀번호를 입력하세요"
              autoFocus
            />
            <button 
              className={styles.submitBtn} 
              onClick={handleVerifyTempPassword}
              disabled={!tempPassword.trim()}
            >
              임시 비밀번호 인증 후 변경
            </button>
          </div>
        )}

        <div className={styles.helpText}>
          <p>이메일이 오지 않나요?</p>
          <ul>
            <li>스팸 메일함을 확인해주세요</li>
            <li>이메일 주소가 정확한지 확인해주세요</li>
            <li>몇 분 후 다시 시도해주세요</li>
          </ul>
        </div>
      </div>

      {/* AlertModal 추가 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttonText="확인"
      />
    </div>
  );
};

export default PasswordReset;
