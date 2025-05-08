// src/components/common/Logout.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authStore";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setAccessToken, setNickname } = useAuthStore();
  const effectRan = useRef(false);

  useEffect(() => {
    // StrictMode 시에도 한 번만 실행되도록 guard
    if (effectRan.current) return;
    effectRan.current = true;

    const logout = async () => {
      try {
        await axios.post(
          "http://localhost:8081/api/users/logout",
          null,
          { withCredentials: true }
        );
      } catch (err) {
        // 401(Unathorized) 등 실패 시에도 그냥 넘어가도록
        console.warn("Logout request failed:", err.response?.status);
      } finally {
        // 토큰 삭제 및 상태 초기화
        localStorage.removeItem("accessToken");
        setAccessToken(null);
        setIsLoggedIn(false);
        setNickname("");
        alert("로그아웃 되었습니다.");
        navigate("/login");
      }
    };

    logout();
  }, []); // 빈 배열로, 마운트 시 한 번만 실행

  return null;
};

export default Logout;
