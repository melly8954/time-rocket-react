import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    // 로컬 스토리지에서 토큰 가져오기
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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // 진열장 아이템 불러오기
  const fetchDisplayItems = useCallback(async () => {
    if (!userId || !isLoggedIn) {
      setLoading(false);
      return;
    }

    try {
      console.log("진열장 데이터 요청 중... userId:", userId);
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/displays`);
      
      console.log("진열장 응답 데이터:", response.data);
      
      if (response.data && response.data.data) {
      // 받아온 데이터를 10개 슬롯에 맞게 배치
      const items = Array(10).fill(null);
      response.data.data.forEach(item => {
        // displayLocation을 1부터 10까지에서 0부터 9까지로 변환
        const position = item.displayLocation !== undefined ? 
                        Math.max(0, Math.min(9, item.displayLocation - 1)) : 
                        0;
        items[position] = item;
      });
        
        setDisplayItems(items);
        setRetryCount(0); // 성공하면 재시도 카운트 초기화
      } else {
        console.log("응답은 성공했지만 데이터가 없습니다.");
        setDisplayItems(Array(10).fill(null));
      }
      setLoading(false);
    } catch (err) {
      console.error('진열장 로딩 중 오류 발생:', err);
      console.error('오류 세부 정보:', err.response || err);
      
      if (err.response?.status === 401) {
        // 인증 오류 시 로그인 페이지로 이동
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        setTimeout(() => navigate('/login'), 3000);
      } else if (err.response?.status === 404) {
        console.log("진열장 데이터가 없습니다 (404)");
        setDisplayItems(Array(10).fill(null));
        setError(null);
      } else if (err.response?.status === 500) {
        // 서버 내부 오류 처리
        setError(`서버 오류가 발생했습니다. 관리자에게 문의하세요. (${retryCount + 1}/3)`);
        if (retryCount < 2) {
          console.log(`${retryCount + 1}번째 재시도 예정...`);
          setIsRetrying(true);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setIsRetrying(false);
          }, 3000);
        }
      } else {
        setError('진열장을 불러오는데 실패했습니다. 다시 시도해주세요.');
      }
      setLoading(false);
    }
  }, [userId, isLoggedIn, navigate, retryCount]);

  // 초기 로드 및 재시도
  useEffect(() => {
    if (!isRetrying) {
      fetchDisplayItems();
    }
  }, [fetchDisplayItems, isRetrying]);
  
  // 로켓 상세 정보 로드
  const fetchRocketDetail = useCallback(async (chestId) => {
    if (!chestId) {
      throw new Error('유효하지 않은 로켓 ID입니다.');
    }
    
    try {
      setRocketDetailLoading(true);
      
      // API 경로 수정: 현재 서버 에러가 발생하고 있어서 안전한 방식으로 접근
      const response = await api.get(`/received-chests/${chestId}`);
      
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
      
      if (err.response?.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      }
      
      setRocketDetailLoading(false);
      throw err;
    }
  }, []);

  // 아이템 클릭 시 상세 정보 모달 표시
  const handleItemClick = useCallback(async (item) => {
    if (!item) return;
    
    // 로켓 ID 결정
    const chestId = item.receivedChestId || item.chestId;
    
    if (!chestId) {
      setError('로켓 ID 정보가 없습니다.');
      return;
    }
    
    try {
      // 상세 정보 로드 시작 - 기본 정보로 먼저 모달 표시
      setSelectedRocket({
        ...item,
        loading: true
      });
      setShowModal(true);
      
      // 상세 정보 API 호출
      const detailData = await fetchRocketDetail(chestId);
      
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
  }, [fetchRocketDetail]);
  
  // 파일 다운로드 처리 (수정된 경로)
const handleFileDownload = useCallback(async (fileId, fileName) => {
  if (!fileId) {
    alert('파일 ID가 유효하지 않습니다.');
    return;
  }
  
  try {
    setError(null);
    // 로딩 표시
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'download-loading';
    loadingMessage.innerHTML = '파일을 다운로드하는 중...';
    document.body.appendChild(loadingMessage);
    
    // 올바른 API 경로로 수정 (/files/{fileId}/download)
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    
    // 응답 처리
    const contentType = response.headers['content-type'];
    
    // JSON 오류인지 확인
    if (contentType && contentType.includes('application/json')) {
      const reader = new FileReader();
      reader.onload = function() {
        try {
          const errorJson = JSON.parse(reader.result);
          console.log("서버 오류 메시지:", errorJson);
          setError(`서버 오류: ${errorJson.message || '알 수 없는 오류'}`);
        } catch (e) {
          setError('서버에서 오류가 반환되었습니다.');
        }
      };
      reader.readAsText(response.data);
      return;
    }
    
    // 파일 다운로드
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `download_${fileId}`;
    document.body.appendChild(link);
    link.click();
    
    // 자원 정리
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log('파일 다운로드 성공:', fileName);
  } catch (err) {
    console.error('파일 다운로드 실패:', err);
    
    if (err.response) {
      console.error('응답 오류:', err.response.status, err.response.data);
      
      // Blob 형태의 오류 응답 처리
      if (err.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const errorText = reader.result;
            console.log("오류 응답 내용:", errorText);
            try {
              const errorJson = JSON.parse(errorText);
              setError(`서버 오류: ${errorJson.message || '알 수 없는 오류'}`);
            } catch (e) {
              setError('서버 오류가 발생했습니다.');
            }
          } catch (e) {
            console.error("오류 내용 읽기 실패:", e);
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError('파일 다운로드에 실패했습니다.');
      }
    } else {
      setError('네트워크 오류로 다운로드에 실패했습니다.');
    }
  } finally {
    // 로딩 표시 제거
    const loadingMessages = document.querySelectorAll('.download-loading');
    loadingMessages.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  }
}, [api, setError]);
  
  // 아이템 드래그 시작
  const handleDragStart = useCallback((e, item, index) => {
    if (!item) return;
    setDraggedItem(item);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    
    try {
      // 드래그 중인 아이템에 효과 추가
      e.currentTarget.classList.add('dragging');
    } catch (err) {
      console.error("드래그 이벤트 처리 오류:", err);
    }
  }, []);

  // 드래그 오버 이벤트 처리
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    return false;
  }, []);
  
  // 드래그 리브 이벤트 처리
  const handleDragLeave = useCallback((e) => {
    e.currentTarget.classList.remove('drag-over');
  }, []);

  // 아이템 위치 이동 처리 - 빈 공간으로도 이동 가능하게 수정
  const handleDrop = useCallback(async (e, targetIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // 드래그한 아이템이 없거나 같은 위치로 드롭한 경우
    if (!draggedItem || draggedIndex === targetIndex) {
      setDraggedItem(null);
      setDraggedIndex(null);
      return;
    }
    
    try {
      // 타겟 위치에 로켓이 있는 경우 - 위치 교환
      if (displayItems[targetIndex]) {
        const sourceChestId = draggedItem.receivedChestId;
        const targetChestId = displayItems[targetIndex].receivedChestId;
        
        if (!sourceChestId || !targetChestId) {
          throw new Error('로켓 ID가 유효하지 않습니다.');
        }
        
        console.log("위치 이동 요청 (교환):", {
          sourceChestId: sourceChestId,
          targetChestId: targetChestId
        });
        
        // 위치 변경 API 호출
        await api.patch(`/displays/location`, {
          sourceChestId: sourceChestId,
          targetChestId: targetChestId
        });
        
        // 성공 시 로컬 상태 업데이트 (위치 교환)
        const newItems = [...displayItems];
        const temp = {...newItems[draggedIndex]};
        newItems[draggedIndex] = {...newItems[targetIndex]};
        newItems[targetIndex] = temp;
        setDisplayItems(newItems);
      } 
      // 타겟 위치가 빈 공간인 경우 - 직접 이동
      else {
        const sourceChestId = draggedItem.receivedChestId;
        
        if (!sourceChestId) {
          throw new Error('로켓 ID가 유효하지 않습니다.');
        }
        
        console.log("위치 이동 요청 (빈 슬롯으로):", {
          sourceChestId: sourceChestId,
          targetLocation: targetIndex + 1
        });
        
        // 빈 슬롯으로 이동하는 API 호출 (백엔드 API가 있다고 가정)
        await api.patch(`/displays/${sourceChestId}/move-to-empty`, {
          targetLocation: targetIndex
        });
        
        // 성공 시 로컬 상태 업데이트 (단순 이동)
        const newItems = [...displayItems];
        newItems[targetIndex] = {...draggedItem, displayLocation: targetIndex};
        newItems[draggedIndex] = null;
        setDisplayItems(newItems);
      }
      
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
      
      if (err.response?.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 404) {
        setError('로켓을 찾을 수 없습니다.');
      } else if (err.response?.status === 400) {
        setError('잘못된 요청입니다. 다시 시도해주세요.');
      } else {
        // 백엔드 API 미구현 또는 에러 발생 시 프론트에서만 처리
        // 실제 운영에서는 백엔드 API 연동 필요
        if (!displayItems[targetIndex]) {
          const newItems = [...displayItems];
          newItems[targetIndex] = {...draggedItem, displayLocation: targetIndex};
          newItems[draggedIndex] = null;
          setDisplayItems(newItems);
          setError('서버 연동 없이 프론트에서만 이동되었습니다. 새로고침 시 복원됩니다.');
          setTimeout(() => setError(null), 3000);
        } else {
          setError('아이템 위치 변경에 실패했습니다. 서버 연결을 확인해주세요.');
        }
      }
    } finally {
      // 드래그 상태 초기화
      setDraggedItem(null);
      setDraggedIndex(null);
    }
  }, [draggedItem, draggedIndex, displayItems]);

  // 드래그 종료
  const handleDragEnd = useCallback((e) => {
    try {
      // 드래그 관련 스타일 초기화
      e.currentTarget.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
      });
    } catch (err) {
      console.error("드래그 종료 처리 오류:", err);
    }
  }, []);

  // 로켓 디자인 이미지 가져오기
  const getRocketDesignImage = useCallback((design) => {
    if (!design) return '/src/assets/rocket.png';
    
    // 디자인 URL이 있는 경우 그대로 반환
    if (design.startsWith('http')) return design;

    // src/assets/ 경로가 포함된 경우 그대로 사용
    if (design.includes('/src/assets/')) return design;
    
    // 로컬 이미지 반환
    try {
      switch(design) {
        case '/src/assets/rocket_design1.svg':
          return '/src/assets/rocket_design1.svg';
        case '/src/assets/rocket_design2.svg':
          return '/src/assets/rocket_design2.svg';
        case '/src/assets/rocket_design3.svg':
          return '/src/assets/rocket_design3.svg';
          case '/src/assets/rocket_design4.svg':
          return '/src/assets/rocket_design4.svg';
        default:
          return design; // 디자인 경로 그대로 사용
      }
    } catch (err) {
      console.error("이미지 경로 오류:", err);
      return '/src/assets/rocket_design1.svg'; // 기본 이미지 반환
    }
  }, []);
  
  // 날짜 형식 변환
  const formatDate = useCallback((dateString) => {
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
  }, []);

  // 수동 새로고침 처리
  const handleRefresh = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchDisplayItems();
  }, [fetchDisplayItems]);

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
          <button onClick={handleRefresh}>다시 시도</button>
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
          <p>로켓을 <span className="highlight">드래그하여</span> 다른 위치나 빈 공간으로 이동할 수 있습니다.</p>
          <p>로켓을 <span className="highlight">클릭하면</span> 자세한 정보를 볼 수 있습니다.</p>
          <p>보관함에서 <span className="highlight">오른쪽 클릭하여</span> 로켓을 진열장으로 보낼 수 있습니다.</p>
          <p className="refresh-note">보관함에서 진열장에 추가한 로켓은 새로고침 후 나타납니다.</p>
        </div>
        <button className="refresh-btn" onClick={handleRefresh}>
          진열장 새로고침
        </button>
      </div>

      {/* 로켓 상세 정보 모달 */}
      {showModal && selectedRocket && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="rocket-detail-modal space-theme" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>{selectedRocket.rocketName || '이름 없는 로켓'}</h2>
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
                    <p>로켓 정보를 불러오는 중...</p>
                  </div>
                ) : selectedRocket.loadError ? (
                  <div className="error-state">
                    <p>상세 정보를 불러오는데 실패했습니다.</p>
                    <button onClick={() => handleItemClick(selectedRocket)}>다시 시도</button>
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
                        <h3>첨부 파일 ({selectedRocket.rocketFiles.length})</h3>
                        <div className="file-list">
                          {selectedRocket.rocketFiles.map((file, idx) => (
                            <div key={idx} className="file-item">
                              <div className="file-name">{file.originalName || `파일 ${idx + 1}`}</div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Display;
