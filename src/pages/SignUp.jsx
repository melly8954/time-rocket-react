import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertModal } from '../components/common/Modal';
import useAlertModal from '../components/common/useAlertModal';
import styles from '../style/SignUp.module.css';

const SignUp = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nickname: ""
    });
    const [isNicknameAvailable, setIsNicknameAvailable] = useState({ message: '', isError: false });
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const [emailCode, setEmailCode] = useState(""); // 사용자가 입력한 인증 코드
    const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 발송 여부
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부
    const { alertModal, showAlert, closeAlert, handleApiError } = useAlertModal();
    const [onSuccessNavigate, setOnSuccessNavigate] = useState(false);
    const handleUserInput = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const sendEmailCode = async () => {
        try {
            await axios.post(`http://localhost:8081/api/emails`, { email: formData.email });
            setIsEmailSent(true);
            showAlert("이메일로 인증 코드를 전송했습니다.");
        } catch (err) {
            handleApiError(err);
            showAlert(err.response.data.message);
        }
    };

    const verifyEmailCode = async () => {
        try {
            await axios.post(`http://localhost:8081/api/emails/verify-code`, {
                email: formData.email,
                verificationCode: emailCode
            });
            setIsEmailVerified(true);
            showAlert("이메일 인증 성공!");
        } catch (err) {
            handleApiError(err);
            showAlert(err.response.data.message)
        }
    };

    const duplicateNickname = async () => {
        if (!formData.nickname.trim()) {
            setIsNicknameAvailable({ message: "닉네임을 입력해주세요.", isError: true });
            setIsNicknameChecked(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8081/api/users/duplicate-nickname?nickname=${formData.nickname}`);
            // 요청 성공 시 처리
            setIsNicknameAvailable({ message: "해당 닉네임을 사용 가능합니다.", isError: false }); // 닉네임 사용 가능
            setIsNicknameChecked(true); // 닉네임 유효성 통과
        } catch (err) {
            console.log(err);
            setIsNicknameAvailable({ message: err.response.data.message, isError: true });
            setIsNicknameChecked(false);
        }
    };

    const formSubmit = async () => {
        if (!isEmailVerified) {
            showAlert("이메일 인증을 완료해주세요.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showAlert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!isNicknameChecked) {
            showAlert("닉네임 중복 확인을 해주세요.");
            return;
        }

        const userData = { email: formData.email, password: formData.password, nickname: formData.nickname };

        try {
            const response = await axios.post(`http://localhost:8081/api/users`, userData);
            setOnSuccessNavigate(true);
            showAlert("회원가입 성공!");
        } catch (err) {
            handleApiError(err);
            showAlert(err.response.data.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h2>회원가입</h2>

                <label>이메일</label>
                <input type="text" id="email" value={formData.email} onChange={handleUserInput} />
                <button onClick={sendEmailCode}>인증 코드 발송</button><br />
                {isEmailSent && (
                    <>
                        <label>인증 코드 입력</label>
                        <input type="text" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} />
                        <button onClick={verifyEmailCode}>인증 확인</button><br />
                    </>
                )}

                <label>비밀번호</label>
                <input type="password" id="password" value={formData.password} onChange={handleUserInput} /><br />

                <label>비밀번호 확인</label>
                <input type="password" id="confirmPassword" value={formData.confirmPassword} onChange={handleUserInput} /><br />

                <label>닉네임</label>
                <div className={styles.nicknameCheck}>
                    <input type="text" id="nickname" value={formData.nickname} onChange={handleUserInput} />
                    <button onClick={duplicateNickname}>중복 체크</button>
                </div>
                <span
                    className={`${styles.nicknameStatus} ${isNicknameAvailable.isError ? styles.nicknameStatusError : ''}`}
                >
                    {isNicknameAvailable.message}
                </span>

                <button className={styles.submitBtn} onClick={formSubmit}>신청</button>
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

export default SignUp;
