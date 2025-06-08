import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authStore"; // zustand store 가져오기
import axios from "axios";
import SocialLoginButtons from "../components/ui/SocialLoginButtons";
import styles from '../style/Login.module.css'; // 스타일 적용
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn, setAccessToken, rememberMe, setRememberMe, setUserId, setNickname } = useAuthStore(); // 상태 업데이트 함수 가져오기
  const [userData, setUserData] = useState({ username: "", password: "" });
  const setStompClient = useAuthStore((state) => state.setStompClient);

  const handleSignupPage = () => {  // 화살표 함수로 정의
    navigate("/signup");
  };

  const handleLoginInput = (e) => {
    const { id, value } = e.target;
    setUserData((prev) => ({ ...prev, [id]: value }));
  };

  const connectSocket = (token) => {
    const socket = new SockJS("http://localhost:8081/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("STOMP 연결됨");
      },
      onDisconnect: () => console.log("STOMP 연결 해제됨"),
    });

    stompClient.activate();
    setStompClient(stompClient);
  };

  const handleLoginBtn = async () => {
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

      alert("로그인 성공!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.response.data.message);
    }
  };

  const navigatePasswordReset = () => {  // 화살표 함수로 정의
    navigate("/password-reset");
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
        />

        <label htmlFor="password">비밀번호</label>
        <input
          className={styles.input}
          type="password"
          id="password"
          value={userData.password}
          onChange={handleLoginInput}
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
    </div>
  );
};

export default Login;
