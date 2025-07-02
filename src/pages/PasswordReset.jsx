import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../style/PasswordReset.module.css';
import { AlertModal } from '../components/common/Modal';
import useAlertModal from '../components/common/useAlertModal';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isTempSent, setIsTempSent] = useState(false);
  const navigate = useNavigate();
  const { alertModal, showAlert, closeAlert, handleApiError } = useAlertModal();
  const [onSuccessNavigate, setOnSuccessNavigate] = useState(false);
  const handleSendTempPassword = async () => {
    if (!email) {
      showAlert('이메일을 입력해주세요.');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/emails/temp-password', { email });
      showAlert('임시 비밀번호가 이메일로 발송되었습니다.');
      setIsTempSent(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleVerifyTempPassword = async () => {
    if (!tempPassword) {
      showAlert('임시 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/emails/verify-temporary-password', {
        email,
        tempPassword,
      });
      setOnSuccessNavigate(true);
      showAlert('임시 비밀번호 인증 및 변경이 완료되었습니다.');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleResetEmail = () => {
    setIsTempSent(false);
    setEmail('');
    setTempPassword('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2>비밀번호 재설정</h2>

        <label>이메일</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 입력"
          disabled={isTempSent}
        />

        <div className={styles.btnGroup}>
          {!isTempSent ? (
            <button className={styles.submitBtn} onClick={handleSendTempPassword}>
              임시 비밀번호 발급
            </button>
          ) : (
            <button className={styles.cancelBtn} onClick={handleResetEmail}>
              이메일 재입력
            </button>
          )}
        </div>

        {isTempSent && (
          <>
            <label>임시 비밀번호 입력</label>
            <input
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="임시 비밀번호 입력"
            />
            <button className={styles.submitBtn} onClick={handleVerifyTempPassword}>
              임시 비밀번호 인증 후 변경
            </button>
          </>
        )}
      </div>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          closeAlert();
          if (onSuccessNavigate) {
            navigate('/');
          }
        }}
        message={alertModal.message}
        title={alertModal.title}
        type={alertModal.type}
      />
    </div>
  );
};

export default PasswordReset;
