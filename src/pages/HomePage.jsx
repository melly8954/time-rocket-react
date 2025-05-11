// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PeopleIcon, 
  CommentIcon, 
  StarIcon,
  ArrowBackIcon 
} from '../components/ui/Icons';
import SpaceBackground from '../components/ui/SpaceBackground';
import '../styles/homePage.css';

const HomePage = () => {
  const [rockets, setRockets] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);
  
  // 데이터 로드 시뮬레이션
  useEffect(() => {
    // API 호출 코드가 실제로 들어갈 자리
    const fetchData = async () => {
      try {
        // 실제 API 호출 대신 타임아웃 사용
        setTimeout(() => {
          setRockets([
            { id: 1, title: '미래로의 여행', owner: '우주비행사', launchDate: '2025-05-20T14:30:00' },
            { id: 2, title: '과거 속으로', owner: '시간여행자', launchDate: '2025-05-15T09:15:00' },
            { id: 3, title: '별들의 대화', owner: '별자리탐험가', launchDate: '2025-06-01T18:00:00' },
          ]);
          
          setCommunities([
            { id: 1, title: '로켓 엔진 최적화 방법', author: '엔진마스터', likes: 42 },
            { id: 2, title: '미래 여행의 윤리적 문제', author: '윤리학자', likes: 28 },
            { id: 3, title: '시간 여행 패러독스', author: '시간물리학자', likes: 76 },
          ]);
          
          setMeetings([
            { id: 1, title: '우주 탐험가 모임', members: 12, date: '2025-05-10' },
            { id: 2, title: '시간여행 체험단', members: 8, date: '2025-05-25' },
            { id: 3, title: '별자리 관측 모임', members: 15, date: '2025-06-05' },
          ]);
          
          setIsLoading(false);
        }, 1800);
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 로켓 애니메이션 효과
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRocketAnimation(true);
    }, 700);
    
    return () => clearTimeout(timer);
  }, []);

  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 로딩 중일 때 표시할 컴포넌트
if (isLoading) {
  return (
    <div className="loading-container">
      <div className="space-portal">
        <div className="portal-ring portal-ring-1"></div>
        <div className="portal-ring portal-ring-2"></div>
        <div className="portal-ring portal-ring-3"></div>
        <div className="portal-core"></div>
      </div>
      <div className="loading-rocket">
        <img src="/src/assets/rocket.png" alt="로켓" />
      </div>
      <p>시공간을 초월하는 중<span className="loading-dots"></span></p>
    </div>
  );
}

  return (
    <div className="home-page">
      <SpaceBackground />
      
      <div className="orbiting-planets">
        <div className="orbiting-planet planet-1"></div>
        <div className="orbiting-planet planet-2"></div>
      </div>
      
      <header className={`home-header ${showRocketAnimation ? 'animate' : ''}`}>
        <div className="header-content">
          <h1>TimeRocket</h1>
          <p>과거, 현재, 미래를 넘나드는 특별한 경험으로 당신만의 시간 여행을 시작하세요. 일상에서 겪는 작은 마찰과 갈등, 혹은 기쁜 순간들을 TimeRocket을 통해 우주로 날려보세요.</p>
          <div className="header-actions">
            <Link to="/rockets/create" className="btn btn-primary">
            새 여행 만들기
            </Link>
            <Link to="/explore" className="btn btn-secondary">
              탐험하기
            </Link>
          </div>
        </div>
        <div className="rocket-animation">
          <img src="/src/assets/rocket.png" alt="로켓" />
          <div className="rocket-flames"></div>
        </div>
      </header>

      <main className="home-content">
        <section className="section-rockets">
          <div className="section-header">
            <h2>인기 여행 로켓</h2>
            <Link to="/rockets" className="view-all">
              모두 보기
            </Link>
          </div>
          <div className="rockets-grid">
            {rockets.map(rocket => (
              <Link to={`/rockets/${rocket.id}`} key={rocket.id} className="rocket-card">
                <div className="rocket-icon">
                  <img src="/src/assets/rocket.png" alt="로켓" className="rocket-img" />
                </div>
                <div className="rocket-info">
                  <h3>{rocket.title}</h3>
                  <p className="owner">
                    <span className="icon-user"></span> {rocket.owner}
                  </p>
                </div>
                <div className="launch-date">
                  <span>출발:</span>
                  <span className="launch-time">{formatDate(rocket.launchDate)}</span>
                </div>
                <div className="card-arrow">
                  <ArrowBackIcon />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-communities">
          <div className="section-header">
            <h2>커뮤니티 인기글</h2>
            <Link to="/community" className="view-all">
              모두 보기
            </Link>
          </div>
          <div className="communities-list">
            {communities.map(post => (
              <Link to={`/community/${post.id}`} key={post.id} className="community-card">
                <div className="post-icon">
                  <CommentIcon />
                </div>
                <div className="post-info">
                  <h3>{post.title}</h3>
                  <p className="author">
                    <span className="icon-author"></span> {post.author}
                  </p>
                </div>
                <div className="post-likes">
                  <StarIcon /> <span>{post.likes}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-meetings">
          <div className="section-header">
            <h2>다가오는 모임</h2>
            <Link to="/meetings" className="view-all">
              모두 보기
            </Link>
          </div>
          <div className="meetings-grid">
            {meetings.map(meeting => (
              <Link to={`/meetings/${meeting.id}`} key={meeting.id} className="meeting-card">
                <div className="meeting-icon">
                  <PeopleIcon />
                </div>
                <div className="meeting-info">
                  <h3>{meeting.title}</h3>
                  <p className="members">
                    <span className="icon-members"></span> 참여자: {meeting.members}명
                  </p>
                  <p className="meeting-date">
                    <span className="icon-calendar"></span> 일자: {meeting.date}
                  </p>
                </div>
                <div className="join-button">
                  참가하기 <span className="join-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        <section className="cta-section">
          <div className="cta-content">
            <h2>나만의 시간여행을 시작하세요</h2>
            <p>원하는 시대와 장소로 떠나는 특별한 여정이 당신을 기다립니다. 지금 바로 시작해 보세요!</p>
            <Link to="/rockets/create" className="cta-button">
              <span>로켓 제작하기</span>
              <div className="button-effect"></div>
            </Link>
          </div>
          <div className="cta-visual">
            <img src="/src/assets/planet2.png" alt="행성" className="cta-planet" />
            <img src="/src/assets/rocket.png" alt="로켓" className="cta-rocket" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
