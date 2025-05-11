// src/components/dashboard/UserProfile.jsx
import { useState } from 'react';
import '../../styles/components/userProfile.css';

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState({
    nickname: '우주탐험가',
    level: 12,
    bio: '시간 여행을 통해 미래와 과거를 탐험하는 로켓 엔지니어입니다.',
    posts: 42,
    friends: 128,
    rockets: 17,
  });

  return (
    <div className="user-profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src="https://via.placeholder.com/150" alt="User Avatar" />
          <div className="level-badge">Lv.{userInfo.level}</div>
        </div>
        <div className="profile-info">
          <h2>{userInfo.nickname}</h2>
          <p className="profile-bio">{userInfo.bio}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{userInfo.posts}</span>
              <span className="stat-label">게시글</span>
            </div>
            <div className="stat">
              <span className="stat-value">{userInfo.friends}</span>
              <span className="stat-label">친구</span>
            </div>
            <div className="stat">
              <span className="stat-value">{userInfo.rockets}</span>
              <span className="stat-label">로켓</span>
            </div>
          </div>
        </div>
        <button className="edit-profile-btn">프로필 수정</button>
      </div>
      
      <div className="profile-activity">
        <h3>최근 활동</h3>
        <div className="activity-timeline">
          {/* 활동 타임라인 아이템들 */}
          <div className="timeline-item">
            <div className="timeline-icon rocket-icon"></div>
            <div className="timeline-content">
              <p className="timeline-title">새 로켓 발사</p>
              <p className="timeline-desc">미래로 향하는 시간여행 로켓을 발사했습니다.</p>
              <p className="timeline-time">3시간 전</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon community-icon"></div>
            <div className="timeline-content">
              <p className="timeline-title">커뮤니티 활동</p>
              <p className="timeline-desc">로켓 엔진 최적화에 관한 게시글을 작성했습니다.</p>
              <p className="timeline-time">1일 전</p>
            </div>
          </div>
          {/* 추가 타임라인 아이템... */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
