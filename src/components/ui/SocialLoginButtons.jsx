import React from "react";
import styles from "/src/style/SocialLoginButtons.module.css";
import googleLogo from "../../assets/google-icon.svg";
import naverLogo from "../../assets/naver-icon.svg";

const SocialLoginButtons = () => {
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  };

   return (
    <div className={styles.container}>
      <div className={styles.socialButtonWrapper}>
        <button 
          className={`${styles.socialButton} ${styles.googleButton}`} 
          onClick={() => handleSocialLogin("google")}
          aria-label="Google 로그인"
        >
          <img src={googleLogo} alt="Google" className={`${styles.icon} ${styles.googleIcon}`} />
        </button>
        <span className={styles.buttonLabel}>Google</span>
      </div>
      
      <div className={styles.socialButtonWrapper}>
        <button 
          className={`${styles.socialButton} ${styles.naverButton}`} 
          onClick={() => handleSocialLogin("naver")}
          aria-label="Naver 로그인"
        >
          <img src={naverLogo} alt="Naver" className={`${styles.icon} ${styles.naverIcon}`} />
        </button>
        <span className={styles.buttonLabel}>Naver</span>
      </div>
    </div>
  );
};

export default SocialLoginButtons;