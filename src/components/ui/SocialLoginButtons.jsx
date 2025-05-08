const SocialLoginButtons = () => {
  const handleSocialLogin = (provider) => {
    // 백엔드가 제공하는 OAuth2 인증 엔드포인트로 리디렉션
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button onClick={() => handleSocialLogin("google")}>Google 로그인</button>
      <button onClick={() => handleSocialLogin("naver")}>Naver 로그인</button>
    </div>
  );
};

export default SocialLoginButtons;