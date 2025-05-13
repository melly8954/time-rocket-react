import api from "./api"; // 커스텀 axios 인스턴스

export const fetchUserProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data.data; // { email, nickname, userId, ... }
  } catch (error) {
    throw error; // 에러는 호출하는 쪽에서 처리
  }
};