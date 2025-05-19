import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SpaceBackground from '../components/common/SpaceBackground';
import useAuthStore from '../authStore';
import api from '../utils/api';
import { UserIcon, RocketIcon, StarIcon, EditIcon, LockIcon, CalendarIcon } from '../components/ui/Icons';
import '../style/components/Home.css';

// API 경로 상수화 - /api 접두사 제거 (api 유틸리티의 baseURL이 이미 /api로 설정됨)
const API_PATHS = {
  USER_PROFILE: '/users/profile',
  ROCKETS: '/rockets',
  CHESTS: '/chests/users',
  DISPLAYS: '/displays/users'
};

// 프론트엔드 라우트 상수화 - ROCKET_STORAGE를 함수로 수정
const ROUTES = {
  ROCKETS: '/rockets',
  ROCKET_DETAIL: (id) => `/rockets/${id}`,
  ROCKET_CREATE: '/rockets/create',
  ROCKET_STORAGE: (id) => `/chests/${id}`, // 함수로 변경
  ROCKET_SHOWCASE: '/display',
  USER_PROFILE: (id) => `/users/${id}`,
  LOGIN: '/login',
  SIGNUP: '/signup'
};

const Home = () => {
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
        console.log('API 요청 시작');
        
        // 유저 프로필 API 호출
        const userResponse = await api.get(API_PATHS.USER_PROFILE);
        console.log('API 응답 (userResponse):', userResponse);
        
        // API 응답에 맞게 사용자 프로필 설정
        // 백엔드 응답 구조: {code: 200, message: "사용자 인증 완료", data: {...}}
        if (userResponse.data && userResponse.data.data) {
          const userData = userResponse.data.data;
          
          const profileData = {
            userId: userData.userId || userId || 0,
            nickname: userData.nickname || nickname || '사용자',
            email: userData.email || email || 'user@example.com',
            bio: '미래와 과거를 여행하는 타임로켓 탐험가입니다. 새로운 시간대를 탐험하고 기록합니다.',
            level: 1,
            planetLevel: '초보 탐험가',
            badges: ['🚀 로켓 초보자'],
            stats: {
              rockets: 0,
              showcased: 0,
              received: 0
            },
            recentActivity: []
          };
          setUserProfile(profileData);
        } else {
          console.warn("API 응답 구조가 예상과 다릅니다:", userResponse.data);
          setUserProfile({
            userId: userId || 0,
            nickname: nickname || '사용자',
            email: email || 'user@example.com',
            level: 1,
            planetLevel: '초보 탐험가'
          });
        }
        
        try {
          // 로켓 데이터 API 호출
          const rocketsParams = {
            userId: userId,
            page: 1,
            size: 4,
            sort: 'sentAt',
            order: 'desc'
          };
          
          const rocketsResponse = await api.get(`${API_PATHS.CHESTS}/${userId}`, { params: rocketsParams });
          console.log('API 응답 (rocketsResponse):', rocketsResponse);
          
          // API 응답 구조에 맞게 처리
          if (rocketsResponse.data && rocketsResponse.data.data) {
            const rocketsData = rocketsResponse.data.data;
            
            if (rocketsData.chests && rocketsData.chests.length > 0) {
              setMainRocket(rocketsData.chests[0]);
              setRecentRockets(rocketsData.chests.slice(1));
            } else {
              throw new Error('로켓 데이터가 없습니다');
            }
          } else {
            throw new Error('로켓 API 응답 구조가 예상과 다릅니다');
          }
        } catch (rocketError) {
          console.error('로켓 데이터 로드 실패:', rocketError);
          
          // 로켓 데이터는 없지만 UI는 표시
          setMainRocket({
            id: 1,
            chestId: 1,
            rocketName: '우주 여행을 위한 타임캡슐',
            design: 'A',
            isLock: true,
            lockExpiredAt: '2025-12-31T23:59:59',
            content: '미래의 나에게 보내는 특별한 메시지. 2025년, 당신은 어떤 모습일까요?',
            receiverType: 'me',
            sentAt: '2023-05-10T14:30:00'
          });
          
          setRecentRockets([
            {
              id: 2,
              chestId: 2,
              rocketName: '어린 시절의 나에게',
              design: 'B',
              isLock: false,
              lockExpiredAt: '2023-01-01T00:00:00',
              isPublic: true,
              sentAt: '2023-04-15T09:15:00'
            },
            {
              id: 3,
              chestId: 3,
              rocketName: '우주 여행 일지',
              design: 'C',
              isLock: true,
              lockExpiredAt: '2024-06-30T12:00:00',
              isPublic: false,
              sentAt: '2023-03-20T18:45:00'
            }
          ]);
        }
        
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
            <Link to={ROUTES.SIGNUP} className="btn btn-primary">
              회원가입하기
            </Link>
            <Link to={ROUTES.LOGIN} className="btn btn-secondary">
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
          <Link to={ROUTES.SIGNUP} className="cta-button">
            무료로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
  
  // 회원용 홈 화면 (프로필 + 로켓)
  const UserHomePage = () => {
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
                      <Link to={ROUTES.ROCKET_DETAIL(mainRocket.id || mainRocket.chestId)} className="view-btn">
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
                  <Link to={ROUTES.ROCKET_CREATE} className="create-btn">
                    새 로켓 만들기
                  </Link>
                </div>
              )}
              
              <div className="recent-rockets">
                <h3 className="subsection-title">최근 로켓</h3>
                <div className="recent-rockets-grid">
                  {recentRockets.length > 0 ? (
                    recentRockets.map(rocket => (
                      <Link to={ROUTES.ROCKET_DETAIL(rocket.id || rocket.chestId)} key={rocket.id || rocket.chestId} className="recent-rocket-card">
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
                  {/* userId를 전달하도록 수정 */}
                  <Link to={ROUTES.ROCKET_STORAGE(userId)}>모든 로켓 보기</Link>
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
                <Link to={ROUTES.ROCKET_CREATE} className="profile-action-btn primary">
                  새 로켓 만들기
                </Link>
                {/* userId를 전달하도록 수정 */}
                <Link to={ROUTES.ROCKET_STORAGE(userId)} className="profile-action-btn secondary">
                  로켓 보관함
                </Link>
                <Link to={ROUTES.ROCKET_SHOWCASE} className="profile-action-btn secondary">
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
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      ) : isLoggedIn ? <UserHomePage /> : <GuestHomePage />}
    </div>
  );
};

export default Home;
