// src/pages/NotificationsPage.jsx
import { useState, useEffect } from 'react';
import '../styles/components/notificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    rocketUpdates: true,
    meetingInvites: true,
    friendRequests: true,
    systemNotices: true,
    communityActivity: true,
    directMessages: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true
  });

  // 더미 알림 데이터
  useEffect(() => {
    // API 호출 시뮬레이션
    setTimeout(() => {
      const dummyNotifications = [
        {
          id: 1,
          type: 'rocket',
          title: '로켓 발사 준비 완료!',
          message: '2025년 벚꽃 축제로 향하는 로켓이 발사 준비를 마쳤습니다.',
          sender: '시스템',
          senderAvatar: null,
          isRead: false,
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10분 전
          actionUrl: '/rockets/123'
        },
        {
          id: 2,
          type: 'friend',
          title: '친구 요청',
          message: '시간마법사님이 친구 요청을 보냈습니다.',
          sender: '시간마법사',
          senderAvatar: 'https://via.placeholder.com/40',
          isRead: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1시간 전
          actionUrl: '/friends'
        },
        {
          id: 3,
          type: 'meeting',
          title: '모임 초대',
          message: '별자리사냥꾼님이 "별자리 관측 모임"에 초대했습니다.',
          sender: '별자리사냥꾼',
          senderAvatar: 'https://via.placeholder.com/40',
          isRead: false,
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1일 전
          actionUrl: '/meetings/3'
        },
        {
          id: 4,
          type: 'comment',
          title: '댓글 알림',
          message: '양자물리학자님이 회원님의 게시글 "시간여행의 역설"에 댓글을 남겼습니다: "흥미로운 이론이네요. 저도 비슷한 연구를 진행 중인데..."',
          sender: '양자물리학자',
          senderAvatar: 'https://via.placeholder.com/40',
          isRead: true,
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2일 전
          actionUrl: '/community/post/123'
        },
        {
          id: 5,
          type: 'system',
          title: '시스템 점검 안내',
          message: '내일 오전 3시부터 5시까지 시스템 점검이 진행됩니다. 이용에 참고해주세요.',
          sender: '시스템',
          senderAvatar: null,
          isRead: true,
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3일 전
          actionUrl: '/notice/45'
        },
        {
          id: 6,
          type: 'achievement',
          title: '뱃지 획득!',
          message: '축하합니다! "시간여행의 시작" 뱃지를 획득하셨습니다.',
          sender: '시스템',
          senderAvatar: null,
          isRead: true,
          timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5일 전
          actionUrl: '/profile/badges'
        },
        {
          id: 7,
          type: 'message',
          title: '새 메시지',
          message: '로켓엔지니어님이 메시지를 보냈습니다: "안녕하세요! 새로운 로켓 디자인에 대해 의견을 듣고 싶어요."',
          sender: '로켓엔지니어',
          senderAvatar: 'https://via.placeholder.com/40',
          isRead: true,
          timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), // 6일 전
          actionUrl: '/messages/34'
        }
      ];
      
      setNotifications(dummyNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 알림 설정 변경 핸들러
  const handleSettingChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  // 알림 읽음 처리
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, isRead: true };
        }
        return notification;
      })
    );
  };
  
  // 특정 알림 삭제
  const handleDeleteNotification = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // 모든 알림 삭제
  const handleDeleteAllNotifications = () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      setNotifications([]);
    }
  };

  // 알림 필터링
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.type === activeTab;
  });

  // 각 타입별 알림 개수 계산
  const getNotificationCount = (type) => {
    if (type === 'all') return notifications.length;
    if (type === 'unread') return notifications.filter(n => !n.isRead).length;
    return notifications.filter(n => n.type === type).length;
  };

  // 알림 아이콘 매핑
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'rocket': return '🚀';
      case 'friend': return '👥';
      case 'meeting': return '📅';
      case 'comment': return '💬';
      case 'system': return '🔔';
      case 'achievement': return '🏆';
      case 'message': return '✉️';
      default: return '📣';
    }
  };

  // 상대적 시간 표시
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}개월 전`;
    
    return `${Math.floor(diffInMonths / 12)}년 전`;
  };

  // 알림 설정 모달
  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>알림 설정</h2>
            <button 
              className="modal-close"
              onClick={() => setShowSettingsModal(false)}
            >
              ×
            </button>
          </div>
          
          <div className="notification-settings">
            <div className="settings-section">
              <h3>알림 유형</h3>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="rocketUpdates"
                    checked={notificationSettings.rocketUpdates}
                    onChange={handleSettingChange}
                  />
                  <span>로켓 업데이트</span>
                </label>
                <p>로켓 발사, 도착 및 관련 알림</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="meetingInvites"
                    checked={notificationSettings.meetingInvites}
                    onChange={handleSettingChange}
                  />
                  <span>모임 초대</span>
                </label>
                <p>모임 초대 및 업데이트</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="friendRequests"
                    checked={notificationSettings.friendRequests}
                    onChange={handleSettingChange}
                  />
                  <span>친구 요청</span>
                </label>
                <p>친구 요청 및 수락 알림</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="systemNotices"
                    checked={notificationSettings.systemNotices}
                    onChange={handleSettingChange}
                  />
                  <span>시스템 공지</span>
                </label>
                <p>시스템 점검, 업데이트 및 중요 공지</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="communityActivity"
                    checked={notificationSettings.communityActivity}
                    onChange={handleSettingChange}
                  />
                  <span>커뮤니티 활동</span>
                </label>
                <p>게시글 댓글, 좋아요 등 커뮤니티 알림</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="directMessages"
                    checked={notificationSettings.directMessages}
                    onChange={handleSettingChange}
                  />
                  <span>직접 메시지</span>
                </label>
                <p>1:1 메시지 알림</p>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>알림 방식</h3>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleSettingChange}
                  />
                  <span>이메일 알림</span>
                </label>
                <p>중요 알림을 이메일로 받기</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onChange={handleSettingChange}
                  />
                  <span>푸시 알림</span>
                </label>
                <p>브라우저 푸시 알림 허용</p>
              </div>
              
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    name="soundEnabled"
                    checked={notificationSettings.soundEnabled}
                    onChange={handleSettingChange}
                  />
                  <span>알림음</span>
                </label>
                <p>알림 수신 시 소리 재생</p>
              </div>
            </div>
            
            <div className="settings-actions">
              <button className="save-settings-button">설정 저장</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>알림</h1>
        
        <div className="notification-actions">
          <button 
            className="mark-all-button"
            onClick={handleMarkAllAsRead}
            disabled={!getNotificationCount('unread')}
          >
            모두 읽음 표시
          </button>
          
          <button 
            className="delete-all-button"
            onClick={handleDeleteAllNotifications}
            disabled={!notifications.length}
          >
            모두 삭제
          </button>
          
          <button 
            className="settings-button"
            onClick={() => setShowSettingsModal(true)}
          >
            <span className="settings-icon">⚙️</span>
            알림 설정
          </button>
        </div>
      </div>
      
      <div className="notification-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체 ({getNotificationCount('all')})
        </button>
        <button 
          className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          읽지 않음 ({getNotificationCount('unread')})
        </button>
        <button 
          className={`tab ${activeTab === 'rocket' ? 'active' : ''}`}
          onClick={() => setActiveTab('rocket')}
        >
          로켓 ({getNotificationCount('rocket')})
        </button>
        <button 
          className={`tab ${activeTab === 'meeting' ? 'active' : ''}`}
          onClick={() => setActiveTab('meeting')}
        >
          모임 ({getNotificationCount('meeting')})
        </button>
        <button 
          className={`tab ${activeTab === 'friend' ? 'active' : ''}`}
          onClick={() => setActiveTab('friend')}
        >
          친구 ({getNotificationCount('friend')})
        </button>
        <button 
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          시스템 ({getNotificationCount('system')})
        </button>
      </div>
      
      <div className="notifications-list">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>알림을 불러오는 중...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">🔔</div>
            <h3>알림이 없습니다</h3>
            <p>
              {activeTab === 'all' ? 
                '새로운 알림이 도착하면 여기에 표시됩니다.' : 
                `${activeTab === 'unread' ? '읽지 않은' : activeTab} 알림이 없습니다.`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            >
              <div className={`notification-icon ${notification.type}`}>
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content" onClick={() => handleMarkAsRead(notification.id)}>
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">
                    {getRelativeTime(notification.timestamp)}
                  </span>
                </div>
                
                <p className="notification-message">{notification.message}</p>
                
                <div className="notification-sender">
                  {notification.senderAvatar ? (
                    <img 
                      src={notification.senderAvatar} 
                      alt={notification.sender} 
                      className="sender-avatar"
                    />
                  ) : (
                    <div className="system-avatar">
                      {notification.sender === '시스템' ? '🛰️' : notification.sender.charAt(0)}
                    </div>
                  )}
                  <span>From: {notification.sender}</span>
                </div>
              </div>
              
              <div className="notification-actions">
                <button 
                  className="action-button view"
                  title="상세 보기"
                  onClick={() => {
                    handleMarkAsRead(notification.id);
                    // 실제로는 라우팅으로 이동
                    alert(`${notification.actionUrl}로 이동합니다.`);
                  }}
                >
                  <span className="action-icon">👁️</span>
                </button>
                
                {!notification.isRead && (
                  <button 
                    className="action-button read"
                    title="읽음 표시"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <span className="action-icon">✓</span>
                  </button>
                )}
                
                <button 
                  className="action-button delete"
                  title="삭제"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  <span className="action-icon">×</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {renderSettingsModal()}
    </div>
  );
};

export default NotificationsPage;
