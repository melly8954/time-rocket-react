import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authStore"; // zustand store 가져오기
import axios from "axios";
import { handleApiError } from '../utils/errorHandler';
import { AlertModal } from '../components/common/Modal';
import SocialLoginButtons from "../components/ui/SocialLoginButtons";
import styles from '../style/Login.module.css'; // 스타일 적용
import { connectSocket } from "../utils/socket";

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setAccessToken, rememberMe, setRememberMe, setUserId, setNickname } = useAuthStore(); // 상태 업데이트 함수 가져오기
  const [userData, setUserData] = useState({ username: "", password: "" });
  const setStompClient = useAuthStore((state) => state.setStompClient);

  // 모달 상태
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
    showAlert(errorMessage, 'danger', '로그인 실패');
  };

  const handleSignupPage = () => {  // 화살표 함수로 정의
    navigate("/signup");
  };

  const handleLoginInput = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLoginBtn = async () => {
    if (!userData.username.trim()) {
      showAlert('이메일 또는 사용자 닉네임을 입력해주세요.', 'warning', '입력 오류');
      return;
    }

    if (!userData.password.trim()) {
      showAlert('비밀번호를 입력해주세요.', 'warning', '입력 오류');
      return;
    }

    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("password", userData.password);
    formData.append("rememberMe", rememberMe); // rememberMe 값 포함

    try {
      const response = await axios.post("http://localhost:8081/api/users/login", formData, { withCredentials: true });
      const accessToken = response.headers["authorization"];
      // 상태 저장
      setAccessToken(accessToken);
      setIsLoggedIn(true);
      localStorage.setItem('accessToken', accessToken);

      // accessToken 포함해서 유저 정보 요청
      const userInfo = await axios.get("http://localhost:8081/api/users/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true,
      });
      setUserId(userInfo.data.data.userId);
      setNickname(userInfo.data.data.nickname); // 응답 구조에 맞게 닉네임 추출

      // 로그인 성공 후 소켓 연결
      connectSocket(accessToken);

      showAlert("로그인에 성공했습니다!", 'success', '로그인 성공');
      
      // 모달이 닫힌 후 홈으로 이동
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      handleApiError(err, '로그인에 실패했습니다.');
    }
  };

  const navigatePasswordReset = () => {  // 화살표 함수로 정의
    navigate("/password-reset");
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLoginBtn();
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/"); // 이미 로그인되어 있으면 홈으로 리디렉션
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <h2>로그인</h2>

        <label htmlFor="username">이메일 or 사용자 닉네임</label>
        <input
          className={styles.input}
          type="text"
          id="username"
          value={userData.username}
          onChange={handleLoginInput}
          onKeyPress={handleKeyPress}
          placeholder="이메일 또는 닉네임을 입력하세요"
        />

        <label htmlFor="password">비밀번호</label>
        <input
          className={styles.input}
          type="password"
          id="password"
          value={userData.password}
          onChange={handleLoginInput}
          onKeyPress={handleKeyPress}
          placeholder="비밀번호를 입력하세요"
        />

        <label>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          로그인 상태 유지 (Remember me)
        </label>

        <button className={styles.submitBtn} onClick={handleLoginBtn}>로그인</button>

        <div className={styles.linkContainer}>
          <span>계정이 없으신가요? <a onClick={handleSignupPage} className={styles.textLink}>회원가입</a></span>
          <a onClick={navigatePasswordReset} className={styles.textLink}>비밀번호 찾기</a>
        </div>

        <div className={styles.divider}>
          <span>또는</span>
        </div>

        <h2>소셜 로그인</h2>
        <SocialLoginButtons />
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

export default Login;
