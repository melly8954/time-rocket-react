// src/pages/MeetingsPage.jsx
import { useState, useEffect } from 'react';
import '../styles/components/meetingsPage.css';

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'participants'
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    category: 'space',
    maxParticipants: 10,
    date: '',
    time: '',
    location: '',
    coverImage: ''
  });

  // 더미 데이터 로드
  useEffect(() => {
    // API 호출 시뮬레이션
    setTimeout(() => {
      const dummyMeetings = [
        {
          id: 1,
          title: "시간여행 체험단",
          description: "미래와 과거를 오가는 시간여행을 함께 경험해보세요. 설레는 모험이 기다립니다!",
          category: "adventure",
          createdBy: "시간마법사",
          creatorLevel: 22,
          participants: 8,
          maxParticipants: 12,
          date: "2025-05-25",
          time: "19:00",
          location: "미래 연구소",
          coverImage: "https://via.placeholder.com/800x400",
          tags: ["시간여행", "모험", "체험"],
          members: [
            { id: 1, nickname: "시간마법사", level: 22, isCreator: true },
            { id: 2, nickname: "별자리사냥꾼", level: 8 },
            { id: 3, nickname: "양자물리학자", level: 15 },
            { id: 4, nickname: "시간탐험가", level: 12 },
            { id: 5, nickname: "로켓엔지니어", level: 17 }
          ]
        },
        {
          id: 2,
          title: "우주 탐험가 모임",
          description: "미지의 별들을 탐험하고 우주의 비밀을 함께 발견해요. 다른 행성의 문화와 생명체에 관심 있으신 분들 환영합니다!",
          category: "space",
          createdBy: "은하수여행자",
          creatorLevel: 18,
          participants: 12,
          maxParticipants: 15,
          date: "2025-05-15",
          time: "18:30",
          location: "우주 관측소",
          coverImage: "https://via.placeholder.com/800x400",
          tags: ["우주", "탐험", "행성"],
          members: [
            { id: 1, nickname: "은하수여행자", level: 18, isCreator: true },
            { id: 2, nickname: "별자리사냥꾼", level: 8 },
            { id: 3, nickname: "로켓엔지니어", level: 17 }
          ]
        },
        {
          id: 3,
          title: "별자리 관측 모임",
          description: "밤하늘의 별들을 함께 관찰하고 별자리에 얽힌 이야기를 나누는 시간입니다. 관측 장비 대여 가능!",
          category: "astronomy",
          createdBy: "별자리사냥꾼",
          creatorLevel: 8,
          participants: 6,
          maxParticipants: 10,
          date: "2025-06-05",
          time: "21:00",
          location: "천문대",
          coverImage: "https://via.placeholder.com/800x400",
          tags: ["별자리", "관측", "천문학"],
          members: [
            { id: 1, nickname: "별자리사냥꾼", level: 8, isCreator: true },
            { id: 2, nickname: "양자물리학자", level: 15 },
            { id: 3, nickname: "시간탐험가", level: 12 }
          ]
        },
        {
          id: 4,
          title: "타임머신 워크숍",
          description: "직접 간단한 타임머신 모형을 만들어보는 워크숍! 시간여행의 물리학적 원리도 함께 배워요.",
          category: "workshop",
          createdBy: "양자물리학자",
          creatorLevel: 15,
          participants: 5,
          maxParticipants: 8,
          date: "2025-05-20",
          time: "15:00",
          location: "양자 연구소",
          coverImage: "https://via.placeholder.com/800x400",
          tags: ["워크숍", "타임머신", "물리학"],
          members: [
            { id: 1, nickname: "양자물리학자", level: 15, isCreator: true },
            { id: 2, nickname: "로켓엔지니어", level: 17 },
            { id: 3, nickname: "시간마법사", level: 22 }
          ]
        },
        {
          id: 5,
          title: "로켓 엔진 연구회",
          description: "더 효율적인 시간여행 로켓 엔진을 함께 연구해요. 엔지니어링 경험이 없어도 참여 가능합니다!",
          category: "science",
          createdBy: "로켓엔지니어",
          creatorLevel: 17,
          participants: 9,
          maxParticipants: 12,
          date: "2025-06-10",
          time: "14:00",
          location: "엔진 연구실",
          coverImage: "https://via.placeholder.com/800x400",
          tags: ["로켓", "엔진", "연구"],
          members: [
            { id: 1, nickname: "로켓엔지니어", level: 17, isCreator: true },
            { id: 2, nickname: "양자물리학자", level: 15 },
            { id: 3, nickname: "시간탐험가", level: 12 }
          ]
        }
      ];
      
      setMeetings(dummyMeetings);
      setIsLoading(false);
    }, 1000);
  }, []);

  // 카테고리 필터링 + 검색
  const filteredMeetings = meetings.filter(meeting => {
    const categoryMatch = activeCategory === 'all' || meeting.category === activeCategory;
    
    const searchMatch = searchQuery === '' || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  // 모임 생성 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({ ...prev, [name]: value }));
  };

  // 모임 생성 처리
  const handleCreateMeeting = (e) => {
    e.preventDefault();
    
    // 실제로는 API 호출을 통해 서버에 데이터 전송
    const createdMeeting = {
      id: meetings.length + 1,
      ...newMeeting,
      createdBy: "우주탐험가", // 현재 로그인한 사용자
      creatorLevel: 12,
      participants: 1,
      tags: newMeeting.tags ? newMeeting.tags.split(',').map(tag => tag.trim()) : [],
      members: [
        { id: 1, nickname: "우주탐험가", level: 12, isCreator: true }
      ]
    };
    
    setMeetings([...meetings, createdMeeting]);
    setShowCreateModal(false);
    setNewMeeting({
      title: '',
      description: '',
      category: 'space',
      maxParticipants: 10,
      date: '',
      time: '',
      location: '',
      coverImage: '',
      tags: ''
    });
    
    alert("모임이 생성되었습니다!");
  };

  // 모임 참가 처리
  const handleJoinMeeting = (meetingId) => {
    // 실제로는 API 호출을 통해 처리
    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => {
        if (meeting.id === meetingId && meeting.participants < meeting.maxParticipants) {
          return {
            ...meeting,
            participants: meeting.participants + 1,
            members: [...meeting.members, {
              id: 999, // 임시 ID
              nickname: "우주탐험가", // 현재 로그인한 사용자
              level: 12
            }]
          };
        }
        return meeting;
      })
    );
    
    alert("모임에 참가했습니다!");
  };

  // 모임 상세 보기
  const handleViewDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  // 참가자 목록 보기
  const handleViewParticipants = () => {
    setCurrentView('participants');
  };

  // 목록으로 돌아가기
  const handleBackToList = () => {
    setSelectedMeeting(null);
    setCurrentView('list');
  };

  // 목록으로 돌아가기 (상세에서 참가자로 갔을 경우)
  const handleBackToDetail = () => {
    setCurrentView('detail');
  };

  // 카테고리 목록
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'space', name: '우주' },
    { id: 'adventure', name: '모험' },
    { id: 'science', name: '과학' },
    { id: 'astronomy', name: '천문학' },
    { id: 'workshop', name: '워크숍' }
  ];

  // 태그를 배열로 변환하는 헬퍼 함수
  const formatTags = (tags) => {
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim());
    }
    return tags || [];
  };

  // 남은 자리 계산
  const getRemainingSpots = (meeting) => {
    return meeting.maxParticipants - meeting.participants;
  };

  // 날짜 형식 포맷팅
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 모임 상세 페이지 렌더링
  const renderMeetingDetail = () => {
    if (!selectedMeeting) return null;
    
    const remainingSpots = getRemainingSpots(selectedMeeting);
    const isMember = selectedMeeting.members.some(member => member.nickname === "우주탐험가"); // 실제로는 로그인 사용자 확인
    const isFull = remainingSpots <= 0;

    return (
      <div className="meeting-detail">
        <div className="meeting-detail-header">
          <button className="back-button" onClick={handleBackToList}>
            <span className="back-icon">←</span> 목록으로
          </button>
        </div>
        
        <div className="meeting-cover">
          <img src={selectedMeeting.coverImage} alt={selectedMeeting.title} />
          <div className="meeting-category-badge">{categories.find(c => c.id === selectedMeeting.category)?.name || selectedMeeting.category}</div>
        </div>
        
        <div className="meeting-info">
          <div className="meeting-header">
            <h1>{selectedMeeting.title}</h1>
            <div className="meeting-meta">
              <span className="meeting-creator">
                주최: {selectedMeeting.createdBy} (Lv.{selectedMeeting.creatorLevel})
              </span>
              <span className="meeting-participants">
                참가자: {selectedMeeting.participants}/{selectedMeeting.maxParticipants}명
              </span>
            </div>
          </div>
          
          <div className="meeting-schedule">
            <div className="schedule-item">
              <span className="schedule-icon">🗓️</span>
              <span>{formatDate(selectedMeeting.date)}</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-icon">🕒</span>
              <span>{selectedMeeting.time}</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-icon">📍</span>
              <span>{selectedMeeting.location}</span>
            </div>
          </div>
          
          <div className="meeting-description">
            <h2>모임 소개</h2>
            <p>{selectedMeeting.description}</p>
          </div>
          
          <div className="meeting-tags">
            {formatTags(selectedMeeting.tags).map((tag, index) => (
              <span key={index} className="meeting-tag">#{tag}</span>
            ))}
          </div>
          
          <div className="meeting-actions">
            <button 
              className="view-participants-button"
              onClick={handleViewParticipants}
            >
              참가자 목록 보기 ({selectedMeeting.participants}명)
            </button>
            
            {!isMember && !isFull ? (
              <button 
                className="join-meeting-button"
                onClick={() => handleJoinMeeting(selectedMeeting.id)}
              >
                모임 참가하기
                {remainingSpots > 0 && <span className="spots-left">({remainingSpots}자리 남음)</span>}
              </button>
            ) : isMember ? (
              <button className="leave-meeting-button">
                모임 탈퇴하기
              </button>
            ) : (
              <button className="full-meeting-button" disabled>
                모집 완료
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 참가자 목록 페이지 렌더링
  const renderParticipants = () => {
    if (!selectedMeeting) return null;
    
    return (
      <div className="participants-view">
        <div className="participants-header">
          <button className="back-button" onClick={handleBackToDetail}>
            <span className="back-icon">←</span> 모임 상세로
          </button>
          <h2>참가자 목록</h2>
        </div>
        
        <div className="participants-count">
          총 {selectedMeeting.participants}명 / {selectedMeeting.maxParticipants}명
        </div>
        
        <div className="participants-list">
          {selectedMeeting.members.map(member => (
            <div 
              key={member.id} 
              className={`participant-item ${member.isCreator ? 'creator' : ''}`}
            >
              <div className="participant-avatar">
                <div className="avatar-placeholder">
                  {member.nickname.charAt(0)}
                </div>
              </div>
              <div className="participant-info">
                <div className="participant-name">
                  {member.nickname}
                  {member.isCreator && <span className="creator-badge">주최자</span>}
                </div>
                <div className="participant-level">Lv.{member.level}</div>
              </div>
              {member.isCreator && (
                <div className="participant-actions">
                  <button className="action-button">
                    <span className="action-icon">📣</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 모임 목록 페이지 렌더링
  const renderMeetingsList = () => {
    return (
      <>
        <div className="meetings-header">
          <h1>타임로켓 모임</h1>
          <p className="meetings-description">
            시간과 우주를 탐험하는 다양한 모임에 참여하거나 직접 모임을 만들어보세요.
          </p>
          
          <div className="meetings-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="모임 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button">🔍</button>
            </div>
            
            <button 
              className="create-meeting-button"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="button-icon">+</span> 모임 만들기
            </button>
          </div>
        </div>
        
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>모임을 불러오는 중...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="empty-meetings">
            <div className="empty-icon">👥</div>
            <h3>모임이 없습니다</h3>
            <p>
              {searchQuery ? '검색 결과가 없습니다.' : activeCategory !== 'all' ? '이 카테고리에는 아직 모임이 없습니다.' : '첫 번째 모임을 만들어보세요!'}
            </p>
            <button 
              className="create-meeting-button large"
              onClick={() => setShowCreateModal(true)}
            >
              모임 만들기
            </button>
          </div>
        ) : (
          <div className="meetings-grid">
            {filteredMeetings.map(meeting => {
              const remainingSpots = getRemainingSpots(meeting);
              const isMember = meeting.members.some(member => member.nickname === "우주탐험가"); // 실제로는 로그인 사용자 확인
              
              return (
                <div key={meeting.id} className="meeting-card">
                  <div className="meeting-card-cover" onClick={() => handleViewDetail(meeting)}>
                    <img src={meeting.coverImage} alt={meeting.title} />
                    <div className="meeting-date-badge">
                      {formatDate(meeting.date)}
                    </div>
                    <div className="meeting-category-badge">
                      {categories.find(c => c.id === meeting.category)?.name || meeting.category}
                    </div>
                  </div>
                  
                  <div className="meeting-card-content">
                    <h3 onClick={() => handleViewDetail(meeting)}>{meeting.title}</h3>
                    <p className="meeting-card-desc">{meeting.description}</p>
                    
                    <div className="meeting-card-info">
                      <div className="meeting-creator-info">
                        <div className="creator-avatar">
                          {meeting.createdBy.charAt(0)}
                        </div>
                        <span>{meeting.createdBy}</span>
                      </div>
                      
                      <div className="meeting-participants-info">
                        <span className="participants-count">
                          {meeting.participants}/{meeting.maxParticipants}명
                        </span>
                        {remainingSpots > 0 ? (
                          <span className="spots-left">({remainingSpots}자리 남음)</span>
                        ) : (
                          <span className="no-spots">모집 완료</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="meeting-card-tags">
                      {formatTags(meeting.tags).slice(0, 3).map((tag, index) => (
                        <span key={index} className="meeting-tag">#{tag}</span>
                      ))}
                    </div>
                    
                    <div className="meeting-card-actions">
                      <button 
                        className="view-detail-button"
                        onClick={() => handleViewDetail(meeting)}
                      >
                        상세 보기
                      </button>
                      
                      {!isMember && remainingSpots > 0 ? (
                        <button 
                          className="join-button"
                          onClick={() => handleJoinMeeting(meeting.id)}
                        >
                          참가하기
                        </button>
                      ) : isMember ? (
                        <button className="member-button" disabled>
                          참가 중
                        </button>
                      ) : (
                        <button className="full-button" disabled>
                          모집 완료
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  // 모임 생성 모달
  const renderCreateModal = () => {
    if (!showCreateModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>새 모임 만들기</h2>
            <button 
              className="modal-close"
              onClick={() => setShowCreateModal(false)}
            >
              ×
            </button>
          </div>
          
          <form className="create-meeting-form" onSubmit={handleCreateMeeting}>
            <div className="form-group">
              <label htmlFor="title">모임 이름 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newMeeting.title}
                onChange={handleInputChange}
                required
                placeholder="모임 이름을 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">모임 소개 *</label>
              <textarea
                id="description"
                name="description"
                value={newMeeting.description}
                onChange={handleInputChange}
                required
                rows="4"
                placeholder="모임에 대한 소개를 작성하세요"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">카테고리 *</label>
                <select
                  id="category"
                  name="category"
                  value={newMeeting.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="space">우주</option>
                  <option value="adventure">모험</option>
                  <option value="science">과학</option>
                  <option value="astronomy">천문학</option>
                  <option value="workshop">워크숍</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="maxParticipants">최대 참가자 수 *</label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  min="2"
                  max="50"
                  value={newMeeting.maxParticipants}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">날짜 *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newMeeting.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="time">시간 *</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={newMeeting.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">장소 *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newMeeting.location}
                onChange={handleInputChange}
                required
                placeholder="모임 장소를 입력하세요"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">태그 (쉼표로 구분)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={newMeeting.tags}
                onChange={handleInputChange}
                placeholder="예: 우주, 탐험, 과학"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="coverImage">커버 이미지 URL</label>
              <input
                type="text"
                id="coverImage"
                name="coverImage"
                value={newMeeting.coverImage}
                onChange={handleInputChange}
                placeholder="이미지 URL을 입력하세요"
              />
              {newMeeting.coverImage && (
                <div className="image-preview">
                  <img src={newMeeting.coverImage} alt="커버 이미지 미리보기" />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={() => setShowCreateModal(false)}>
                취소
              </button>
              <button type="submit" className="submit-button">
                모임 생성하기
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="meetings-container">
      {currentView === 'list' ? renderMeetingsList() : 
       currentView === 'detail' ? renderMeetingDetail() : renderParticipants()}
      
      {renderCreateModal()}
    </div>
  );
};

export default MeetingsPage;