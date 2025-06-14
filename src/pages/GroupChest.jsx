import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import '../style/GroupChest.module.css';
import { AlertModal, ConfirmModal } from '../components/common/Modal';
import { LockIcon, UserIcon, SearchIcon, CloseIcon, GroupIcon } from '../components/ui/Icons';

// API 경로 상수화
const API_PATHS = {
  GROUP_CHESTS: '/group-chests'
};

// 유틸리티 함수
const formatDate = dateString => {
  if (!dateString) return '정보 없음';
  try {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch (err) {
    return '날짜 형식 오류';
  }
};

const calculateCountdown = (expireDate) => {
  if (!expireDate) return '00 : 00 : 00 : 00';
  
  const now = new Date();
  const targetDate = new Date(expireDate);
  const diff = targetDate - now;
  
  if (diff <= 0) return '00 : 00 : 00 : 00';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return [
    days.toString().padStart(2, '0'),
    hours.toString().padStart(2, '0'), 
    minutes.toString().padStart(2, '0'), 
    seconds.toString().padStart(2, '0')
  ].join(' : ');
};

// 디자인 이미지 처리 헬퍼
const getDesignImage = (design) => {
  if (!design) return '/src/assets/rocket.png';
  if (design.startsWith('http') || design.includes('/src/assets/')) return design;
  return '/src/assets/rocket.png';
};

// 그룹 로켓 아이템 컴포넌트
const GroupRocketItem = ({ groupRocket, onClick, isSelected, isDeleteMode, timerTick }) => {
  const [timeDisplay, setTimeDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeStatus, setTimeStatus] = useState('');

  useEffect(() => {
    if (!groupRocket || !groupRocket.rocketName) {
      return;
    }

    const updateTime = () => {
      // 잠금 상태 확인 (1: 잠금, 0: 해제)
      const lockStatus = groupRocket.isLock;
      
      // 잠금해제된 상태 (0 또는 false)
      if (lockStatus === 0 || lockStatus === false) {
        setIsUnlocked(true);
        setTimeDisplay('오픈 완료');
        if (groupRocket.publicAt) {
          const publicDate = new Date(groupRocket.publicAt).toLocaleString('ko-KR', {
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit'
          });
          setTimeStatus(`${publicDate}에 공개됨`);
        } else {
          setTimeStatus('');
        }
        return;
      }
      
      const expireTime = groupRocket.lockExpiredAt;
      if (!expireTime) {
        setIsUnlocked(false);
        setTimeDisplay('시간 정보 없음');
        setTimeStatus('');
        return;
      }
      
      const now = new Date();
      const targetDate = new Date(expireTime);
      const diff = targetDate - now;
      
      if (diff > 0) {
        // 아직 시간이 남은 경우
        setIsUnlocked(false);
        setTimeDisplay(calculateCountdown(expireTime));
        const expiredDate = targetDate.toLocaleString('ko-KR', {
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit'
        });
        setTimeStatus(`${expiredDate}까지`);
      } else {
        // 시간이 만료된 경우 - 하지만 여전히 잠금 상태(isLock === 1)
        setIsUnlocked(false);
        setTimeDisplay('오픈 가능');
        const expiredSince = targetDate.toLocaleString('ko-KR', {
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit'
        });
        setTimeStatus(`${expiredSince}부터 오픈 가능`);
      }
    };

    updateTime();
  }, [groupRocket?.rocketName, groupRocket?.isLock, groupRocket?.lockExpiredAt, groupRocket?.publicAt, timerTick]);

  if (!groupRocket || !groupRocket.rocketName) {
    return null;
  }

  return (
    <div 
      className={`group-rocket-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`} 
      onClick={() => onClick(groupRocket)}
    >
      <div className="rocket-image">
        <img 
          src={getDesignImage(groupRocket.designUrl)} 
          alt={groupRocket.rocketName} 
          onError={(e) => { e.target.src = '/src/assets/rocket.png'; }} 
        />
        {groupRocket.isPublic && <div className="public-badge">공개</div>}
        <div className="group-badge">
          <GroupIcon /> 모임
        </div>
        {isDeleteMode && <div className="delete-checkbox">{isSelected ? '✓' : ''}</div>}
      </div>
      <div className="rocket-details">
        <h3 className="rocket-name">{groupRocket.rocketName || '이름 없음'}</h3>
        <div className="group-info">
          <GroupIcon /> {groupRocket.groupName || '모임 정보 없음'}
        </div>
        <div className={`rocket-time ${isUnlocked ? 'unlocked' : 'locked-time'}`}>
          {isUnlocked ? (
            <div className="unlocked-container">
              <span className="unlocked-text">{timeDisplay}</span>
              {timeStatus && <span className="unlock-date-hint">{timeStatus}</span>}
            </div>
          ) : (
            <div className="countdown-container">
              <div className="time-status">
                <LockIcon style={{color: '#ff5722', marginRight: '4px'}} />
                <span style={{color: '#ff9800', fontWeight: 'bold'}}>{timeDisplay}</span>
              </div>
              {timeStatus && (
                <div className="unlock-date-hint">
                  {timeStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 모달 컨텐츠 컴포넌트
const GroupRocketModalContent = ({ 
  selectedRocket, 
  handleUnlockGroupRocket,
  deleteSingleRocket,
  renderFiles,
  renderContents
}) => {
  if (selectedRocket.loading) {
    return (
      <div className="loading-content">
        <div className="loading-spinner-sm"></div>
        <p>로켓 내용을 불러오는 중...</p>
      </div>
    );
  }
  
  // 잠금 상태 확인 (1: 잠금, 0: 해제)
  const lockStatus = selectedRocket.isLock;
  const isLocked = lockStatus === 1 || lockStatus === true;
  
  // 모임 로켓이 잠금 해제된 경우
  if (!isLocked) {
    return (
      <>
        <div className="group-rocket-contents">
          <h3>모임원들의 메시지</h3>
          {renderContents()}
        </div>
        {renderFiles()}
        <div className="rocket-actions">
          <button 
            className="delete-button" 
            onClick={() => deleteSingleRocket(selectedRocket.groupChestId)}
          >
            로켓 삭제
          </button>
        </div>
      </>
    );
  }
  
  // 시간 만료 여부 확인
  const now = new Date();
  const targetDate = new Date(selectedRocket.lockExpiredAt);
  const timeExpired = !selectedRocket.lockExpiredAt || targetDate <= now;
  
  // 시간 만료됨 - 수동 잠금 해제 버튼 표시
  if (timeExpired) {
    return (
      <div className="rocket-locked rocket-unlockable">
        <div className="lock-icon"></div>
        <p>모임 로켓 잠금 해제가 가능합니다.</p>
        <button 
          className="unlock-button" 
          onClick={() => handleUnlockGroupRocket(selectedRocket.groupChestId)}
        >
          🔓 모임 로켓 열기
        </button>
      </div>
    );
  }
  
  // 아직 시간 남음 - 카운트다운 표시
  return (
    <div className="rocket-locked">
      <div className="lock-icon"></div>
      <p>이 모임 로켓은 현재 잠겨 있습니다.</p>
      <p className="countdown">남은 시간: {calculateCountdown(selectedRocket.lockExpiredAt)}</p>
      <p className="waiting-message">잠금 해제 시간이 되면 버튼이 나타납니다.</p>
    </div>
  );
};

// 메인 컴포넌트
const GroupChest = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const isFetchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  
  // 상태 관리
  const [groupRockets, setGroupRockets] = useState([]);
  const [totalRockets, setTotalRockets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [rocketsToDelete, setRocketsToDelete] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [timerTick, setTimerTick] = useState(0);
  
  // 모달 상태
  const [alertModal, setAlertModal] = useState({ 
    isOpen: false, 
    message: '', 
    type: 'default',
    title: '알림'
  });

  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    message: '', 
    onConfirm: null 
  });

  const showAlert = (message, type = 'default', title = '알림') => {
    setAlertModal({ 
      isOpen: true, 
      message, 
      type,
      title 
    });
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmModal({ 
      isOpen: true, 
      message, 
      onConfirm 
    });
  };

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  const closeConfirm = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };
  
  // 인증 확인 및 타이머 설정
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
    const timer = setInterval(() => setTimerTick(tick => tick + 1), 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, navigate]);

  // 데이터 로드
  useEffect(() => {
    if (!userId) return;
    fetchGroupRockets();
  }, [userId, currentPage, sortOrder]);

  // 실시간 검색 기능
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    
    if (searchTerm.trim() === '') {
      if (isSearchMode) {
        setIsSearchMode(false);
        fetchGroupRockets();
      }
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchMode(true);
      setCurrentPage(1);
      fetchGroupRockets();
    }, 500);
    
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  // 모임 로켓 데이터 조회
  const fetchGroupRockets = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;
    setIsLoading(true);

    try {
      const params = {
        page: currentPage, // 1-based 페이징
        size: 10,
        sort: 'groupChestId',
        order: sortOrder
      };
      
      if (searchTerm.trim()) {
        params['group-rocket-name'] = searchTerm.trim();
      }

      const response = await api.get(API_PATHS.GROUP_CHESTS, { params });
      
      if (isFetchingRef.current !== currentFetchId) return;
      
      if (response.data?.data) {
        const responseData = response.data.data;
        const rocketsList = responseData.groupChests || [];
        
        setGroupRockets(rocketsList);
        setTotalPages(responseData.totalPages || 0);
        setTotalRockets(responseData.totalElements || 0);
        setError(null);
      } else {
        setGroupRockets([]);
        setTotalPages(0);
        setTotalRockets(0);
        setError(null);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      
      console.error('모임 로켓 데이터 로드 실패:', err);
      
      setGroupRockets([]);
      setTotalPages(0);
      setTotalRockets(0);
      
      if (err.response?.status !== 404) {
        setError('모임 로켓 데이터를 불러오는데 실패했습니다.');
      } else {
        setError(null);
      }
    } finally {
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [currentPage, searchTerm, sortOrder, userId]);

  // 모임 로켓 상세 정보 조회
  const fetchGroupRocketDetail = useCallback(async (groupRocket) => {
    const detailId = groupRocket.groupChestId;
    
    if (!detailId) {
      console.error('그룹 체스트 ID가 없음:', groupRocket);
      throw new Error('로켓 세부 정보를 가져올 수 없습니다.');
    }
    
    try {
      const response = await api.get(`${API_PATHS.GROUP_CHESTS}/${detailId}`);
      
      if (!response.data?.data) throw new Error('데이터 형식이 올바르지 않습니다.');
      
      const detailData = response.data.data;
      
      return {
        ...detailData,
        contents: detailData.contents || [],
        rocketFiles: detailData.rocketFiles || [],
        groupName: detailData.groupName || groupRocket.groupName || '',
        isLock: detailData.isLock
      };
    } catch (err) {
      console.error('모임 로켓 상세 정보 조회 실패:', err);
      throw err;
    }
  }, []);

  // 모임 로켓 잠금 해제
  const handleUnlockGroupRocket = useCallback(async (groupChestId) => {
  if (!groupChestId) return;
  
  try {
    console.log('모임 로켓 잠금해제 시도:', groupChestId);
    
    // selectedRocket에서 groupId 정보 추출
    const groupId = selectedRocket?.groupId;
    
    if (!groupId) {
      // groupId가 없다면 selectedRocket의 다른 필드에서 찾기
      console.log('selectedRocket 데이터:', selectedRocket);
      throw new Error('그룹 ID를 찾을 수 없습니다. 데이터를 확인해주세요.');
    }
    
    // 올바른 API 엔드포인트: /api/groups/{groupId}/rockets/{groupRocketId}/unlock
    const response = await api.patch(`/groups/${groupId}/rockets/${groupChestId}/unlock`);
    
    console.log('잠금해제 응답:', response);
    
    setSelectedRocket(prev => prev ? { ...prev, isLock: 0 } : null);
    setGroupRockets(prev => prev.map(r => r.groupChestId === groupChestId ? { ...r, isLock: 0 } : r));
    fetchGroupRockets();
    showAlert('모임 로켓이 성공적으로 잠금 해제되었습니다.', 'success');
  } catch (err) {
    console.error('모임 로켓 잠금 해제 실패:', err);
    console.error('에러 상세:', err.response?.data);
    
    const errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        `서버 오류 (${err.response?.status}): 모임 로켓 잠금 해제에 실패했습니다.`;
    showAlert(errorMessage, 'danger');
  }
}, [fetchGroupRockets, selectedRocket]);

  // 단일 로켓 삭제
  const deleteSingleRocket = useCallback(async (rocketId) => {
    if (!rocketId) return;
    
    showConfirm(
      '해당 모임 로켓을 삭제하시겠습니까?',
      async () => {
        try {
          await api.patch(`${API_PATHS.GROUP_CHESTS}/${rocketId}/deleted-flag`);
          setIsModalOpen(false);
          fetchGroupRockets();
          showAlert('모임 로켓이 성공적으로 삭제되었습니다.', 'success');
        } catch (err) {
          console.error('모임 로켓 삭제 실패:', err);
          showAlert(err?.response?.data?.message || '모임 로켓 삭제 중 오류가 발생했습니다.', 'danger');
        }
      }
    );
  }, [fetchGroupRockets]);

  // 선택된 로켓들 삭제
  const deleteSelectedRockets = useCallback(async () => {
    if (rocketsToDelete.length === 0) return;
    
    showConfirm(
      `선택한 ${rocketsToDelete.length}개의 모임 로켓을 삭제하시겠습니까?`,
      async () => {
        try {
          const deletePromises = rocketsToDelete.map(rocketId => 
            api.patch(`${API_PATHS.GROUP_CHESTS}/${rocketId}/deleted-flag`)
          );
          
          await Promise.all(deletePromises);
          fetchGroupRockets();
          setRocketsToDelete([]);
          setIsDeleteMode(false);
          showAlert('선택한 모임 로켓이 성공적으로 삭제되었습니다.', 'success');
        } catch (err) {
          console.error('다중 모임 로켓 삭제 실패:', err);
          showAlert(err?.response?.data?.message || '모임 로켓 삭제 중 오류가 발생했습니다.', 'danger');
        }
      }
    );
  }, [rocketsToDelete, fetchGroupRockets]);

  // 모임 로켓 클릭 핸들러
  const handleGroupRocketClick = useCallback(async (groupRocket) => {
    const detailId = groupRocket.groupChestId;
    if (!detailId) return;
    
    if (isDeleteMode) {
      setRocketsToDelete(prev => 
        prev.includes(detailId) ? prev.filter(id => id !== detailId) : [...prev, detailId]
      );
      return;
    }
    
    try {
      setSelectedRocket({ ...groupRocket, loading: true });
      setIsModalOpen(true);
      
      const detailData = await fetchGroupRocketDetail(groupRocket);
      setSelectedRocket({ 
        ...groupRocket, 
        ...detailData, 
        loading: false 
      });
    } catch (err) {
      console.error('모임 로켓 상세 정보 로드 실패:', err);
      setSelectedRocket(prev => ({ ...prev, loading: false, loadError: true }));
      showAlert("모임 로켓 정보를 가져오는데 실패했습니다.", 'danger');
    }
  }, [fetchGroupRocketDetail, isDeleteMode]);

  // 파일 목록 렌더링
  const renderFiles = useCallback(() => {
    const filesList = selectedRocket?.rocketFiles || [];
    return filesList.length > 0 ? (
      <div className="rocket-attachments">
        <h3>첨부 파일 ({filesList.length}개)</h3>
        <ul className="files-list">
          {filesList.map((file, index) => (
            <li key={index} className="file-item">
              <span className="file-name">{file.originalName || file.name || `파일 ${index + 1}`}</span>
              <button className="download-button" onClick={() => window.open(`/api/files/${file.fileId || file.id}/download`, '_blank')}>
                다운로드
              </button>
            </li>
          ))}
        </ul>
      </div>
    ) : <p className="no-attachments">첨부 파일이 없습니다.</p>;
  }, [selectedRocket]);

  // 컨텐츠 목록 렌더링
  const renderContents = useCallback(() => {
    const contentsList = selectedRocket?.contents || [];
    return contentsList.length > 0 ? (
      <div className="group-contents-list">
        {contentsList.map((content, index) => (
          <div key={index} className="group-content-item">
            <div className="content-header">
              <UserIcon />
              <span className="author-name">{content.authorName || `참여자 ${index + 1}`}</span>
            </div>
            <div className="content-message">
              {content.content || '내용이 없습니다.'}
            </div>
          </div>
        ))}
      </div>
    ) : <p className="no-contents">작성된 내용이 없습니다.</p>;
  }, [selectedRocket]);
  
  // 오류 화면
  if (error) {
    return (
      <div className="group-chest-error">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="group-chest-container">
      {/* 헤더 영역 */}
      <div className="group-chest-header">
        <h1>모임 로켓 보관함</h1>
        <p className="description">함께 만든 추억이 담긴 모임 로켓들을 확인해보세요</p>
      </div>

      {/* 검색 및 컨트롤 */}
      <div className="group-chest-controls">
        <div className="search-bar">
          <form onSubmit={(e) => { e.preventDefault(); setIsSearchMode(true); setCurrentPage(1); fetchGroupRockets(); }}>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="모임 로켓 이름으로 검색..."
            />
            <button type="submit" className="search-button"><SearchIcon /></button>
            {isSearchMode && searchTerm && (
              <button type="button" className="clear-search" onClick={() => {
                setSearchTerm('');
                setIsSearchMode(false);
                setCurrentPage(1);
                fetchGroupRockets();
              }}>
                <CloseIcon />
              </button>
            )}
          </form>
        </div>

        <div className="control-buttons">
          <div className="sort-controls">
            <label>정렬:</label>
            <select 
              value={sortOrder} 
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="desc">최신 순</option>
              <option value="asc">오래된 순</option>
            </select>
          </div>

          {isDeleteMode ? (
            <>
              <button 
                className={`control-button delete ${rocketsToDelete.length > 0 ? 'active' : ''}`}
                onClick={deleteSelectedRockets} 
                disabled={rocketsToDelete.length === 0}
              >
                삭제하기
              </button>
              <button 
                className="control-button cancel" 
                onClick={() => { 
                  setIsDeleteMode(false); 
                  setRocketsToDelete([]);
                }}
              >
                취소
              </button>
            </>
          ) : (
            <button 
              className="control-button delete" 
              onClick={() => { 
                setIsDeleteMode(true); 
                setRocketsToDelete([]);
              }}
            >
              삭제하기
            </button>
          )}
        </div>
      </div>

      {isSearchMode && (
        <div className="search-results-info">
          <p>
            검색어: "{searchTerm}" - {totalRockets}개의 모임 로켓을 찾았습니다
            {groupRockets.length === 0 && ' (해당하는 모임 로켓은 존재하지 않습니다)'}
          </p>
        </div>
      )}

      <div className="rockets-count">총 {totalRockets}개의 모임 로켓이 있습니다</div>

      {/* 모임 로켓 목록 */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>모임 로켓 데이터를 불러오는 중...</p>
        </div>
      ) : groupRockets.length > 0 ? (
        <div className="rockets-grid">
          {groupRockets.map((groupRocket, index) => (
            <GroupRocketItem
              key={`${groupRocket.groupChestId}-${index}`}
              groupRocket={groupRocket}
              onClick={handleGroupRocketClick}
              isSelected={rocketsToDelete.includes(groupRocket.groupChestId)}
              isDeleteMode={isDeleteMode}
              timerTick={timerTick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-storage">
          <h2>모임 로켓 보관함이 비어있습니다</h2>
          <p>모임에 참여하여 첫 번째 모임 로켓을 만들어보세요!</p>
          <button onClick={() => navigate('/groups')} className="join-group-btn">
            모임 둘러보기
          </button>
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            이전
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            return pageNum <= totalPages ? (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ) : null;
          })}
            
          <button
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}

      {/* 모임 로켓 상세 모달 */}
      {isModalOpen && selectedRocket && (
        <div className="rocket-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="rocket-modal group-rocket-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>
              <CloseIcon />
            </button>
            <h2>{selectedRocket.rocketName || '이름 없음'}</h2>

            <div className="rocket-modal-content">
              <div className="rocket-modal-image">
                <img
                  src={selectedRocket.designUrl || '/src/assets/rocket.png'}
                  alt={selectedRocket.rocketName}
                  onError={(e) => { e.target.src = '/src/assets/rocket.png'; }}
                />
                <div className="group-modal-badge">
                  <GroupIcon /> 모임 로켓
                </div>
              </div>

              <div className="rocket-modal-details">
                <p className="group-name">
                  <strong>모임:</strong> {selectedRocket.groupName || '알 수 없음'}
                </p>
                <p className="rocket-sent-at">
                  <strong>생성 시간:</strong> {formatDate(selectedRocket.sentAt)}
                </p>

                {/* 모달 컨텐츠 */}
                <GroupRocketModalContent 
                  selectedRocket={selectedRocket}
                  handleUnlockGroupRocket={handleUnlockGroupRocket}
                  deleteSingleRocket={deleteSingleRocket}
                  renderFiles={renderFiles}
                  renderContents={renderContents}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모달들 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        buttonText="확인"
      />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        confirmText="삭제"
        cancelText="취소"
        type="danger"
      />
    </div>
  );
};

export default GroupChest;