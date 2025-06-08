// src/components/common/Logout.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../authStore";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn, setAccessToken, setUserId, setNickname } = useAuthStore();
  const effectRan = useRef(false);
  const stompClient = useAuthStore((state) => state.stompClient);
  const clearStompClient = useAuthStore((state) => state.clearStompClient);

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
        setUserId(null); // zustand persist 로 관리하기떄문에 null 형태로 삭제처리
        setNickname("");
        if (stompClient && stompClient.connected) {
          stompClient.deactivate();
          console.log("소켓 연결 종료됨 (로그아웃 시)");
        }
        clearStompClient();
        alert("로그아웃 되었습니다.");
        navigate("/login");
      }
    };

    logout();
  }, []); // 빈 배열로, 마운트 시 한 번만 실행

  return null;
};

export default Logout;
