import axios from "axios";
import useAuthStore from "../authStore";
import { goTo } from "./navigate"; // 전역 navigate 사용
import { connectSocket } from "./socket";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 토큰 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post("/api/tokens/refresh", null, {
          withCredentials: true,
        });
        const newAccess = res.headers["authorization"];
        localStorage.setItem("accessToken", newAccess);
        console.log("Jwt 토큰 재발급 성공");
        // axios 기본 헤더도 갱신 (중요)
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

        // 리프레시 성공 후 원래 요청 재시도
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        // 기존 STOMP 연결 종료 후 새 토큰으로 재연결
        const stompClient = useAuthStore.getState().stompClient;
        if (stompClient?.connected) {
          stompClient.deactivate(); // 연결 종료
        }
        connectSocket(newAccess); // 새 토큰으로 다시 연결

        return api(originalRequest);
      } catch (refreshError) {
        console.log("토큰 재발급 실패");
        localStorage.removeItem("accessToken");
        const { setIsLoggedIn, setAccessToken, setNickname } = useAuthStore.getState();
        setIsLoggedIn(false);
        setAccessToken(null);
        setNickname("");
        goTo("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
