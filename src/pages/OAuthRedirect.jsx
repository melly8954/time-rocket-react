import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../authStore";
import axios from "axios";

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { setAccessToken, setIsLoggedIn, setNickname } = useAuthStore();
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
        .get("/api/users/profile", { headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
        .then(res => setNickname(res.data.data.nickname))
        .catch(() => { /* 에러 무시 */ });

      // 쿠키 삭제
      document.cookie = "accessToken=; path=/; max-age=0";
      navigate("/");
    } else {
      console.error("OAuth redirect: accessToken 쿠키 없음");
      navigate("/login");
    }
  }, [navigate, setAccessToken, setIsLoggedIn, setNickname]);

  return <div>로그인 처리 중…</div>;
};

export default OAuthRedirect;
