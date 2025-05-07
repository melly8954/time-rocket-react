import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/common/Header';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Logout from './components/common/Logout';
import OAuthRedirect from './pages/OAuthRedirect';
import Mypage from "./pages/Mypage";
import useAuthStore from './authStore'; // 경로는 실제 경로로 맞춰줘

function App() {
  const didRun = useRef(false);
  const {
    setIsLoggedIn,
    setAccessToken,
    setNickname,
  } = useAuthStore();

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const checkLoginStatus = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const res = await axios.get("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });
        console.log("로그인 유지됨:", res.data);
        setIsLoggedIn(true);
        setAccessToken(accessToken);
        setNickname(res.data.data.nickname); // 서버 응답 구조에 따라 key 이름 확인
      } catch (err) {
        console.log(err);
        if (err.response?.status === 401) {
          try {
            const res = await axios.post("/api/tokens/refresh", null, {
              withCredentials: true,
            });
            const newAccess = res.headers["authorization"];
            localStorage.setItem("accessToken", newAccess);
            setAccessToken(newAccess);
            await checkLoginStatus(); // 재시도 후 상태 갱신
          } catch (refreshErr) {
            console.log("refresh 실패, 로그아웃 처리");
            localStorage.removeItem("accessToken");
            setIsLoggedIn(false);
            setAccessToken(null);
            setNickname("");
          }
        }
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/redirect" element={<OAuthRedirect />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/rocket" element={<div>로켓 제작 페이지</div>} />
        <Route path="/display" element={<div>진열장 페이지</div>} />
        <Route path="/chest" element={<div>보관함 페이지</div>} />
        <Route path="/community" element={<div>커뮤니티 페이지</div>} />
        <Route path="/mypage" element={<Mypage />} />
      </Routes>
    </Router>
  );
}

export default App;
