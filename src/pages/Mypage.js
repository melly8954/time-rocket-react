// Mypage.js
import React, { useState, useEffect } from 'react';
import './Mypage.css';

const Mypage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('badges');
  const [userData, setUserData] = useState({
    nickname: '우주탐험가',
    email: 'explorer@universe.com',
    bio: '새로운 은하를 탐험하는 중입니다.',
    status: '목성 궤도에서 3일차',
    level: 23,
    xp: 620,
    nextLevelXp: 800,
    badges: ['pioneer', 'explorer', 'writer'],
    posts: ['우주 여행기 #1', '행성 관측 기록'],
    files: ['space_image1.png', 'research_data.pdf']
  });

  // 행성 레벨 시스템 데이터
  const planetLevels = [
    { name: '수성', minXp: 0, maxXp: 50, levelRange: '1-5' },
    { name: '금성', minXp: 50, maxXp: 100, levelRange: '6-10' },
    { name: '지구', minXp: 100, maxXp: 200, levelRange: '11-15' },
    { name: '화성', minXp: 200, maxXp: 350, levelRange: '16-20' },
    { name: '목성', minXp: 350, maxXp: 550, levelRange: '21-25' },
    { name: '토성', minXp: 550, maxXp: 800, levelRange: '26-30' },
    { name: '천왕성', minXp: 800, maxXp: 1100, levelRange: '31-35' },
    { name: '해왕성', minXp: 1100, maxXp: 1450, levelRange: '36-40' },
    { name: '명왕성', minXp: 1450, maxXp: 1850, levelRange: '41-45' },
    { name: '카이퍼 벨트', minXp: 1850, maxXp: 2300, levelRange: '46-50' },
    { name: '오르트 구름', minXp: 2300, maxXp: 2800, levelRange: '51-55' },
    { name: '안드로메다', minXp: 2800, maxXp: 3400, levelRange: '56-60' },
    { name: '블랙홀', minXp: 3400, maxXp: 5000, levelRange: '61-65' },
    { name: '웜홀', minXp: 5000, maxXp: 7000, levelRange: '66-70' }
  ];

  // 현재 행성 정보 찾기
  const currentPlanet = planetLevels.find(planet => 
    userData.xp >= planet.minXp && userData.xp < planet.maxXp
  ) || { name: '우주', minXp: 7000, maxXp: Infinity };

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // XP 진행률 계산
  const xpPercentage = ((userData.xp - currentPlanet.minXp) / (currentPlanet.maxXp - currentPlanet.minXp)) * 100;

  return (
    <div className="mypage-container">
      <div className="rocket-section">
        <div className="rocket-image">
          <image src="./assets/rocket.png"></image>
          <div className="rocket">🚀</div>
          <div className="rocket-time">
            {currentTime.toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }).replace(/. /g, '-').replace(',', '')}
          </div>
        </div>
        
        <div className="profile-box">
          <div className="profile-header">
            <h2>{userData.nickname} <span className="badge-icon">⭐</span></h2>
            <p>{userData.email}</p>
            <p className="bio">{userData.bio}</p>
          </div>
          
          <div className="status-section">
            <p>상태: {userData.status}</p>
            <p>행성레벨 {userData.level} ({currentPlanet.name})</p>
            <div className="level-bar">
              <div 
                className="level-progress" 
                style={{ width: `${xpPercentage}%` }}
                data-xp={`${userData.xp}/${currentPlanet.maxXp} XP`}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="content-tabs">
        <button 
          className={activeTab === 'badges' ? 'active' : ''}
          onClick={() => setActiveTab('badges')}
        >
          배지
        </button>
        <button 
          className={activeTab === 'storage' ? 'active' : ''}
          onClick={() => setActiveTab('storage')}
        >
          보관함
        </button>
        <button 
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          게시글
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'badges' && (
          <div className="badges-content">
            <h3>획득한 배지</h3>
            <div className="badges-grid">
              {userData.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <div className="badge-icon">🎖️</div>
                  <p>{badge}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'storage' && (
          <div className="storage-content">
            <h3>보관함</h3>
            <ul>
              {userData.files.map((file, index) => (
                <li key={index}>{file}</li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'posts' && (
          <div className="posts-content">
            <h3>게시글</h3>
            <ul>
              {userData.posts.map((post, index) => (
                <li key={index}>{post}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mypage;