import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../style/SignUp.module.css';

const SignUp = () => {
    const navigate = useNavigate(); // useNavigate 훅 사용
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        nickname: ""
    });
    const [isNicknameAvailable, setIsNicknameAvailable] = useState("");
    const [emailCode, setEmailCode] = useState(""); // 사용자가 입력한 인증 코드
    const [isEmailSent, setIsEmailSent] = useState(false); // 이메일 발송 여부
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 완료 여부

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
            alert("이메일로 인증 코드를 전송했습니다.");
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }
    };

    const verifyEmailCode = async () => {
        try {
            await axios.post(`http://localhost:8081/api/emails/verify-code`, {
                email: formData.email,
                verificationCode: emailCode
            });
            setIsEmailVerified(true);
            alert("이메일 인증 성공!");
        } catch (err) {
            console.log(err);
            alert(err.response.data.message);
        }
    };

    const duplicateNickname = async () => {
        if (!formData.nickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8081/api/users/duplicate-nickname/${formData.nickname}`);
            // 요청 성공 시 처리
            setIsNicknameAvailable("해당 닉네임을 사용 가능합니다."); // 닉네임 사용 가능
        } catch (err) {
            console.log(err);
            if (err.response) {
                const statusCode = err.response.status;
                setIsNicknameAvailable("");
                if (statusCode === 400) {
                    alert("400 Error: 잘못된 요청입니다.");
                } else if (statusCode === 500) {
                    alert("500 Error: 서버에서 문제가 발생했습니다.");
                } else {
                    alert(`알 수 없는 오류 발생: ${statusCode}`);
                }
            } else {
                alert("네트워크 오류 또는 요청을 처리할 수 없습니다.");
            }
        }
    };

    const formSubmit = async () => {
        if (!isEmailVerified) {
            alert("이메일 인증을 완료해주세요.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!isNicknameAvailable) {
            alert("닉네임 중복 확인을 해주세요.");
            return;
        }

        const userData = { email: formData.email, password: formData.password, nickname: formData.nickname };

        try {
            const response = await axios.post(`http://localhost:8081/api/users`, userData);
            alert("회원가입 성공!");
            navigate('/');
        } catch (err) {
            console.log(err);
            if (err.response) {
                const statusCode = err.response.status;
                if (statusCode === 400) {
                    alert("400 Error: 잘못된 요청입니다.");
                } else if (statusCode === 500) {
                    alert("500 Error: 서버에서 문제가 발생했습니다.");
                } else {
                    alert(`알 수 없는 오류 발생: ${statusCode}`);
                }
            } else {
                alert("네트워크 오류 또는 요청을 처리할 수 없습니다.");
            }
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
                <span className={styles.nicknameStatus}>{isNicknameAvailable}</span><br />

                <button className={styles.submitBtn} onClick={formSubmit}>신청</button>
            </div>
        </div>
    );
};

export default SignUp;
