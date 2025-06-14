import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../utils/api";
import { fetchUserProfile } from '../utils/profile';
import { AlertModal } from '../components/common/Modal'; // AlertModal import 추가
import styles from '../style/PasswordChange.module.css'; 

const PasswordChange = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { userId } = useParams();

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
        
        const errorMessage = err.response?.data?.message || defaultMessage;
        setMessage(errorMessage);
        showAlert(errorMessage, 'danger', '비밀번호 변경 실패');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchUserProfile();
            } catch (err) {
                console.error("프로필 불러오기 실패", err);
                showAlert("프로필 정보를 불러오는데 실패했습니다.", 'danger', '로드 실패');
            }
        };
        fetchData();
    }, []);

    // 비밀번호 강도 검사
    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) {
            return { isValid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' };
        }

        const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
        
        if (strengthCount < 2) {
            return { 
                isValid: false, 
                message: '비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다.' 
            };
        }

        return { isValid: true, message: '' };
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');

        // 입력값 검증
        if (!currentPassword.trim()) {
            const errorMsg = '현재 비밀번호를 입력해주세요.';
            setMessage(errorMsg);
            showAlert(errorMsg, 'warning', '입력 오류');
            return;
        }

        if (!newPassword.trim()) {
            const errorMsg = '새 비밀번호를 입력해주세요.';
            setMessage(errorMsg);
            showAlert(errorMsg, 'warning', '입력 오류');
            return;
        }

        if (!confirmPassword.trim()) {
            const errorMsg = '새 비밀번호 확인을 입력해주세요.';
            setMessage(errorMsg);
            showAlert(errorMsg, 'warning', '입력 오류');
            return;
        }

        // 비밀번호 일치 확인
        if (newPassword !== confirmPassword) {
            const errorMsg = '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.';
            setMessage(errorMsg);
            showAlert(errorMsg, 'warning', '입력 오류');
            return;
        }

        // 현재 비밀번호와 새 비밀번호 동일 여부 확인
        if (currentPassword === newPassword) {
            const errorMsg = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
            setMessage(errorMsg);
            showAlert(errorMsg, 'warning', '입력 오류');
            return;
        }

        // 새 비밀번호 강도 검사
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setMessage(passwordValidation.message);
            showAlert(passwordValidation.message, 'warning', '비밀번호 강도 부족');
            return;
        }

        setIsLoading(true);

        try {
            await api.patch(`/users/${userId}/password`, {
                currentPassword,
                newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });
            
            showAlert('비밀번호가 성공적으로 변경되었습니다.', 'success', '변경 완료');
            
            // 모달이 닫힌 후 마이페이지로 이동
            setTimeout(() => {
                navigate('/mypage');
            }, 1500);
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            handleApiError(error, '비밀번호 변경에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 비밀번호 강도 표시
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, text: '', color: '#ddd' };

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const length = password.length;

        let strength = 0;
        if (length >= 8) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumbers) strength++;
        if (hasSpecialChar) strength++;

        const strengthLevels = [
            { strength: 0, text: '', color: '#ddd' },
            { strength: 1, text: '매우 약함', color: '#ff4444' },
            { strength: 2, text: '약함', color: '#ff8800' },
            { strength: 3, text: '보통', color: '#ffbb00' },
            { strength: 4, text: '강함', color: '#88cc00' },
            { strength: 5, text: '매우 강함', color: '#00cc44' }
        ];

        return strengthLevels[strength];
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className={styles['password-change-container']}>
            <div className={styles['form-card']}>
                <h2>🔐 비밀번호 변경</h2>
                <p className={styles['description']}>
                    보안을 위해 현재 비밀번호를 입력하고 새로운 비밀번호를 설정해주세요.
                </p>
                
                <form onSubmit={handlePasswordChange}>
                    <div className={styles['form-group']}>
                        <label>현재 비밀번호</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="현재 사용 중인 비밀번호를 입력하세요"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className={styles['form-group']}>
                        <label>새 비밀번호</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새로운 비밀번호를 입력하세요 (8자 이상)"
                            required
                            disabled={isLoading}
                        />
                        {newPassword && (
                            <div className={styles['password-strength']}>
                                <div 
                                    className={styles['strength-bar']} 
                                    style={{ 
                                        width: `${(passwordStrength.strength / 5) * 100}%`,
                                        backgroundColor: passwordStrength.color 
                                    }}
                                ></div>
                                <span 
                                    className={styles['strength-text']}
                                    style={{ color: passwordStrength.color }}
                                >
                                    {passwordStrength.text}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className={styles['form-group']}>
                        <label>새 비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            required
                            disabled={isLoading}
                        />
                        {confirmPassword && newPassword && (
                            <div className={styles['password-match']}>
                                {newPassword === confirmPassword ? (
                                    <span className={styles['match-success']}>✓ 비밀번호가 일치합니다</span>
                                ) : (
                                    <span className={styles['match-error']}>✗ 비밀번호가 일치하지 않습니다</span>
                                )}
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={styles['message-box']}>
                            <p className={styles['error-message']}>⚠️ {message}</p>
                        </div>
                    )}

                    <div className={styles['password-requirements']}>
                        <h4>비밀번호 요구사항:</h4>
                        <ul>
                            <li className={newPassword.length >= 8 ? styles.met : ''}>
                                최소 8자 이상
                            </li>
                            <li className={/[A-Z]/.test(newPassword) || /[a-z]/.test(newPassword) ? styles.met : ''}>
                                영문자 포함
                            </li>
                            <li className={/\d/.test(newPassword) ? styles.met : ''}>
                                숫자 포함 (권장)
                            </li>
                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? styles.met : ''}>
                                특수문자 포함 (권장)
                            </li>
                        </ul>
                    </div>

                    <div className={styles['button-group']}>
                        <button 
                            type="button" 
                            className={styles['cancel-btn']}
                            onClick={() => navigate('/mypage')}
                            disabled={isLoading}
                        >
                            취소
                        </button>
                        <button 
                            type="submit" 
                            className={styles['submit-btn']}
                            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        >
                            {isLoading ? '변경 중...' : '비밀번호 변경'}
                        </button>
                    </div>
                </form>
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

export default PasswordChange;
