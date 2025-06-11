/**
 * 백엔드의 message를 최우선으로 사용
 */
export const getErrorMessage = (error, defaultMessage = '요청 처리에 실패했습니다.') => {
  // 백엔드에서 보낸 message 확인
  const backendMessage = error.response?.data?.message;
  
  if (backendMessage) {
    return backendMessage;
  }
  
  // 백엔드 메시지가 없으면 기본 메시지 사용
  return defaultMessage;
};

/**
 * API 에러를 처리하고 사용자에게 알림표시
 */
export const handleApiError = (error, defaultMessage = '요청 처리에 실패했습니다.', navigate = null) => {
  console.error('API 에러:', error);
  console.error('에러 응답:', error.response?.data);
  
  const errorMessage = getErrorMessage(error, defaultMessage);
  alert(errorMessage);
  
};
