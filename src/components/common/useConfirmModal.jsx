// useConfirmModal.jsx
import { useState } from 'react';

const useConfirmModal = () => {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    title: '확인',
    type: 'default',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: () => {},
  });

  const showConfirm = ({ message, onConfirm, title = '확인', type = 'default', confirmText = '확인', cancelText = '취소' }) => {
    setConfirmModal({
      isOpen: true,
      message,
      title,
      type,
      confirmText,
      cancelText,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  return { confirmModal, showConfirm, closeConfirm };
};

export default useConfirmModal;
