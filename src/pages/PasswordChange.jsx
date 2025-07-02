import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../utils/api";
import { fetchUserProfile } from '../utils/profile';
import styles from '../style/PasswordChange.module.css';
import { AlertModal } from '../components/common/Modal';
import useAlertModal from '../components/common/useAlertModal';


const PasswordChange = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const { userId } = useParams(); // URL 파라미터로 전달된 userId를 받음
    const { alertModal, showAlert, closeAlert, handleApiError } = useAlertModal();
    const [onSuccessNavigate, setOnSuccessNavigate] = useState(false);

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
            setOnSuccessNavigate(true);
            showAlert('비밀번호가 성공적으로 변경되었습니다.');
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
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => {
                    closeAlert();
                    if (onSuccessNavigate) {
                        navigate('/mypage');
                    }
                }}
                message={alertModal.message}
                title={alertModal.title}
                type={alertModal.type}
            />
        </div>
    );
};

export default PasswordChange;
