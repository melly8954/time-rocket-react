import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../style/PasswordChange.module.css'; // CSS 모듈 import

const PasswordChange = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const { userId } = useParams(); // URL 파라미터로 전달된 userId를 받음

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        try {
            await axios.patch(`/api/users/${userId}/password`, {
                currentPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            navigate('/mypage');
        } catch (error) {
            const errorMsg = error.response?.data?.message || '비밀번호 변경 실패';
            setMessage(errorMsg);
        }
    };

    return (
        <div className={styles['password-change-container']}>
            <h2>비밀번호 변경</h2>
            <form onSubmit={handlePasswordChange}>
                <div className={styles['form-group']}>
                    <label>현재 비밀번호</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div className={styles['form-group']}>
                    <label>새 비밀번호</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                {message && <p className={styles['error-message']}>{message}</p>}
                <button type="submit" className={styles.submitBtn}>비밀번호 변경</button>
            </form>
        </div>
    );
};

export default PasswordChange;
