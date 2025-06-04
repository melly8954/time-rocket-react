import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      accessToken: null,
      rememberMe: false,
      userId: null,
      nickname: "",
      isAuthChecked: false,

      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      setAccessToken: (token) => set({ accessToken: token }),
      setRememberMe: (status) => set({ rememberMe: status }),
      setUserId: (id) => set({ userId: id }),
      setNickname: (name) => set({ nickname: name }),
      setEmail: (email) => set({ email: email }),
      setIsAuthChecked: (value) => set({ isAuthChecked: value }),
    }),
    {
      name: 'userId', // localStorage에 저장될 키
      partialize: (state) => ({
        userId: state.userId, // 이 값만 저장됨
      }),
    }
  )
);

export default useAuthStore;
