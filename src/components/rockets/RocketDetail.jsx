// src/components/rockets/RocketDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RocketIcon, ClockIcon, UserIcon, StarIcon } from '../ui/Icons';
import SpaceBackground from '../ui/SpaceBackground';
import '../../styles/components/rocketDetail.css';

const RocketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rocket, setRocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [currentCountdown, setCurrentCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedRocket, setEditedRocket] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // 로켓 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출로 특정 ID의 로켓 정보를 가져옵니다
    setIsLoading(true);
    
    // API 호출 시뮬레이션
    setTimeout(() => {
      // 더미 로켓 데이터
      const dummyRocket = {
        id: parseInt(id),
        title: "미래로의 시간 여행",
        description: "2050년의 세계는 어떤 모습일까요? 인공지능, 우주 식민지, 환경 회복... 미래의 풍경을 탐험하는 로켓입니다. 함께 미래로 떠나 볼까요?",
        destination: "2050년 지구",
        launchDate: "2025-12-31T23:59:59",
        arrivalDate: "2050-01-01T00:00:01",
        createdBy: "우주탐험가",
        createdAt: "2025-05-08T14:30:00",
        status: "scheduled", // scheduled, launched, arrived, draft
        visibility: "public", // public, friends, private
        views: 128,
        likes: 42,
        shares: 17,
        tags: ["미래", "시간여행", "인공지능", "우주", "환경"],
        coverImage: "https://via.placeholder.com/1200x600",
        route: [
          { name: "출발", time: "2025-12-31T23:59:59", coordinates: { x: 0, y: 0, z: 0 } },
          { name: "양자 터널 진입", time: "2025-12-31T23:59:59.5", coordinates: { x: 100, y: 150, z: 50 } },
          { name: "시간의 축 통과", time: "2025-12-31T23:59:59.8", coordinates: { x: 250, y: 300, z: 200 } },
          { name: "도착", time: "2050-01-01T00:00:01", coordinates: { x: 500, y: 600, z: 300 } }
        ]
      };
      
      // 더미 첨부 파일 데이터
      const dummyAttachments = [
        { 
          id: 1, 
          filename: "미래_예측_자료.pdf", 
          type: "document", 
          size: "2.4 MB", 
          uploadedAt: "2025-05-08T14:35:00",
          url: "#"
        },
        { 
          id: 2, 
          filename: "2050년_도시_이미지.jpg", 
          type: "image", 
          size: "1.8 MB", 
          uploadedAt: "2025-05-08T14:40:00",
          url: "https://via.placeholder.com/500x300"
        },
        { 
          id: 3, 
          filename: "미래기술_영상.mp4", 
          type: "video", 
          size: "18.2 MB", 
          uploadedAt: "2025-05-08T14:45:00",
          url: "#"
        }
      ];
      
      // 더미 댓글 데이터
      const dummyComments = [
        {
          id: 1,
          author: "시간마법사",
          authorAvatar: "https://via.placeholder.com/40",
          content: "정말 흥미로운 로켓이네요! 저도 함께 여행해보고 싶습니다.",
          createdAt: "2025-05-09T10:15:00",
          likes: 7
        },
        {
          id: 2,
          author: "양자물리학자",
          authorAvatar: "https://via.placeholder.com/40",
          content: "2050년의 양자컴퓨팅이 어떻게 발전해 있을지 궁금합니다. 그때 컴퓨팅 능력이 지금보다 얼마나 발전했을까요?",
          createdAt: "2025-05-09T15:30:00",
          likes: 5
        },
        {
          id: 3,
          author: "미래학자",
          authorAvatar: "https://via.placeholder.com/40",
          content: "AI와 인간의 공존 문제가 어떻게 해결되었을지 확인해보세요. 2035년 이후로 큰 변화가 있었을 거예요.",
          createdAt: "2025-05-10T09:45:00",
          likes: 12
        }
      ];
      
      setRocket(dummyRocket);
      setEditedRocket(dummyRocket);
      setAttachments(dummyAttachments);
      setComments(dummyComments);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  // 카운트다운 타이머
  useEffect(() => {
    if (!rocket) return;
    
    const launchDate = new Date(rocket.launchDate);
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = launchDate - now;
      
      if (difference <= 0) {
        // 로켓이 이미 발사됨
        setCurrentCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCurrentCountdown({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [rocket]);

  // 로켓 정보 업데이트 핸들러
  const handleRocketUpdate = () => {
    // 실제로는 API 호출로 로켓 정보를 업데이트합니다
    setIsLoading(true);
    
    setTimeout(() => {
      setRocket(editedRocket);
      setIsLoading(false);
      setEditMode(false);
      alert("로켓 정보가 업데이트되었습니다!");
    }, 800);
  };
  
  // 로켓 수정 입력 핸들러
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedRocket(prev => ({ ...prev, [name]: value }));
  };
  
  // 태그 입력 핸들러
  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    setEditedRocket(prev => ({
      ...prev,
      tags: tagsString.split(',').map(tag => tag.trim())
    }));
  };

  // 댓글 추가 핸들러
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: comments.length + 1,
      author: "우주탐험가", // 현재 로그인한 사용자
      authorAvatar: "https://via.placeholder.com/40",
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  // 댓글 좋아요 핸들러
  const handleLikeComment = (commentId) => {
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 };
        }
        return comment;
      })
    );
  };

  // 로켓 좋아요 핸들러
  const handleLikeRocket = () => {
    setRocket(prev => ({ ...prev, likes: prev.likes + 1 }));
  };

  // 로켓 공유 핸들러
  const handleShareRocket = () => {
    setShowShareModal(true);
  };

  // 파일 타입 아이콘 헬퍼 함수
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'document': return '📄';
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'audio': return '🔊';
      default: return '📎';
    }
  };

  // 날짜 포맷 헬퍼 함수
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  };

  // 로딩 상태일 때 표시
  if (isLoading) {
    return (
      <div className="rocket-detail-loading">
        <div className="loading-animation">
          <div className="rocket-loader">
            <div className="rocket-body"></div>
            <div className="rocket-window"></div>
            <div className="rocket-fin"></div>
            <div className="rocket-flames"></div>
          </div>
        </div>
        <p>로켓 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 로켓 정보가 없을 때 표시
  if (!rocket) {
    return (
      <div className="rocket-not-found">
        <div className="not-found-icon">🚫</div>
        <h2>로켓을 찾을 수 없습니다</h2>
        <p>요청하신 로켓이 존재하지 않거나 접근 권한이 없습니다.</p>
        <button className="back-button" onClick={() => navigate('/rockets')}>
          로켓 목록으로 돌아가기
        </button>
      </div>
    );
  }

  // 공유 모달
  const renderShareModal = () => {
    if (!showShareModal) return null;
    
    const shareUrl = `https://timerocket.example.com/rockets/${rocket.id}`;
    
    return (
      <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
        <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>로켓 공유하기</h2>
            <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
          </div>
          
          <div className="share-options">
            <div className="share-link-container">
              <div className="share-url-box">
                <input type="text" value={shareUrl} readOnly />
                <button 
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('URL이 클립보드에 복사되었습니다!');
                  }}
                >
                  복사
                </button>
              </div>
              <p className="share-privacy-note">
                <span className="privacy-icon">🔒</span>
                공개 범위: {rocket.visibility === 'public' ? '전체 공개' : 
                           rocket.visibility === 'friends' ? '친구에게만 공개' : '비공개'}
              </p>
            </div>
            
            <div className="share-platforms">
              <h3>소셜 미디어에 공유하기</h3>
              <div className="social-buttons">
                <button className="social-button facebook">
                  <span className="social-icon">f</span>
                  Facebook
                </button>
                <button className="social-button twitter">
                  <span className="social-icon">𝕏</span>
                  Twitter
                </button>
                <button className="social-button instagram">
                  <span className="social-icon">📷</span>
                  Instagram
                </button>
              </div>
            </div>
            
            <div className="share-to-friends">
              <h3>친구에게 직접 공유하기</h3>
              <div className="friends-list">
                <div className="friend-item">
                  <div className="friend-avatar">
                    <img src="https://via.placeholder.com/40" alt="Friend" />
                  </div>
                  <span className="friend-name">시간마법사</span>
                  <button className="send-button">보내기</button>
                </div>
                <div className="friend-item">
                  <div className="friend-avatar">
                    <img src="https://via.placeholder.com/40" alt="Friend" />
                  </div>
                  <span className="friend-name">양자물리학자</span>
                  <button className="send-button">보내기</button>
                </div>
                <div className="friend-item">
                  <div className="friend-avatar">
                    <img src="https://via.placeholder.com/40" alt="Friend" />
                  </div>
                  <span className="friend-name">별자리사냥꾼</span>
                  <button className="send-button">보내기</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rocket-detail-container">
      {/* 상단 헤더 */}
      <div className="rocket-detail-header">
        <button 
          className="back-button"
          onClick={() => navigate('/rockets')}
        >
          <span className="back-icon">←</span> 목록으로
        </button>
        
        <div className="rocket-actions">
          {!editMode ? (
            <>
              <button 
                className="edit-button"
                onClick={() => setEditMode(true)}
              >
                <span className="action-icon">✏️</span> 수정
              </button>
              <button 
                className="share-button"
                onClick={handleShareRocket}
              >
                <span className="action-icon">↗️</span> 공유
              </button>
              <button 
                className="like-button"
                onClick={handleLikeRocket}
              >
                <span className="action-icon">❤️</span> {rocket.likes}
              </button>
            </>
          ) : (
            <>
              <button 
                className="save-button"
                onClick={handleRocketUpdate}
              >
                <span className="action-icon">💾</span> 저장
              </button>
              <button 
                className="cancel-button"
                onClick={() => {
                  setEditMode(false);
                  setEditedRocket(rocket);
                }}
              >
                <span className="action-icon">✖️</span> 취소
              </button>
            </>
          )}
        </div>
      </div>

      {/* 로켓 커버 이미지 및 기본 정보 */}
      <div className="rocket-detail-hero">
        <div className="rocket-cover-image">
          <img src={rocket.coverImage} alt={rocket.title} />
          <div className="rocket-status-badge">
            {rocket.status === 'scheduled' ? '발사 예정' :
             rocket.status === 'launched' ? '발사됨' : 
             rocket.status === 'arrived' ? '도착함' : '임시저장'}
          </div>
        </div>
        
        <div className="rocket-title-section">
          {!editMode ? (
            <h1>{rocket.title}</h1>
          ) : (
            <input
              type="text"
              name="title"
              value={editedRocket.title}
              onChange={handleEditChange}
              className="edit-title"
              placeholder="로켓 제목"
            />
          )}
          
          <div className="rocket-meta">
            <div className="meta-item">
              <span className="meta-icon">👤</span>
              <span>제작자: {rocket.createdBy}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>생성일: {formatDate(rocket.createdAt)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👁️</span>
              <span>조회수: {rocket.views}</span>
            </div>
          </div>
          
          <div className="rocket-tags">
            {!editMode ? (
              rocket.tags.map((tag, index) => (
                <span key={index} className="rocket-tag">#{tag}</span>
              ))
            ) : (
              <input
                type="text"
                name="tags"
                value={editedRocket.tags.join(', ')}
                onChange={handleTagsChange}
                className="edit-tags"
                placeholder="태그 (쉼표로 구분)"
              />
            )}
          </div>
        </div>
      </div>
      
      {/* 로켓 카운트다운 */}
      <div className="rocket-countdown-section">
        <div className="countdown-title">
          {rocket.status === 'scheduled' ? (
            <h2>발사까지 남은 시간</h2>
          ) : rocket.status === 'launched' ? (
            <h2>도착까지 남은 시간</h2>
          ) : (
            <h2>로켓 여행</h2>
          )}
        </div>
        
        <div className="countdown-display">
          {rocket.status === 'scheduled' || rocket.status === 'launched' ? (
            <>
              <div className="countdown-item">
                <div className="countdown-value">{currentCountdown.days}</div>
                <div className="countdown-label">일</div>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <div className="countdown-value">{currentCountdown.hours.toString().padStart(2, '0')}</div>
                <div className="countdown-label">시간</div>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <div className="countdown-value">{currentCountdown.minutes.toString().padStart(2, '0')}</div>
                <div className="countdown-label">분</div>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <div className="countdown-value">{currentCountdown.seconds.toString().padStart(2, '0')}</div>
                <div className="countdown-label">초</div>
              </div>
            </>
          ) : rocket.status === 'arrived' ? (
            <div className="arrival-message">목적지에 도착했습니다!</div>
          ) : (
            <div className="draft-message">발사 준비 중인 로켓입니다.</div>
          )}
        </div>
        
        <div className="schedule-info">
          <div className="schedule-item">
            <span className="schedule-icon">🚀</span>
            <span className="schedule-label">발사일:</span>
            <span className="schedule-value">{formatDate(rocket.launchDate)}</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-icon">🏁</span>
            <span className="schedule-label">도착일:</span>
            <span className="schedule-value">{formatDate(rocket.arrivalDate)}</span>
          </div>
        </div>
      </div>
      
      {/* 탭 네비게이션 */}
      <div className="rocket-tabs">
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          로켓 정보
        </button>
        <button 
          className={`tab ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          여행 경로
        </button>
        <button 
          className={`tab ${activeTab === 'attachments' ? 'active' : ''}`}
          onClick={() => setActiveTab('attachments')}
        >
          첨부파일 ({attachments.length})
        </button>
        <button 
          className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          댓글 ({comments.length})
        </button>
      </div>
      
      {/* 탭 내용 */}
      <div className="tab-content">
        {/* 상세 정보 탭 */}
        {activeTab === 'details' && (
          <div className="rocket-details">
            <div className="rocket-info-section">
              <h2>목적지</h2>
              {!editMode ? (
                <p>{rocket.destination}</p>
              ) : (
                <input
                  type="text"
                  name="destination"
                  value={editedRocket.destination}
                  onChange={handleEditChange}
                  className="edit-input"
                  placeholder="목적지 정보"
                />
              )}
            </div>
            
            <div className="rocket-info-section">
              <h2>상세 설명</h2>
              {!editMode ? (
                <p>{rocket.description}</p>
              ) : (
                <textarea
                  name="description"
                  value={editedRocket.description}
                  onChange={handleEditChange}
                  className="edit-textarea"
                  placeholder="로켓에 대한 상세 설명"
                  rows="6"
                />
              )}
            </div>
            
            <div className="rocket-info-section">
              <h2>공개 범위</h2>
              {!editMode ? (
                <div className="visibility-display">
                  <span className={`visibility-icon ${rocket.visibility}`}>
                    {rocket.visibility === 'public' ? '🌎' : 
                     rocket.visibility === 'friends' ? '👥' : '🔒'}
                  </span>
                  <span>
                    {rocket.visibility === 'public' ? '전체 공개' : 
                     rocket.visibility === 'friends' ? '친구에게만 공개' : '비공개'}
                  </span>
                </div>
              ) : (
                <div className="edit-visibility">
                  <select
                    name="visibility"
                    value={editedRocket.visibility}
                    onChange={handleEditChange}
                    className="edit-select"
                  >
                    <option value="public">전체 공개</option>
                    <option value="friends">친구에게만 공개</option>
                    <option value="private">비공개</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 여행 경로 탭 */}
        {activeTab === 'route' && (
          <div className="rocket-route">
            <div className="route-path">
              {rocket.route.map((point, index) => (
                <div 
                  key={index} 
                  className={`route-point ${
                    index === 0 ? 'start' : 
                    index === rocket.route.length - 1 ? 'end' : ''
                  }`}
                >
                  <div className="route-timeline">
                    <div className="timeline-point"></div>
                    {index < rocket.route.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="route-content">
                    <div className="route-name">{point.name}</div>
                    <div className="route-time">{formatDate(point.time)}</div>
                    <div className="route-coordinates">
                      X: {point.coordinates.x}, Y: {point.coordinates.y}, Z: {point.coordinates.z}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="route-visualization">
              <div className="route-map">
                <div className="map-placeholder">
                  <div className="stars-background"></div>
                  <div className="route-visualization-container">
                    {rocket.route.map((point, index) => (
                      <div 
                        key={index}
                        className="route-point-visual"
                        style={{ 
                          left: `${(point.coordinates.x / 500) * 80}%`, 
                          top: `${(point.coordinates.y / 600) * 80}%`
                        }}
                      >
                        <div className="point-marker"></div>
                        <div className="point-label">{point.name}</div>
                      </div>
                    ))}
                    
                    {/* 경로 연결선 */}
                    <svg className="route-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {rocket.route.map((point, index) => {
                        if (index < rocket.route.length - 1) {
                          const next = rocket.route[index + 1];
                          const x1 = (point.coordinates.x / 500) * 80;
                          const y1 = (point.coordinates.y / 600) * 80;
                          const x2 = (next.coordinates.x / 500) * 80;
                          const y2 = (next.coordinates.y / 600) * 80;
                          
                          return (
                            <line 
                              key={index}
                              x1={`${x1}%`} 
                              y1={`${y1}%`} 
                              x2={`${x2}%`} 
                              y2={`${y2}%`} 
                              className="route-line"
                            />
                          );
                        }
                        return null;
                      })}
                    </svg>
                    
                    {/* 로켓 애니메이션 */}
                    <div className="animated-rocket"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 첨부 파일 탭 */}
        {activeTab === 'attachments' && (
          <div className="rocket-attachments">
            {attachments.length === 0 ? (
              <div className="no-attachments">
                <div className="no-data-icon">📎</div>
                <p>첨부 파일이 없습니다.</p>
              </div>
            ) : (
              <div className="attachments-list">
                {attachments.map(file => (
                  <div key={file.id} className="attachment-item">
                    <div className="attachment-icon">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="attachment-info">
                      <div className="attachment-name">{file.filename}</div>
                      <div className="attachment-meta">
                        <span className="attachment-size">{file.size}</span>
                        <span className="attachment-date">{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                    <div className="attachment-actions">
                      <button className="attachment-action view">
                        <span className="action-icon">👁️</span>
                      </button>
                      <button className="attachment-action download">
                        <span className="action-icon">⬇️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {editMode && (
              <div className="add-attachment-section">
                <button className="add-attachment-button">
                  <span className="button-icon">+</span>
                  첨부 파일 추가
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* 댓글 탭 */}
        {activeTab === 'comments' && (
          <div className="rocket-comments">
            <div className="comments-form">
              <div className="comment-avatar">
                <img src="https://via.placeholder.com/40" alt="User" />
              </div>
              <div className="comment-input-container">
                <textarea
                  placeholder="댓글을 작성해주세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-input"
                  rows="3"
                ></textarea>
                <button 
                  className="submit-comment-button"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  댓글 작성
                </button>
              </div>
            </div>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="no-comments">
                  <div className="no-data-icon">💬</div>
                  <p>첫 댓글을 작성해보세요!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      <img src={comment.authorAvatar} alt={comment.author} />
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <div className="comment-actions">
                        <button 
                          className="like-comment-button"
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <span className="action-icon">❤️</span>
                          <span className="likes-count">{comment.likes}</span>
                        </button>
                        <button className="reply-button">
                          <span className="action-icon">↩️</span>
                          답글
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* 공유 모달 */}
      {renderShareModal()}
    </div>
  );
};

export default RocketDetail;