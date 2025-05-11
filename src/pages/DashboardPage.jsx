// src/pages/DashboardPage.jsx
import { useState } from 'react';
import UserProfile from '../components/dashboard/UserProfile';
import RocketDisplay from '../components/dashboard/RocketDisplay';
import '../styles/components/dashboard.css';

const DashboardPage = () => {
  const [selectedTab, setSelectedTab] = useState('profile');

  return (
    <div className="dashboard-container">
      <div className="dashboard-background">
        <div className="planet-base"></div>
        <div className="rocket-animation">
          <img src="/src/assets/rocket.png" alt="Rocket" />
          <div className="rocket-flames"></div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>마이 타임로켓</h1>
          <div className="dashboard-tabs">
            <button 
              className={`tab ${selectedTab === 'profile' ? 'active' : ''}`}
              onClick={() => setSelectedTab('profile')}>
              프로필
            </button>
            <button 
              className={`tab ${selectedTab === 'rockets' ? 'active' : ''}`}
              onClick={() => setSelectedTab('rockets')}>
              내 로켓
            </button>
            <button 
              className={`tab ${selectedTab === 'friends' ? 'active' : ''}`}
              onClick={() => setSelectedTab('friends')}>
              친구
            </button>
            <button 
              className={`tab ${selectedTab === 'settings' ? 'active' : ''}`}
              onClick={() => setSelectedTab('settings')}>
              설정
            </button>
          </div>
        </div>
        
        <div className="dashboard-main">
          {selectedTab === 'profile' && <UserProfile />}
          {selectedTab === 'rockets' && <RocketDisplay />}
          {/* 다른 탭 컴포넌트들... */}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
