// src/pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import '../styles/components/settingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('space');
  
  // 사용자 상태 및 설정 정보
  const [userSettings, setUserSettings] = useState({
    account: {
      email: 'user@example.com',
      username: 'timeExplorer',
      password: '••••••••••',
      twoFactorEnabled: false,
      connectedAccounts: [
        { provider: 'google', connected: true, email: 'user@gmail.com' },
        { provider: 'facebook', connected: false, email: null },
        { provider: 'twitter', connected: false, email: null }
      ]
    },
    profile: {
      nickname: '우주탐험가',
      bio: '시간과 우주를 탐험하는 여행자입니다.',
      avatar: 'https://via.placeholder.com/150',
      coverImage: 'https://via.placeholder.com/1200x400',
      level: 15,
      badges: ['초보 여행자', '시간의 마법사', '로켓 엔지니어'],
      showLevel: true,
      showBadges: true,
      showRockets: true,
    },
    appearance: {
      theme: 'space',
      backgroundColor: '#121212',
      accentColor: '#7e57c2',
      fontFamily: 'Poppins',
      animationsEnabled: true,
      reducedMotion: false,
      darkMode: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      rocket: {
        launchReminder: true,
        arrivalNotice: true,
        commentNotification: true,
        likeNotification: false,
      },
      friends: {
        friendRequests: true,
        friendActivity: true,
        messages: true,
      },
      system: {
        updates: true,
        maintenance: true,
        security: true,
      },
    },
    privacy: {
      profileVisibility: 'public',
      activityVisibility: 'friends',
      searchable: true,
      allowFriendRequests: true,
      allowDirectMessages: 'friends',
      blockList: [],
    },
    language: {
      interfaceLanguage: 'ko-KR',
      contentLanguage: 'ko-KR',
      timeZone: 'Asia/Seoul',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
    }
  });
  
  // 가상의 데이터 로드
  useEffect(() => {
    // API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // 설정 변경 핸들러 (일반)
  const handleSettingChange = (category, setting, value) => {
    setUserSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };
  
  // 중첩된 설정 변경 핸들러
  const handleNestedSettingChange = (category, subcategory, setting, value) => {
    setUserSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...prev[category][subcategory],
          [setting]: value
        }
      }
    }));
  };
  
  // 연결된 계정 상태 변경 핸들러
  const handleConnectedAccountChange = (provider, connected) => {
    setUserSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        connectedAccounts: prev.account.connectedAccounts.map(acc => {
          if (acc.provider === provider) {
            return { ...acc, connected };
          }
          return acc;
        })
      }
    }));
  };
  
  // 비밀번호 변경
  const handleChangePassword = () => {
    // 실제로는 모달이나 별도 페이지로 이동
    alert('비밀번호 변경 기능이 실행됩니다.');
  };
  
  // 계정 삭제 모달 표시
  const handleShowDeleteModal = () => {
    setShowDeleteModal(true);
  };
  
  // 계정 삭제 처리
  const handleAccountDelete = () => {
    // 실제로는 API 호출로 계정 삭제 처리
    alert('계정이 삭제되었습니다. 로그아웃됩니다.');
    setShowDeleteModal(false);
    // 로그아웃 및 리디렉션 처리
  };
  
  // 아바타 변경 모달 표시
  const handleShowAvatarModal = () => {
    setShowAvatarModal(true);
  };
  
  // 아바타 변경 처리
  const handleAvatarChange = (newAvatarUrl) => {
    handleSettingChange('profile', 'avatar', newAvatarUrl);
    setShowAvatarModal(false);
  };
  
  // 테마 변경 핸들러
  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    handleSettingChange('appearance', 'theme', theme);
  };
  
  // 설정 저장 핸들러
  const handleSaveSettings = () => {
    // 실제로는 API 호출로 설정을 서버에 저장
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('설정이 저장되었습니다.');
    }, 800);
  };
  
  // 설정 탭 렌더링
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>설정을 불러오는 중...</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'account':
        return renderAccountSettings();
      case 'profile':
        return renderProfileSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'language':
        return renderLanguageSettings();
      default:
        return null;
    }
  };
  
  // 계정 설정 탭
  const renderAccountSettings = () => {
    return (
      <div className="settings-section">
        <h2>계정 설정</h2>
        
        <div className="settings-card">
          <h3>기본 정보</h3>
          
          <div className="settings-item">
            <div className="setting-label">이메일</div>
            <div className="setting-control">
              <input 
                type="email" 
                value={userSettings.account.email}
                onChange={(e) => handleSettingChange('account', 'email', e.target.value)}
                className="settings-input"
              />
              <span className="setting-note">계정 알림 및 복구에 사용됩니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">사용자 이름</div>
            <div className="setting-control">
              <input 
                type="text" 
                value={userSettings.account.username}
                onChange={(e) => handleSettingChange('account', 'username', e.target.value)}
                className="settings-input"
              />
              <span className="setting-note">로그인에 사용되는 고유한 사용자 이름입니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">비밀번호</div>
            <div className="setting-control">
              <div className="password-field">
                <input 
                  type="password" 
                  value={userSettings.account.password}
                  readOnly
                  className="settings-input"
                />
                <button 
                  className="password-change-button"
                  onClick={handleChangePassword}
                >
                  변경
                </button>
              </div>
              <span className="setting-note">주기적으로 비밀번호를 변경하는 것이 좋습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">이중 인증</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.account.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('account', 'twoFactorEnabled', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">로그인 시 추가 인증 단계를 활성화합니다.</span>
              {userSettings.account.twoFactorEnabled && (
                <button className="setup-2fa-button">이중 인증 설정</button>
              )}
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>연결된 계정</h3>
          <p className="card-description">소셜 계정을 연결하여 간편하게 로그인하세요.</p>
          
          {userSettings.account.connectedAccounts.map(account => (
            <div key={account.provider} className="settings-item">
              <div className="setting-label">
                <span className={`provider-icon ${account.provider}`}></span>
                {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
              </div>
              <div className="setting-control">
                {account.connected ? (
                  <div className="connected-account-info">
                    <span className="connected-email">{account.email}</span>
                    <button 
                      className="disconnect-button"
                      onClick={() => handleConnectedAccountChange(account.provider, false)}
                    >
                      연결 해제
                    </button>
                  </div>
                ) : (
                  <button 
                    className="connect-button"
                    onClick={() => handleConnectedAccountChange(account.provider, true)}
                  >
                    연결하기
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="settings-card danger-zone">
          <h3>위험 구역</h3>
          
          <div className="settings-item">
            <div className="setting-label">계정 삭제</div>
            <div className="setting-control">
              <button 
                className="delete-account-button"
                onClick={handleShowDeleteModal}
              >
                계정 삭제하기
              </button>
              <span className="setting-note danger">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 프로필 설정 탭
  const renderProfileSettings = () => {
    return (
      <div className="settings-section">
        <h2>프로필 설정</h2>
        
        <div className="settings-card">
          <h3>프로필 정보</h3>
          
          <div className="settings-item avatar-setting">
            <div className="setting-label">프로필 이미지</div>
            <div className="setting-control">
              <div className="avatar-preview" onClick={handleShowAvatarModal}>
                <img src={userSettings.profile.avatar} alt="Profile" />
                <div className="avatar-overlay">
                  <span className="change-avatar-icon">📷</span>
                </div>
              </div>
              <button 
                className="change-avatar-button"
                onClick={handleShowAvatarModal}
              >
                변경하기
              </button>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">닉네임</div>
            <div className="setting-control">
              <input 
                type="text" 
                value={userSettings.profile.nickname}
                onChange={(e) => handleSettingChange('profile', 'nickname', e.target.value)}
                className="settings-input"
              />
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">자기소개</div>
            <div className="setting-control">
              <textarea 
                value={userSettings.profile.bio}
                onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
                className="settings-textarea"
                rows="4"
              />
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">커버 이미지</div>
            <div className="setting-control">
              <div className="cover-preview">
                <img src={userSettings.profile.coverImage} alt="Cover" />
                <button className="change-cover-button">변경하기</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>프로필 표시 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">레벨 표시</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.profile.showLevel}
                  onChange={(e) => handleSettingChange('profile', 'showLevel', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">
                현재 레벨: <span className="badge level-badge">Lv.{userSettings.profile.level}</span>
              </span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">뱃지 표시</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.profile.showBadges}
                  onChange={(e) => handleSettingChange('profile', 'showBadges', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <div className="badges-preview">
                {userSettings.profile.badges.map((badge, index) => (
                  <span key={index} className="badge">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">로켓 표시</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.profile.showRockets}
                  onChange={(e) => handleSettingChange('profile', 'showRockets', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">프로필에 내 로켓 컬렉션을 표시합니다.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 외관 설정 탭
  const renderAppearanceSettings = () => {
    const themes = [
      { id: 'space', name: '우주', icon: '🌌' },
      { id: 'future', name: '미래', icon: '🔮' },
      { id: 'retro', name: '레트로', icon: '🕰️' },
      { id: 'cyberpunk', name: '사이버펑크', icon: '🤖' },
      { id: 'nature', name: '자연', icon: '🌿' }
    ];
    
    return (
      <div className="settings-section">
        <h2>외관 설정</h2>
        
        <div className="settings-card">
          <h3>테마 선택</h3>
          
          <div className="theme-selector">
            {themes.map(theme => (
              <div 
                key={theme.id}
                className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="theme-icon">{theme.icon}</div>
                <div className="theme-name">{theme.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="settings-card">
          <h3>색상 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">배경 색상</div>
            <div className="setting-control">
              <div className="color-picker">
                <input 
                  type="color" 
                  value={userSettings.appearance.backgroundColor}
                  onChange={(e) => handleSettingChange('appearance', 'backgroundColor', e.target.value)}
                  className="color-input"
                />
                <input 
                  type="text" 
                  value={userSettings.appearance.backgroundColor}
                  onChange={(e) => handleSettingChange('appearance', 'backgroundColor', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">강조 색상</div>
            <div className="setting-control">
              <div className="color-picker">
                <input 
                  type="color" 
                  value={userSettings.appearance.accentColor}
                  onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
                  className="color-input"
                />
                <input 
                  type="text" 
                  value={userSettings.appearance.accentColor}
                  onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
                  className="color-text"
                />
              </div>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">다크 모드</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.appearance.darkMode}
                  onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>애니메이션 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">애니메이션</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.appearance.animationsEnabled}
                  onChange={(e) => handleSettingChange('appearance', 'animationsEnabled', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">페이지 전환 및 효과 애니메이션을 켜거나 끕니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">모션 줄이기</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.appearance.reducedMotion}
                  onChange={(e) => handleSettingChange('appearance', 'reducedMotion', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">화면의 움직임을 최소화하여 접근성을 향상시킵니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>글꼴 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">글꼴 선택</div>
            <div className="setting-control">
              <select
                value={userSettings.appearance.fontFamily}
                onChange={(e) => handleSettingChange('appearance', 'fontFamily', e.target.value)}
                className="settings-select"
              >
                <option value="Poppins">Poppins</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Noto Sans KR">Noto Sans KR</option>
                <option value="Nanum Gothic">나눔 고딕</option>
              </select>
              <div className="font-preview" style={{ fontFamily: userSettings.appearance.fontFamily }}>
                가나다라마바사 | ABCDEFG | 1234567890
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 알림 설정 탭
  const renderNotificationSettings = () => {
    return (
      <div className="settings-section">
        <h2>알림 설정</h2>
        
        <div className="settings-card">
          <h3>알림 방법</h3>
          
          <div className="settings-item">
            <div className="setting-label">이메일 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">중요 알림을 이메일로 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">푸시 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.pushNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">브라우저 푸시 알림을 활성화합니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">알림음</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.soundEnabled}
                  onChange={(e) => handleSettingChange('notifications', 'soundEnabled', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">알림 수신 시 소리를 재생합니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>로켓 알림</h3>
          
          <div className="settings-item">
            <div className="setting-label">발사 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.rocket.launchReminder}
                  onChange={(e) => handleNestedSettingChange('notifications', 'rocket', 'launchReminder', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">로켓 발사 예정 시간에 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">도착 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.rocket.arrivalNotice}
                  onChange={(e) => handleNestedSettingChange('notifications', 'rocket', 'arrivalNotice', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">로켓이 목적지에 도착했을 때 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">댓글 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.rocket.commentNotification}
                  onChange={(e) => handleNestedSettingChange('notifications', 'rocket', 'commentNotification', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">내 로켓에 댓글이 작성되면 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">좋아요 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.rocket.likeNotification}
                  onChange={(e) => handleNestedSettingChange('notifications', 'rocket', 'likeNotification', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">내 로켓에 좋아요가 추가되면 알림을 받습니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>친구 알림</h3>
          
          <div className="settings-item">
            <div className="setting-label">친구 요청</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.friends.friendRequests}
                  onChange={(e) => handleNestedSettingChange('notifications', 'friends', 'friendRequests', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">새로운 친구 요청에 대한 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">친구 활동</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.friends.friendActivity}
                  onChange={(e) => handleNestedSettingChange('notifications', 'friends', 'friendActivity', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">친구의 주요 활동에 대한 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">메시지</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.friends.messages}
                  onChange={(e) => handleNestedSettingChange('notifications', 'friends', 'messages', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">새로운 메시지가 도착하면 알림을 받습니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>시스템 알림</h3>
          
          <div className="settings-item">
            <div className="setting-label">업데이트</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.system.updates}
                  onChange={(e) => handleNestedSettingChange('notifications', 'system', 'updates', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">새로운 기능 및 업데이트에 대한 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">점검 정보</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.system.maintenance}
                  onChange={(e) => handleNestedSettingChange('notifications', 'system', 'maintenance', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">시스템 점검 및 서비스 점검에 대한 알림을 받습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">보안 알림</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.notifications.system.security}
                  onChange={(e) => handleNestedSettingChange('notifications', 'system', 'security', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">계정 보안 관련 알림을 받습니다.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 개인정보 설정 탭
  const renderPrivacySettings = () => {
    return (
      <div className="settings-section">
        <h2>개인정보 및 보안 설정</h2>
        
        <div className="settings-card">
          <h3>공개 범위 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">프로필 공개 범위</div>
            <div className="setting-control">
              <select
                value={userSettings.privacy.profileVisibility}
                onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                className="settings-select"
              >
                <option value="public">전체 공개</option>
                <option value="friends">친구에게만 공개</option>
                <option value="private">비공개</option>
              </select>
              <span className="setting-note">내 프로필을 볼 수 있는 사용자를 설정합니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">활동 공개 범위</div>
            <div className="setting-control">
              <select
                value={userSettings.privacy.activityVisibility}
                onChange={(e) => handleSettingChange('privacy', 'activityVisibility', e.target.value)}
                className="settings-select"
              >
                <option value="public">전체 공개</option>
                <option value="friends">친구에게만 공개</option>
                <option value="private">비공개</option>
              </select>
              <span className="setting-note">내 활동 내역을 볼 수 있는 사용자를 설정합니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">검색 허용</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.privacy.searchable}
                  onChange={(e) => handleSettingChange('privacy', 'searchable', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">다른 사용자가 나를 검색할 수 있도록 허용합니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>소통 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">친구 요청 허용</div>
            <div className="setting-control">
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={userSettings.privacy.allowFriendRequests}
                  onChange={(e) => handleSettingChange('privacy', 'allowFriendRequests', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <span className="setting-note">다른 사용자가 나에게 친구 요청을 보낼 수 있습니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">메시지 허용 범위</div>
            <div className="setting-control">
              <select
                value={userSettings.privacy.allowDirectMessages}
                onChange={(e) => handleSettingChange('privacy', 'allowDirectMessages', e.target.value)}
                className="settings-select"
              >
                <option value="everyone">모두</option>
                <option value="friends">친구만</option>
                <option value="none">비허용</option>
              </select>
              <span className="setting-note">누가 나에게 1:1 메시지를 보낼 수 있는지 설정합니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>차단 목록</h3>
          
          {userSettings.privacy.blockList.length === 0 ? (
            <p className="no-data-text">차단된 사용자가 없습니다.</p>
          ) : (
            <div className="block-list">
              {userSettings.privacy.blockList.map(user => (
                <div key={user.id} className="blocked-user">
                  <div className="user-info">
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                    <span className="user-name">{user.name}</span>
                  </div>
                  <button 
                    className="unblock-button"
                    onClick={() => {
                      // 차단 해제 처리
                    }}
                  >
                    차단 해제
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="block-user-form">
            <input 
              type="text"
              placeholder="사용자 ID 또는 닉네임"
              className="settings-input"
            />
            <button className="block-user-button">차단하기</button>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>데이터 관리</h3>
          
          <div className="settings-item">
            <div className="setting-label">데이터 다운로드</div>
            <div className="setting-control">
              <button className="download-data-button">내 데이터 다운로드</button>
              <span className="setting-note">내 계정의 모든 데이터를 다운로드합니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">활동 기록 삭제</div>
            <div className="setting-control">
              <button className="clear-activity-button">활동 기록 삭제</button>
              <span className="setting-note">내 활동 기록을 삭제합니다. 이 작업은 되돌릴 수 없습니다.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 언어 설정 탭
  const renderLanguageSettings = () => {
    return (
      <div className="settings-section">
        <h2>언어 및 지역 설정</h2>
        
        <div className="settings-card">
          <h3>언어 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">인터페이스 언어</div>
            <div className="setting-control">
              <select
                value={userSettings.language.interfaceLanguage}
                onChange={(e) => handleSettingChange('language', 'interfaceLanguage', e.target.value)}
                className="settings-select"
              >
                <option value="ko-KR">한국어</option>
                <option value="en-US">English (US)</option>
                <option value="ja-JP">日本語</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
              </select>
              <span className="setting-note">애플리케이션 인터페이스에 표시되는 언어입니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">콘텐츠 언어</div>
            <div className="setting-control">
              <select
                value={userSettings.language.contentLanguage}
                onChange={(e) => handleSettingChange('language', 'contentLanguage', e.target.value)}
                className="settings-select"
              >
                <option value="ko-KR">한국어</option>
                <option value="en-US">English (US)</option>
                <option value="ja-JP">日本語</option>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
              </select>
              <span className="setting-note">번역이 필요할 때 기본 언어로 설정됩니다.</span>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>지역 설정</h3>
          
          <div className="settings-item">
            <div className="setting-label">시간대</div>
            <div className="setting-control">
              <select
                value={userSettings.language.timeZone}
                onChange={(e) => handleSettingChange('language', 'timeZone', e.target.value)}
                className="settings-select"
              >
                <option value="Asia/Seoul">서울 (GMT+9)</option>
                <option value="America/New_York">뉴욕 (GMT-5/GMT-4)</option>
                <option value="Europe/London">런던 (GMT+0/GMT+1)</option>
                <option value="Asia/Tokyo">도쿄 (GMT+9)</option>
                <option value="Australia/Sydney">시드니 (GMT+10/GMT+11)</option>
              </select>
              <span className="setting-note">시간 표시 및 알림에 사용됩니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">날짜 형식</div>
            <div className="setting-control">
              <select
                value={userSettings.language.dateFormat}
                onChange={(e) => handleSettingChange('language', 'dateFormat', e.target.value)}
                className="settings-select"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY.MM.DD">YYYY.MM.DD</option>
              </select>
              <span className="setting-note">날짜가 표시되는 형식입니다.</span>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="setting-label">시간 형식</div>
            <div className="setting-control">
              <select
                value={userSettings.language.timeFormat}
                onChange={(e) => handleSettingChange('language', 'timeFormat', e.target.value)}
                className="settings-select"
              >
                <option value="24h">24시간 (14:30)</option>
                <option value="12h">12시간 (2:30 PM)</option>
              </select>
              <span className="setting-note">시간이 표시되는 형식입니다.</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // 계정 삭제 모달
  const renderDeleteAccountModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
        <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>계정 삭제</h2>
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="warning-icon">⚠️</div>
            <h3>정말 계정을 삭제하시겠습니까?</h3>
            <p>이 작업은 취소할 수 없으며, 모든 데이터가 영구적으로 삭제됩니다:</p>
            
            <ul className="delete-warning-list">
              <li>모든 로켓 및 관련 데이터</li>
              <li>친구 목록 및 대화 내용</li>
              <li>커뮤니티 활동 및 댓글</li>
              <li>프로필 정보 및 설정</li>
            </ul>
            
            <div className="confirmation-input">
              <label htmlFor="delete-confirmation">확인을 위해 "계정 삭제"를 입력하세요:</label>
              <input 
                type="text" 
                id="delete-confirmation"
                placeholder="계정 삭제"
                className="settings-input"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="cancel-button"
              onClick={() => setShowDeleteModal(false)}
            >
              취소
            </button>
            <button 
              className="delete-confirm-button"
              onClick={handleAccountDelete}
            >
              계정 영구 삭제
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // 아바타 변경 모달
  const renderAvatarModal = () => {
    if (!showAvatarModal) return null;
    
    const avatarOptions = [
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150/FF5733',
      'https://via.placeholder.com/150/33FF57',
      'https://via.placeholder.com/150/3357FF',
      'https://via.placeholder.com/150/F333FF',
      'https://via.placeholder.com/150/FF33F3'
    ];
    
    return (
      <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
        <div className="modal-content avatar-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>프로필 이미지 변경</h2>
            <button className="modal-close" onClick={() => setShowAvatarModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="avatar-preview-large">
              <img src={userSettings.profile.avatar} alt="Current Avatar" />
            </div>
            
            <div className="avatar-options">
              <h3>기본 아바타 선택</h3>
              <div className="avatar-grid">
                {avatarOptions.map((avatar, index) => (
                  <div 
                    key={index}
                    className={`avatar-option ${userSettings.profile.avatar === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarChange(avatar)}
                  >
                    <img src={avatar} alt={`Avatar option ${index + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="avatar-upload">
              <h3>이미지 업로드</h3>
              <div className="file-upload-container">
                <input 
                  type="file" 
                  id="avatar-upload" 
                  className="file-input"
                  accept="image/*"
                />
                <label htmlFor="avatar-upload" className="file-label">
                  이미지 파일 선택
                </label>
                <span className="file-note">최대 5MB, JPG, PNG 또는 GIF 형식</span>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="cancel-button"
              onClick={() => setShowAvatarModal(false)}
            >
              취소
            </button>
            <button 
              className="save-button"
              onClick={() => setShowAvatarModal(false)}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-sidebar">
          <h1>설정</h1>
          
          <nav className="settings-nav">
            <button 
              className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <span className="nav-icon">👤</span>
              계정 설정
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">📝</span>
              프로필 설정
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="nav-icon">🎨</span>
              외관 설정
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="nav-icon">🔔</span>
              알림 설정
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <span className="nav-icon">🔒</span>
              개인정보 및 보안
            </button>
            
            <button 
              className={`settings-nav-item ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              <span className="nav-icon">🌍</span>
              언어 및 지역
            </button>
          </nav>
          
          <div className="save-settings-container">
            <button 
              className="save-settings-button"
              onClick={handleSaveSettings}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner-small"></span>
              ) : (
                '설정 저장'
              )}
            </button>
          </div>
        </div>
        
        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
      
      {renderDeleteAccountModal()}
      {renderAvatarModal()}
    </div>
  );
};

export default SettingsPage;