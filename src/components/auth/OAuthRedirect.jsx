// src/components/auth/OAuthRedirect.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authStore";
import axios from "axios";
import '../../styles/components/auth.css';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { setAccessToken, setIsLoggedIn, setUserId, setNickname } = useAuthStore();
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;  // 이미 실행한 적 있으면 스킵
    effectRan.current = true;

    const getCookie = (name) => {
      const cookies = document.cookie.split(";").map(c => c.trim());
      const match = cookies.find(c => c.startsWith(name + "="));
      return match ? decodeURIComponent(match.split("=")[1]) : null;
    };

    const token = getCookie("accessToken");
    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
      setIsLoggedIn(true);

      axios
        .get("http://localhost:8081/api/users/profile", { 
          headers: { Authorization: `Bearer ${token}` }, 
          withCredentials: true 
        })
        .then((res) => {
          setNickname(res.data.data.nickname);
          setUserId(res.data.data.userId);
        })
        .catch(console.error);

      // 쿠키 삭제
      document.cookie = "accessToken=; path=/; max-age=0";
      navigate("/");
    } else {
      console.error("OAuth redirect: accessToken 쿠키 없음");
      navigate("/auth");
    }
  }, [navigate, setAccessToken, setIsLoggedIn, setUserId, setNickname]);

  return (
    <div className="auth-container oauth-redirect">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;
