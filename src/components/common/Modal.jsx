import React from 'react';
import styles from '/src/style/Modal.module.css';
import { CloseIcon } from '/src/components/ui/Icons';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium', // 'small', 'medium', 'large'
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${styles[size]} ${className}`}>
        {(title || showCloseButton) && (
          <div className={styles.modalHeader}>
            {title && <h2 className={styles.modalTitle}>{title}</h2>}
            {showCloseButton && (
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="닫기"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

// 확인/취소 버튼이 있는 확인 모달
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'default' // 'default', 'danger', 'warning', 'success'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      closeOnOverlayClick={false}
    >
      <div className={styles.confirmModal}>
        <p className={styles.confirmMessage}>{message}</p>
        <div className={styles.confirmButtons}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.button} ${styles.confirmButton} ${styles[type]}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// 알림 모달 (OK 버튼만)
export const AlertModal = ({
  isOpen,
  onClose,
  title = '알림',
  message,
  buttonText = '확인',
  type = 'default'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
    >
      <div className={styles.alertModal}>
        <p className={styles.alertMessage}>{message}</p>
        <div className={styles.alertButtons}>
          <button
            className={`${styles.button} ${styles.confirmButton} ${styles[type]}`}
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;