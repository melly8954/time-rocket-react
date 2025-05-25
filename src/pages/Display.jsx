import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import '/src/style/Display.css';

// API 인스턴스 생성 (기본 설정)
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // 쿠키 전송 활성화 (필요시)
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기 (useAuthStore가 아닌 localStorage 직접 사용)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Display = () => {
  const { userId, isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const [displayItems, setDisplayItems] = useState(Array(10).fill(null));
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [rocketDetailLoading, setRocketDetailLoading] = useState(false);
  
  // 빈 슬롯 상태 관리 - 진열장에 추가할 때 사용
  const [emptySlotIndex, setEmptySlotIndex] = useState(null);
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  // 진열장 아이템 불러오기
  useEffect(() => {
    if (!userId || !isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchDisplayItems = async () => {
      try {
        console.log("진열장 데이터 요청 중... userId:", userId);
        setLoading(true);
        
        // 수정된 API 인스턴스 사용
        const response = await api.get(`/displays/users/${userId}`);
        
        console.log("진열장 응답 데이터:", response.data);
        
        if (response.data && response.data.data) {
          // 받아온 데이터를 10개 슬롯에 맞게 배치
          const items = Array(10).fill(null);
          response.data.data.forEach(item => {
            // displayLocation을 0부터 9까지로 제한
            const position = item.displayLocation !== undefined && 
                            item.displayLocation >= 0 && 
                            item.displayLocation < 10
                            ? item.displayLocation 
                            : 0;
            items[position] = item;
          });
          
          setDisplayItems(items);
        }
        setLoading(false);
      } catch (err) {
        console.error('진열장 로딩 중 오류 발생:', err);
        console.error('오류 세부 정보:', err.response || err);
        
        if (err.response && err.response.status === 401) {
          // 인증 오류 시 로그인 페이지로 이동
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
          setTimeout(() => navigate('/login'), 3000);
        } else if (err.response && err.response.status === 404) {
          setDisplayItems(Array(10).fill(null)); // 404인 경우 빈 배열 설정
        } else {
          setError('진열장을 불러오는데 실패했습니다.');
        }
        setLoading(false);
      }
    };

    fetchDisplayItems();
  }, [userId, isLoggedIn, navigate]);
  
  // 로켓 상세 정보 로드
  const fetchRocketDetail = async (chestId) => {
    try {
      setRocketDetailLoading(true);
      const response = await api.get(`/displays/users/${userId}/details/${chestId}`);
      
      console.log("로켓 상세 정보:", response.data);
      
      // 응답 구조 확인
      if (!response.data || !response.data.data) {
        throw new Error('데이터 형식이 올바르지 않습니다.');
      }
      
      const detailData = response.data.data;
      
      // API 응답의 키 이름 확인 및 처리
      const files = detailData.rocketFiles || detailData.files || [];
      
      setRocketDetailLoading(false);
      
      return {
        ...detailData,
        rocketFiles: files,
        content: detailData.content || detailData.message || ''
      };
    } catch (err) {
      console.error('로켓 상세 정보 조회 실패:', err);
      console.error('오류 세부 정보:', err.response || err);
      
      if (err.response && err.response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      setRocketDetailLoading(false);
      throw err;
    }
  };

  // 아이템 클릭 시 상세 정보 모달 표시
  const handleItemClick = async (item) => {
    if (!item) return;
    
    try {
      // 상세 정보 로드 시작 - 기본 정보로 먼저 모달 표시
      setSelectedRocket({
        ...item,
        loading: true
      });
      setShowModal(true);
      
      // 상세 정보 API 호출
      const detailData = await fetchRocketDetail(item.chestId);
      
      // 데이터 로드 완료 후 상태 업데이트
      setSelectedRocket(prev => ({
        ...prev,
        ...detailData,
        loading: false
      }));
    } catch (err) {
      console.error("상세 정보 로드 실패:", err);
      setError('로켓 상세 정보를 불러오는데 실패했습니다.');
      // 모달은 열린 상태 유지하되 로딩 상태 해제
      setSelectedRocket(prev => ({
        ...prev,
        loading: false,
        loadError: true
      }));
    }
  };
  
  // 파일 다운로드 처리
  const handleFileDownload = (fileId, fileName) => {
    // 새 탭에서 다운로드 API 호출
    window.open(`/api/files/download/${fileId}`, '_blank');
  };
  
  // 아이템 드래그 시작
  const handleDragStart = (e, item, index) => {
    if (!item) return;
    setDraggedItem(item);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    
    try {
      // 드래그 중인 아이템 미리보기 스타일링
      const dragPreview = document.createElement('div');
      dragPreview.className = 'rocket-drag-preview';
      dragPreview.textContent = item.rocketName;
      document.body.appendChild(dragPreview);
      
      // 드래그 이미지 설정 (투명 이미지 사용)
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      e.dataTransfer.setDragImage(img, 0, 0);
      
      // 드래그 중인 아이템에 효과 추가
      e.currentTarget.classList.add('dragging');
    } catch (err) {
      console.error("드래그 이벤트 처리 오류:", err);
    }
  };

  // 드래그 오버 이벤트 처리
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    return false;
  };
  
  // 드래그 리브 이벤트 처리
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  // 아이템 위치 이동 처리
  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // 드래그한 아이템이 없거나 같은 위치로 드롭한 경우
    if (!draggedItem || draggedIndex === targetIndex) {
      setDraggedItem(null);
      setDraggedIndex(null);
      return;
    }
    
    // 타겟 슬롯에 아이템이 없는 경우
    if (!displayItems[targetIndex]) {
      alert("드롭할 위치에는 로켓이 있어야 합니다. 빈 공간에는 드롭할 수 없습니다.");
      setDraggedItem(null);
      setDraggedIndex(null);
      return;
    }
    
    try {
      console.log("위치 이동 요청:", {
        sourceChestId: draggedItem.chestId,
        targetChestId: displayItems[targetIndex].chestId
      });
      
      // 위치 변경 API 호출
      await api.patch(`/displays/location`, {
        sourceChestId: draggedItem.chestId,
        targetChestId: displayItems[targetIndex].chestId
      });
      
      // 성공 시 로컬 상태 업데이트 (위치 교환)
      const newItems = [...displayItems];
      const temp = {...newItems[draggedIndex]};
      newItems[draggedIndex] = {...newItems[targetIndex]};
      newItems[targetIndex] = temp;
      setDisplayItems(newItems);
      
      // 성공 알림 효과
      const targetElement = document.getElementById(`display-slot-${targetIndex}`);
      if (targetElement) {
        const glowElement = document.createElement('div');
        glowElement.className = 'success-glow';
        targetElement.appendChild(glowElement);
        setTimeout(() => {
          if (glowElement.parentNode === targetElement) {
            glowElement.remove();
          }
        }, 1000);
      }
      
    } catch (err) {
      console.error('아이템 이동 오류:', err);
      console.error('오류 세부 정보:', err.response || err);
      
      if (err.response && err.response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError('아이템 위치 변경에 실패했습니다. 서버 연결을 확인해주세요.');
      }
    } finally {
      // 드래그 상태 초기화
      setDraggedItem(null);
      setDraggedIndex(null);
    }
  };

  // 드래그 종료
  const handleDragEnd = (e) => {
    try {
      // 드래그 관련 스타일 초기화
      e.currentTarget.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });
      
      // 미리보기 요소 제거
      const preview = document.querySelector('.rocket-drag-preview');
      if (preview) preview.remove();
    } catch (err) {
      console.error("드래그 종료 처리 오류:", err);
    }
  };

  // 로켓 디자인 이미지 가져오기
  const getRocketDesignImage = (design) => {
    if (!design) return '/src/assets/rocket.png';
    
    // 디자인 URL이 있는 경우 그대로 반환
    if (design.startsWith('http')) return design;

    // src/assets/ 경로가 포함된 경우 그대로 사용
    if (design.includes('/src/assets/')) return design;
    
    // 로컬 이미지 반환
    try {
      switch(design) {
        case 'A':
          return '/src/assets/디자인 A.jpg';
        case 'B':
          return '/src/assets/디자인 B.jpg';
        case 'C':
          return '/src/assets/디자인 C.jpg';
        default:
          return design; // 디자인 경로 그대로 사용
      }
    } catch (err) {
      console.error("이미지 경로 오류:", err);
      return '/src/assets/rocket.png'; // 기본 이미지 반환
    }
  };
  
  // 날짜 형식 변환
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '날짜 형식 오류';
      }
      
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('날짜 포맷 오류:', error);
      return '날짜 형식 오류';
    }
  };

  // 로그인 상태 체크 및 UI 표시
  if (!isLoggedIn) {
    return (
      <div className="space-container not-logged">
        <div className="login-message">
          <h2>로그인이 필요합니다</h2>
          <p>로켓 진열장을 방문하시려면 로그인해주세요</p>
          <button className="space-btn" onClick={() => navigate('/login')}>로그인하기</button>
        </div>
      </div>
    );
  }

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="space-container">
        <div className="space-loading">
          <div className="space-loading-icon"></div>
          <p>우주 공간으로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-container">
      <div className="space-header">
        <h1>우주 로켓 컬렉션</h1>
        <p>당신의 멋진 로켓을 자랑해보세요!</p>
      </div>
      
      {error && (
        <div className="space-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>닫기</button>
        </div>
      )}
      
      <div className="space-interior">
        <div className="galaxy-background">
          <div className="stars"></div>
          <div className="twinkling"></div>
          <div className="clouds"></div>
        </div>
        <div className="display-orbit">
          {displayItems.map((item, index) => (
            <div 
              id={`display-slot-${index}`}
              key={index}
              className={`display-platform ${item ? 'filled' : 'empty'} ${draggedIndex === index ? 'dragging' : ''}`}
              draggable={!!item}
              onDragStart={(e) => handleDragStart(e, item, index)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => item && handleItemClick(item)}
            >
              {item ? (
                <div className="display-item">
                  <div className="item-glow"></div>
                  <div className="item-image" style={{ backgroundImage: `url(${getRocketDesignImage(item.designUrl)})` }}>
                  </div>
                  <div className="item-nameplate">
                    <span>{item.rocketName}</span>
                  </div>
                </div>
              ) : (
                <div className="empty-platform">
                  <span>빈 우주 공간</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-guide">
        <div className="guide-content">
          <h3>우주 진열장 안내</h3>
          <p>로켓을 <span className="highlight">드래그하여</span> 다른 궤도로 이동할 수 있습니다.</p>
          <p>로켓을 <span className="highlight">클릭하면</span> 자세한 정보를 볼 수 있습니다.</p>
          <p>보관함에서 <span className="highlight">오른쪽 클릭하여</span> 로켓을 진열장으로 보낼 수 있습니다.</p>
        </div>
      </div>

      {/* 로켓 상세 정보 모달 */}
      {showModal && selectedRocket && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="rocket-detail-modal space-theme" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>{selectedRocket.rocketName}</h2>
            </div>
            
            <div className="modal-content">
              <div className="rocket-showcase">
                <img 
                  src={getRocketDesignImage(selectedRocket.designUrl)} 
                  alt={selectedRocket.rocketName} 
                  onError={(e) => {e.target.src = '/src/assets/rocket.png'}}
                />
                <div className="rocket-glow"></div>
              </div>
              
              <div className="rocket-info">
                <div className="info-row">
                  <div className="info-label">보낸 사람</div>
                  <div className="info-value">{selectedRocket.senderEmail || '알 수 없음'}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">전송 시간</div>
                  <div className="info-value">{formatDate(selectedRocket.sentAt)}</div>
                </div>
                
                {rocketDetailLoading || selectedRocket.loading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>로켓 정보 불러오는 중...</p>
                  </div>
                ) : selectedRocket.loadError ? (
                  <div className="error-state">
                    <p>상세 정보를 불러오는데 실패했습니다.</p>
                    <button onClick={() => handleItemClick(selectedRocket)}>다시 시도</button>
                  </div>
                ) : (
                  <>
                    {selectedRocket.isLocked ? (
                      <div className="locked-content">
                        <div className="lock-icon"></div>
                        <p>이 로켓은 아직 잠금 상태입니다.</p>
                        <p className="unlock-date">잠금 해제일: {formatDate(selectedRocket.lockExpiredAt)}</p>
                      </div>
                    ) : (
                      <>
                        <div className="message-section">
                          <h3>메시지</h3>
                          <div className="message-content">
                            {selectedRocket.content || '내용이 없습니다.'}
                          </div>
                        </div>
                        
                        {selectedRocket.rocketFiles && selectedRocket.rocketFiles.length > 0 && (
                          <div className="attachments-section">
                            <h3>첨부 파일</h3>
                            <div className="file-list">
                              {selectedRocket.rocketFiles.map((file, idx) => (
                                <div key={idx} className="file-item">
                                  <div className="file-name">{file.originalName}</div>
                                  <button 
                                    className="download-btn"
                                    onClick={() => handleFileDownload(file.fileId, file.originalName)}
                                  >
                                    다운로드
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Display;
