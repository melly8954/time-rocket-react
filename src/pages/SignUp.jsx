import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal } from '../components/common/Modal';
import styles from '../style/SignUp.module.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nickname: ""
    });
    const [isNicknameAvailable, setIsNicknameAvailable] = useState("");
    const [emailCode, setEmailCode] = useState("");
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

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
        showAlert(errorMessage, 'danger', '오류');
    };

    const handleUserInput = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const sendEmailCode = async () => {
        if (!formData.email.trim()) {
            showAlert("이메일을 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert("올바른 이메일 형식을 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        try {
            await axios.post(`http://localhost:8081/api/emails`, { email: formData.email });
            setIsEmailSent(true);
            showAlert("이메일로 인증 코드를 전송했습니다.", 'success', '전송 완료');
        } catch (err) {
            console.error('이메일 전송 실패:', err);
            handleApiError(err, '이메일 전송에 실패했습니다.');
        }
    };

    const verifyEmailCode = async () => {
        if (!emailCode.trim()) {
            showAlert("인증 코드를 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        try {
            await axios.post(`http://localhost:8081/api/emails/verify-code`, {
                email: formData.email,
                verificationCode: emailCode
            });
            setIsEmailVerified(true);
            showAlert("이메일 인증 성공!", 'success', '인증 완료');
        } catch (err) {
            console.error('인증 실패:', err);
            handleApiError(err, '인증에 실패했습니다.');
        }
    };

    const duplicateNickname = async () => {
        if (!formData.nickname.trim()) {
            showAlert("닉네임을 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        // 닉네임 길이 검사
        if (formData.nickname.length < 2 || formData.nickname.length > 20) {
            showAlert("닉네임은 2자 이상 20자 이하로 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8081/api/users/duplicate-nickname/${formData.nickname}`);
            setIsNicknameAvailable("해당 닉네임을 사용 가능합니다.");
            showAlert("사용 가능한 닉네임입니다.", 'success', '중복 확인 완료');
        } catch (err) {
            console.error('닉네임 중복 확인 실패:', err);
            setIsNicknameAvailable("");
            handleApiError(err, '닉네임 중복 확인에 실패했습니다.');
        }
    };

    const formSubmit = async () => {
        // 입력값 검증
        if (!formData.email.trim()) {
            showAlert("이메일을 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        if (!formData.password.trim()) {
            showAlert("비밀번호를 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        if (!formData.confirmPassword.trim()) {
            showAlert("비밀번호 확인을 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        if (!formData.nickname.trim()) {
            showAlert("닉네임을 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        if (!isEmailVerified) {
            showAlert("이메일 인증을 완료해주세요.", 'warning', '인증 필요');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showAlert("비밀번호가 일치하지 않습니다.", 'warning', '입력 오류');
            return;
        }

        if (!isNicknameAvailable) {
            showAlert("닉네임 중복 확인을 해주세요.", 'warning', '중복 확인 필요');
            return;
        }

        // 비밀번호 강도 검사
        if (formData.password.length < 8) {
            showAlert("비밀번호는 8자 이상 입력해주세요.", 'warning', '입력 오류');
            return;
        }

        const userData = { 
            email: formData.email, 
            password: formData.password, 
            nickname: formData.nickname 
        };

        try {
            const response = await axios.post(`http://localhost:8081/api/users`, userData);
            showAlert("회원가입이 완료되었습니다!", 'success', '가입 완료');
            
            // 모달이 닫힌 후 홈으로 이동
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('회원가입 실패:', err);
            handleApiError(err, '회원가입에 실패했습니다.');
        }
    };

    // Enter 키 처리
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            formSubmit();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h2>회원가입</h2>

                <label>이메일</label>
                <input 
                    type="email" 
                    id="email" 
                    value={formData.email} 
                    onChange={handleUserInput}
                    placeholder="이메일을 입력하세요"
                />
                <button onClick={sendEmailCode} disabled={isEmailSent}>
                    {isEmailSent ? '전송 완료' : '인증 코드 발송'}
                </button><br />
                
                {isEmailSent && (
                    <>
                        <label>인증 코드 입력</label>
                        <input 
                            type="text" 
                            value={emailCode} 
                            onChange={(e) => setEmailCode(e.target.value)}
                            placeholder="인증 코드를 입력하세요"
                            disabled={isEmailVerified}
                        />
                        <button onClick={verifyEmailCode} disabled={isEmailVerified}>
                            {isEmailVerified ? '인증 완료' : '인증 확인'}
                        </button><br />
                    </>
                )}

                <label>비밀번호</label>
                <input 
                    type="password" 
                    id="password" 
                    value={formData.password} 
                    onChange={handleUserInput}
                    onKeyPress={handleKeyPress}
                    placeholder="비밀번호를 입력하세요 (8자 이상)"
                /><br />

                <label>비밀번호 확인</label>
                <input 
                    type="password" 
                    id="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleUserInput}
                    onKeyPress={handleKeyPress}
                    placeholder="비밀번호를 다시 입력하세요"
                /><br />

                <label>닉네임</label>
                <div className={styles.nicknameCheck}>
                    <input 
                        type="text" 
                        id="nickname" 
                        value={formData.nickname} 
                        onChange={handleUserInput}
                        onKeyPress={handleKeyPress}
                        placeholder="닉네임을 입력하세요 (2-20자)"
                    />
                    <button onClick={duplicateNickname}>중복 체크</button>
                </div>
                <span className={styles.nicknameStatus}>{isNicknameAvailable}</span><br />

                <button className={styles.submitBtn} onClick={formSubmit}>가입하기</button>
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

export default SignUp;
