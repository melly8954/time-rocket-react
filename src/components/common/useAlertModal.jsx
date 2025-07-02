import { useState } from 'react';

const useAlertModal = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: '',
    type: 'default',
    title: '알림'
  });

  const showAlert = (message, type = 'default', title = '알림') => {
    setAlertModal({
      isOpen: true,
      message,
      type,
      title
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleApiError = (err, defaultMessage = '오류가 발생했습니다.') => {
    console.error('API 오류:', err);
    const errorMessage = err.response?.data?.message;
    showAlert(errorMessage, 'danger', '오류');
  };

  return { alertModal, showAlert, closeAlert, handleApiError };
};

export default useAlertModal;