// import googleLogo from "../../assets/google.svg";
// import naverLogo from "../../assets/naver.png";

const SocialLoginButtons = () => {
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "30px",       // 상단 여백 추가
  };

  const buttonStyle = {
    width: "100%",            // 부모(.box)의 너비에 맞춤
    border: "none",            // 테두리 제거
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",            // 버튼 크기에 딱 맞게
    objectFit: "cover",        // 비율 유지하며 채우기 (또는 'contain'도 가능)
    display: "block",
  };

  return (
    <div style={containerStyle}>
      <button style={buttonStyle} onClick={() => handleSocialLogin("google")}>
        <img src={googleLogo} alt="Google 로그인" style={imageStyle} />
      </button>
      <button style={buttonStyle} onClick={() => handleSocialLogin("naver")}>
        <img src={naverLogo} alt="Naver 로그인" style={imageStyle} />
      </button>
    </div>
  );
};

export default SocialLoginButtons;
