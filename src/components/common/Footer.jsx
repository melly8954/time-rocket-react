import { Link } from 'react-router-dom';
import styles from '../../style/footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLogo}>
          <img src="/src/assets/rocket.png" alt="TimeRocket" />
          <h3>TimeRocket</h3>
        </div>
        <div className={styles.footerLinks}>
          <div className={styles.footerSection}>
            <h4>소개</h4>
            <ul>
              <li><Link to="/about">서비스 소개</Link></li>
              <li><Link to="/team">팀 소개</Link></li>
              <li><Link to="/contact">문의하기</Link></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>이용안내</h4>
            <ul>
              <li><Link to="/terms">이용약관</Link></li>
              <li><Link to="/privacy">개인정보처리방침</Link></li>
              <li><Link to="/faq">자주 묻는 질문</Link></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>고객센터</h4>
            <ul>
              <li><Link to="/support">1:1 문의</Link></li>
              <li><Link to="/notice">공지사항</Link></li>
              <li><Link to="/feedback">피드백</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerSocial}>
          <a href="#" className={styles.socialIcon}><i className="fab fa-facebook"></i></a>
          <a href="#" className={styles.socialIcon}><i className="fab fa-twitter"></i></a>
          <a href="#" className={styles.socialIcon}><i className="fab fa-instagram"></i></a>
          <a href="#" className={styles.socialIcon}><i className="fab fa-youtube"></i></a>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; 2025 TimeRocket. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
