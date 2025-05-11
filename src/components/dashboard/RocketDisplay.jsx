// src/components/dashboard/RocketDisplay.jsx
import React from 'react';
import '../../styles/components/rocketDisplay.css';

// RocketDisplay 컴포넌트 정의
const RocketDisplay = () => {
  // 더미 데이터 (실제 애플리케이션에서는 API에서 받아온 데이터를 사용)
  const rockets = [
    { 
      id: 1, 
      title: "미래로의 여행", 
      description: "2050년으로 떠나는 시간 여행", 
      launchDate: "2025-06-15",
      status: "scheduled"
    },
    { 
      id: 2, 
      title: "과거 속으로", 
      description: "1920년대 재즈 시대로의 여행", 
      launchDate: "2025-05-20",
      status: "completed"
    },
    { 
      id: 3, 
      title: "별들의 대화", 
      description: "우주의 신비로운 메시지", 
      launchDate: "2025-07-10",
      status: "draft"
    }
  ];

  return (
    <div className="rocket-display">
      <div className="rocket-display-header">
        <h2>내 로켓 컬렉션</h2>
        <button className="create-rocket-button">
          새 로켓 제작 <span>🚀</span>
        </button>
      </div>
      
      <div className="rocket-filter">
        <div className="filter-options">
          <button className="filter-button active">전체</button>
          <button className="filter-button">예약됨</button>
          <button className="filter-button">완료됨</button>
          <button className="filter-button">임시저장</button>
        </div>
        <div className="filter-search">
          <input type="text" placeholder="로켓 검색..." />
          <button className="search-button">🔍</button>
        </div>
      </div>
      
      <div className="rocket-grid">
        {rockets.map(rocket => (
          <div key={rocket.id} className={`rocket-item ${rocket.status}`}>
            <div className="rocket-item-content">
              <div className="rocket-icon-wrapper">
                <img src="/src/assets/rocket.png" alt="Rocket" className="rocket-icon" />
                <div className={`status-indicator ${rocket.status}`}></div>
              </div>
              <h3>{rocket.title}</h3>
              <p className="rocket-description">{rocket.description}</p>
              <div className="rocket-meta">
                <span className="launch-date">
                  🗓️ {new Date(rocket.launchDate).toLocaleDateString('ko-KR')}
                </span>
                <span className={`status-badge ${rocket.status}`}>
                  {rocket.status === 'scheduled' && '예약됨'}
                  {rocket.status === 'completed' && '완료됨'}
                  {rocket.status === 'draft' && '임시저장'}
                </span>
              </div>
            </div>
            <div className="rocket-item-actions">
              <button className="action-button edit">수정</button>
              <button className="action-button view">보기</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="rocket-empty-state" style={{ display: rockets.length ? 'none' : 'flex' }}>
        <div className="empty-icon">🚀</div>
        <h3>아직 로켓이 없습니다</h3>
        <p>첫 번째 로켓을 제작해보세요!</p>
        <button className="create-rocket-button large">
          로켓 제작하기
        </button>
      </div>
    </div>
  );
};

// default export 추가 (중요!)
export default RocketDisplay;
