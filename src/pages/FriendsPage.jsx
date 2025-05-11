// src/pages/FriendsPage.jsx
import { useState, useEffect } from 'react';
import '../styles/components/friendsPage.css';

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // 친구 목록 더미 데이터
  useEffect(() => {
    // API 호출을 시뮬레이션
    setTimeout(() => {
      const dummyFriends = [
        {
          id: 1,
          nickname: "시간탐험가",
          level: 15,
          status: "online",
          lastActive: "방금 전",
          profileImage: "https://via.placeholder.com/50",
          bio: "과거와 미래를 탐험하는 시간여행가 🚀"
        },
        {
          id: 2,
          nickname: "별자리사냥꾼",
          level: 8,
          status: "offline",
          lastActive: "3시간 전",
          profileImage: "https://via.placeholder.com/50",
          bio: "밤하늘의 별들을 사랑하는 우주 탐험가 ✨"
        },
        {
          id: 3,
          nickname: "양자물리학자",
          level: 22,
          status: "online",
          lastActive: "방금 전",
          profileImage: "https://via.placeholder.com/50",
          bio: "시간의 비밀을 연구하는 물리학자 🔬"
        },
        {
          id: 4,
          nickname: "로켓엔지니어",
          level: 17,
          status: "away",
          lastActive: "30분 전",
          profileImage: "https://via.placeholder.com/50",
          bio: "타임로켓 제작 전문가 🛠️"
        },
        {
          id: 5,
          nickname: "은하수여행자",
          level: 12,
          status: "offline",
          lastActive: "1일 전",
          profileImage: "https://via.placeholder.com/50",
          bio: "은하계를 여행하는 우주 방랑자 🌌"
        }
      ];
      
      setFriends(dummyFriends);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 더미 채팅 메시지
  useEffect(() => {
    if (selectedFriend) {
      // 선택된 친구에 따라 다른 채팅 내역을 보여줌
      const dummyMessages = [
        {
          id: 1,
          senderId: selectedFriend.id,
          text: "안녕하세요! 요즘 어떻게 지내세요?",
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1시간 전
        },
        {
          id: 2,
          senderId: 'me',
          text: "안녕하세요! 저는 새로운 시간여행 경로를 탐색하고 있어요.",
          timestamp: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: 3,
          senderId: selectedFriend.id,
          text: "와, 정말 흥미롭네요! 어느 시대를 탐험하고 계신가요?",
          timestamp: new Date(Date.now() - 3400000).toISOString()
        },
        {
          id: 4,
          senderId: 'me',
          text: "르네상스 시대요! 예술과 과학의 발전이 정말 놀랍더라고요.",
          timestamp: new Date(Date.now() - 3300000).toISOString()
        },
        {
          id: 5,
          senderId: selectedFriend.id,
          text: "좋은 선택이에요! 저도 그 시대를 정말 좋아합니다. 다음에는 함께 여행할 수 있을까요?",
          timestamp: new Date(Date.now() - 3200000).toISOString()
        }
      ];
      
      setChatMessages(dummyMessages);
    }
  }, [selectedFriend]);

  // 친구 필터링
  const filteredFriends = friends.filter(friend => {
    // 검색어 필터링
    const searchMatch = searchQuery === '' || 
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 탭 필터링
    const tabMatch = activeTab === 'all' || 
      (activeTab === 'online' && (friend.status === 'online' || friend.status === 'away')) ||
      (activeTab === 'offline' && friend.status === 'offline');
    
    return searchMatch && tabMatch;
  });

  // 시간 표시 형식
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (messageInput.trim() === '') return;
    
    const newMessage = {
      id: chatMessages.length + 1,
      senderId: 'me',
      text: messageInput,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
    
    // 자동 응답 (실제로는 서버에서 처리)
    setTimeout(() => {
      const autoResponse = {
        id: chatMessages.length + 2,
        senderId: selectedFriend.id,
        text: "메시지 받았어요! 곧 답변 드릴게요.",
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prevMessages => [...prevMessages, autoResponse]);
    }, 1000);
  };

  // 친구 추가 핸들러
  const handleAddFriend = () => {
    // 실제로는 친구 추가 모달이나 페이지로 이동
    alert('친구 추가 기능이 실행됩니다.');
  };

  return (
    <div className="friends-container">
      <div className="friends-sidebar">
        <div className="friends-header">
          <h2>친구 목록</h2>
          <button className="add-friend-button" onClick={handleAddFriend}>
            <span className="button-icon">+</span>
          </button>
        </div>
        
        <div className="friends-search">
          <input
            type="text"
            placeholder="친구 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="friends-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            전체
          </button>
          <button 
            className={`tab ${activeTab === 'online' ? 'active' : ''}`}
            onClick={() => setActiveTab('online')}
          >
            온라인
          </button>
          <button 
            className={`tab ${activeTab === 'offline' ? 'active' : ''}`}
            onClick={() => setActiveTab('offline')}
          >
            오프라인
          </button>
        </div>
        
        <div className="friends-list">
          {isLoading ? (
            <div className="loading-friends">
              <div className="loading-spinner-small"></div>
              <p>친구 목록을 불러오는 중...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="empty-friends">
              <p>
                {searchQuery ? 
                  '검색 결과가 없습니다.' : 
                  activeTab !== 'all' ? 
                    `${activeTab === 'online' ? '온라인' : '오프라인'} 친구가 없습니다.` : 
                    '친구 목록이 비어있습니다.'
                }
              </p>
            </div>
          ) : (
            filteredFriends.map(friend => (
              <div 
                key={friend.id} 
                className={`friend-item ${selectedFriend && selectedFriend.id === friend.id ? 'selected' : ''}`}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="friend-avatar">
                  <img src={friend.profileImage} alt={friend.nickname} />
                  <span className={`status-indicator ${friend.status}`}></span>
                </div>
                <div className="friend-info">
                  <h3>{friend.nickname}</h3>
                  <p className="friend-bio">{friend.bio}</p>
                </div>
                <div className="friend-meta">
                  <span className="friend-level">Lv.{friend.level}</span>
                  <span className="last-active">{friend.lastActive}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="my-profile">
          <div className="profile-avatar">
            <img src="https://via.placeholder.com/40" alt="내 프로필" />
            <span className="status-indicator online"></span>
          </div>
          <div className="profile-info">
            <h3>우주탐험가</h3>
            <p>온라인</p>
          </div>
          <button className="settings-button">
            <span className="settings-icon">⚙️</span>
          </button>
        </div>
      </div>
      
      <div className="chat-container">
        {selectedFriend ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="friend-avatar small">
                  <img src={selectedFriend.profileImage} alt={selectedFriend.nickname} />
                  <span className={`status-indicator ${selectedFriend.status}`}></span>
                </div>
                <div>
                  <h3>{selectedFriend.nickname}</h3>
                  <p className={`user-status ${selectedFriend.status}`}>
                    {selectedFriend.status === 'online' ? '온라인' : 
                     selectedFriend.status === 'away' ? '자리비움' : '오프라인'}
                  </p>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-button" title="음성 통화">
                  <span className="action-icon">📞</span>
                </button>
                <button className="action-button" title="화상 통화">
                  <span className="action-icon">📹</span>
                </button>
                <button className="action-button" title="추가 옵션">
                  <span className="action-icon">⋯</span>
                </button>
              </div>
            </div>
            
            <div className="chat-messages">
              {chatMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.senderId === 'me' ? 'outgoing' : 'incoming'}`}
                >
                  {message.senderId !== 'me' && (
                    <div className="message-avatar">
                      <img src={selectedFriend.profileImage} alt={selectedFriend.nickname} />
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-bubble">
                      <p>{message.text}</p>
                      <span className="message-time">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <div className="chat-tools">
                <button type="button" className="tool-button" title="이모티콘">
                  <span className="tool-icon">😊</span>
                </button>
                <button type="button" className="tool-button" title="파일 첨부">
                  <span className="tool-icon">📎</span>
                </button>
                <button type="button" className="tool-button" title="로켓 공유">
                  <span className="tool-icon">🚀</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="메시지를 입력하세요..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="submit" className="send-button" disabled={messageInput.trim() === ''}>
                <span className="send-icon">📤</span>
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="space-illustration">
              <div className="planet"></div>
              <div className="rocket"></div>
              <div className="stars"></div>
            </div>
            <h2>채팅을 시작하려면 친구를 선택하세요</h2>
            <p>친구와의 대화는 시간과 공간을 초월하는 여행입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
