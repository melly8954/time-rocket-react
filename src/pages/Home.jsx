import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpaceBackground from '../components/common/SpaceBackground';
import useAuthStore from '../authStore';
import { UserIcon, RocketIcon, StarIcon, EditIcon, LockIcon, CalendarIcon } from '../components/ui/Icons';
import '../style/components/Home.css';

const HomePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [mainRocket, setMainRocket] = useState(null);
  const [recentRockets, setRecentRockets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const userId = useAuthStore(state => state.userId);
  const nickname = useAuthStore(state => state.nickname);
  const email = useAuthStore(state => state.email);
  
  // 사용자 데이터 로드
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }
      
      try {
        // 유저 프로필 데이터 로드 - 기존 사용자 데이터에 레벨, 행성 레벨 등 추가
        const profileData = {
          userId: userId || 0,
          nickname: nickname || '사용자',
          email: email || 'user@example.com',
          bio: '미래와 과거를 여행하는 타임로켓 탐험가입니다. 새로운 시간대를 탐험하고 기록합니다.',
          level: 1, // 기본값 설정
          planetLevel: '초보 탐험가', // 기본값 설정
          badges: ['🚀 로켓 초보자'],
          stats: {
            rockets: 0,
            showcased: 0,
            received: 0
          },
          recentActivity: []
        };
        setUserProfile(profileData);
        
        // 메인 로켓 데이터
        const mainRocketData = {
          id: 1,
          rocketName: '우주 여행을 위한 타임캡슐',
          design: 'A',
          isLock: true,
          lockExpiredAt: '2025-12-31T23:59:59',
          content: '미래의 나에게 보내는 특별한 메시지. 2025년, 당신은 어떤 모습일까요?',
          receiverType: 'me',
          sentAt: '2023-05-10T14:30:00'
        };
        setMainRocket(mainRocketData);
        
        // 최근 로켓 목록
        const recentRocketsData = [
          {
            id: 2,
            rocketName: '어린 시절의 나에게',
            design: 'B',
            isLock: false,
            lockExpiredAt: '2023-01-01T00:00:00',
            isPublic: true,
            sentAt: '2023-04-15T09:15:00'
          },
          {
            id: 3,
            rocketName: '우주 여행 일지',
            design: 'C',
            isLock: true,
            lockExpiredAt: '2024-06-30T12:00:00',
            isPublic: false,
            sentAt: '2023-03-20T18:45:00'
          },
          {
            id: 4,
            rocketName: '2030년의 나에게',
            design: 'A',
            isLock: true,
            lockExpiredAt: '2030-01-01T00:00:00',
            isPublic: false,
            sentAt: '2023-05-01T10:30:00'
          }
        ];
        setRecentRockets(recentRocketsData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('데이터를 불러오는 중 오류 발생:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isLoggedIn, userId, nickname, email]);

  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 로켓 디자인 이미지 가져오기
  const getRocketDesignImage = (design) => {
    switch(design) {
      case 'A':
        return '/src/assets/디자인 A.jpg';
      case 'B':
        return '/src/assets/디자인 B.jpg';
      case 'C':
        return '/src/assets/디자인 C.jpg';
      default:
        return '/src/assets/rocket.png';
    }
  };

  // 비회원용 소개 화면
  const GuestHomePage = () => (
    <div className="guest-home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">시간을 담는 로켓</h1>
          <p className="hero-subtitle">
            과거, 현재, 미래를 넘나드는 특별한 경험으로 당신만의 시간 여행을 시작하세요.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">
              회원가입하기
            </Link>
            <Link to="/login" className="btn btn-secondary">
              로그인하기
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/src/assets/rocket.png" alt="로켓" className="floating-rocket" />
          <div className="planet-orbit">
            <img src="/src/assets/planet1.png" alt="행성1" className="orbiting-planet" />
            <img src="/src/assets/planet2.png" alt="행성2" className="orbiting-planet secondary" />
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2 className="section-title">TimeRocket 주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>로켓 제작</h3>
            <p>특별한 메시지를 담은 로켓을 제작하고 미래의 특정 시점에 열어볼 수 있습니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>시간 잠금</h3>
            <p>로켓에 시간 잠금 장치를 설정하여 정해진 날짜에만 내용을 확인할 수 있습니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>로켓 공유</h3>
            <p>친구나 미래의 자신에게 로켓을 보내고 특별한 순간을 함께 나눌 수 있습니다.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>로켓 진열장</h3>
            <p>자신이 만든 로켓을 진열장에 전시하고 다른 사용자들과 경험을 공유하세요.</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <div className="cta-content">
          <h2>지금 바로 시간여행을 시작하세요</h2>
          <p>미래의 자신에게, 혹은 소중한 이에게 전하고 싶은 메시지가 있나요?<br />TimeRocket과 함께 잊지 못할 여행을 시작하세요.</p>
          <Link to="/signup" className="cta-button">
            무료로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
  
  // 회원용 홈 화면 (프로필 + 로켓)
  const UserHomePage = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-rocket">
            <img src="/src/assets/rocket.png" alt="로딩중" className="rotating-rocket" />
          </div>
          <p>로켓 준비중...</p>
        </div>
      );
    }
    
    return (
      <div className="user-home">
        <div className="user-home-container">
          {/* 왼쪽: 메인 로켓 */}
          <div className="main-rocket-container">
            <div className="main-rocket">
              <h2 className="section-title">나의 대표 로켓</h2>
              
              {mainRocket ? (
                <div className="main-rocket-card">
                  <div className="rocket-preview">
                    <img 
                      src={getRocketDesignImage(mainRocket.design)} 
                      alt={mainRocket.rocketName} 
                      className="rocket-image"
                    />
                    {mainRocket.isLock && (
                      <div className="lock-overlay">
                        <LockIcon />
                        <span>{formatDate(mainRocket.lockExpiredAt)} 개봉</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="rocket-info">
                    <h3 className="rocket-name">{mainRocket.rocketName}</h3>
                    <div className="rocket-meta">
                      <div className="meta-item">
                        <CalendarIcon /> 
                        <span>발사일: {formatDate(mainRocket.sentAt)}</span>
                      </div>
                      <div className="meta-item">
                        <LockIcon /> 
                        <span>개봉일: {formatDate(mainRocket.lockExpiredAt)}</span>
                      </div>
                    </div>
                    <p className="rocket-description">
                      {mainRocket.isLock 
                        ? "이 로켓은 아직 잠겨 있습니다. 설정한 날짜가 되면 내용을 확인할 수 있습니다."
                        : mainRocket.content.substring(0, 150) + "..."}
                    </p>
                    
                    <div className="rocket-actions">
                      <Link to={`/rockets/${mainRocket.id}`} className="view-btn">
                        {mainRocket.isLock ? '로켓 정보 보기' : '로켓 내용 보기'}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-rocket">
                  <img src="/src/assets/rocket.png" alt="로켓" className="empty-rocket-img" />
                  <h3>아직 로켓이 없습니다</h3>
                  <p>첫 번째 로켓을 만들어 시간여행을 시작해 보세요!</p>
                  <Link to="/rocket" className="create-btn">
                    새 로켓 만들기
                  </Link>
                </div>
              )}
              
              <div className="recent-rockets">
                <h3 className="subsection-title">최근 로켓</h3>
                <div className="recent-rockets-grid">
                  {recentRockets.length > 0 ? (
                    recentRockets.map(rocket => (
                      <Link to={`/rocket/${rocket.id}`} key={rocket.id} className="recent-rocket-card">
                        <div className="recent-rocket-preview">
                          <img src={getRocketDesignImage(rocket.design)} alt={rocket.rocketName} />
                          {rocket.isLock && <div className="lock-indicator"><LockIcon /></div>}
                        </div>
                        <div className="recent-rocket-info">
                          <h4>{rocket.rocketName}</h4>
                          <span className="recent-rocket-date">{formatDate(rocket.sentAt)}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="no-rockets">최근 로켓이 없습니다.</p>
                  )}
                </div>
                
                <div className="view-all-link">
                  <Link to="/rocket/storage">모든 로켓 보기</Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 사용자 프로필 */}
          <div className="user-profile-container">
            <div className="user-profile">
              <div className="profile-header">
                <div className="profile-avatar">
                  <UserIcon />
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    <h2>{userProfile?.nickname}</h2>
                    <span className="verified-badge">✓</span>
                  </div>
                  <p className="profile-email">{userProfile?.email}</p>
                </div>
              </div>
              
              <div className="profile-bio">
                <p>{userProfile?.bio || "안녕하세요! TimeRocket 사용자입니다."}</p>
                <button className="edit-bio-btn">
                  <EditIcon /> 수정
                </button>
              </div>
              
              <div className="profile-level">
                <div className="level-info">
                  <span className="level-label">레벨</span>
                  <span className="level-value">Lv.{userProfile?.level || 1}</span>
                </div>
                <div className="level-progress-bar">
                  <div 
                    className="level-progress" 
                    style={{ width: `${((userProfile?.level || 1) % 10) * 10}%` }}
                  ></div>
                </div>
                <div className="planet-level">
                  <img src="/src/assets/planet1.png" alt="행성" className="planet-icon" />
                  <span>{userProfile?.planetLevel || "초보 탐험가"}</span>
                </div>
              </div>
              
              <div className="profile-badges">
                <h3 className="profile-section-title">획득한 배지</h3>
                <div className="badges-list">
                  {(userProfile?.badges || ["🚀 로켓 초보자"]).map((badge, index) => (
                    <div key={index} className="badge-item">
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="profile-stats">
                <div className="stat-item">
                  <RocketIcon className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{userProfile?.stats?.rockets || 0}</span>
                    <span className="stat-label">발사한 로켓</span>
                  </div>
                </div>
                <div className="stat-item">
                  <StarIcon className="stat-icon" />
                  <div className="stat-info">
                    <span className="stat-value">{userProfile?.stats?.showcased || 0}</span>
                    <span className="stat-label">공개한 로켓</span>
                  </div>
                </div>
                <div className="stat-item">
                  <RocketIcon className="stat-icon received" />
                  <div className="stat-info">
                    <span className="stat-value">{userProfile?.stats?.received || 0}</span>
                    <span className="stat-label">받은 로켓</span>
                  </div>
                </div>
              </div>
              
              <div className="profile-actions">
                <Link to="/rocket" className="profile-action-btn primary">
                  새 로켓 만들기
                </Link>
                <Link to="/rockets/storage" className="profile-action-btn secondary">
                  로켓 보관함
                </Link>
                <Link to="/rockets/showcase" className="profile-action-btn secondary">
                  로켓 진열장
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">
      <SpaceBackground />
      {isLoggedIn ? <UserHomePage /> : <GuestHomePage />}
    </div>
  );
};

export default HomePage;
