import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../style/PasswordReset.module.css';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isTempSent, setIsTempSent] = useState(false);
  const navigate = useNavigate();

  const handleSendTempPassword = async () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/emails/temp-password', { email });
      alert('임시 비밀번호가 이메일로 발송되었습니다.');
      setIsTempSent(true);
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(err.response.data.message || '오류가 발생했습니다.');
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
    }
  };

  const handleVerifyTempPassword = async () => {
    if (!tempPassword) {
      alert('임시 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/emails/verify-temporary-password', {
        email,
        tempPassword,
      });
      alert('임시 비밀번호 인증 및 변경이 완료되었습니다.');
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(err.response.data.message || '인증 실패');
      } else {
        alert('서버에 연결할 수 없습니다.');
      }
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
              임시 비밀번호 인증
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;
