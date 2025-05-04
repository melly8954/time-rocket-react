import { create } from 'zustand';

const useAuthStore = create((set) => ({
  isLoggedIn: false, // 로그인 상태
  accessToken: null, // accessToken 저장
  rememberMe: false, // 로그인 유지 여부
  nickname: "",  // 닉네임 상태
  setIsLoggedIn: (status) => set({ isLoggedIn: status }), // 로그인 상태 설정
  setAccessToken: (token) => set({ accessToken: token }), // accessToken 설정
  setRememberMe: (status) => set({ rememberMe: status }), // 로그인 상태 유지 설정
  setNickname: (name) => set({ nickname: name }), // 닉네임 설정 
}));

export default useAuthStore;