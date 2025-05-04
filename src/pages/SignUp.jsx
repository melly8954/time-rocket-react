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

  const handleUserInput = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const duplicateNickname = async () => {
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
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
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
        <input type="text" id="email" value={formData.email} onChange={handleUserInput} /><br />

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
