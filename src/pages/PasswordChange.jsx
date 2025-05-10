import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../utils/api";
import { fetchUserProfile } from '../utils/profile';
import styles from '../style/PasswordChange.module.css'; 

const PasswordChange = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const { userId } = useParams(); // URL 파라미터로 전달된 userId를 받음

    useEffect(() => {
        const fetchData = async () => {
            await fetchUserProfile();
        };
        fetchData();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await api.patch(`/users/${userId}/password`, {
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
                <div className={styles['form-group']}>
                    <label>새 비밀번호 확인</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
