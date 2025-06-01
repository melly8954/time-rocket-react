import React, { useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useAuthStore from './authStore';
import { setNavigator } from "./utils/navigate";
import { fetchUserProfile } from './utils/profile';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import SpaceBackground from "./components/common/SpaceBackground";
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Logout from './components/common/Logout';
import PasswordReset from './pages/PasswordReset';
import OAuthRedirect from './pages/OAuthRedirect';
import Mypage from "./pages/MyPage.jsx";
import PasswordChange from "./pages/PasswordChange";
import RocketCreate from "./pages/RocketCreate";
import RocketChest from './pages/RocketChest';
import Display from './pages/Display';
function App() {
  const didRun = useRef(false);
  const {
    setIsLoggedIn,
    setAccessToken,
    setUserId,
    setNickname,
    setIsAuthChecked,
    isAuthChecked
  } = useAuthStore();

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const checkLoginStatus = async () => {
      try {
        const data = await fetchUserProfile(); // 커스텀 API 호출
        console.log("로그인 유지됨:", data);
        setIsLoggedIn(true);
        setNickname(data.nickname);
        setUserId(data.userId);
        // setAccessToken 생략 가능: 인터셉터에서 이미 갱신함
      } catch (err) {
        console.log("로그인 상태 확인 실패:", err);
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
        setAccessToken(null);
        setNickname("");
      } finally {
        setIsAuthChecked(true); // ✅ 무조건 체크 완료됨을 표시
      }
    };

    checkLoginStatus();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate); // navigate를 전역으로 설정
  }, [navigate]);

  if (!isAuthChecked) {
    return null; // 로딩 중엔 아무것도 렌더링하지 않음
  }
  
  return (
    <>
      <SpaceBackground />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/oauth/redirect" element={<OAuthRedirect />} />
        <Route path="/logout" element={<Logout />} />

        {/* 로켓 관련 라우트 */}
        <Route path="/rockets/create" element={<RocketCreate />} />

        {/* 보관함(Chest) 관련 라우트 - API 명세에 맞춤 */}
        <Route path="/chests" element={<RocketChest />} />
        <Route path="/chests/:id" element={<RocketChest />} />

        {/* 진열장 페이지 */}
        <Route path="/display" element={<Display />} />

        <Route path="/community" element={<div>커뮤니티 페이지</div>} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/password-change/:userId" element={<PasswordChange />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
