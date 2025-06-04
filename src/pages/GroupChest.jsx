import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import '../style/GroupChest.module.css';
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

  const designMap = {
    '/src/assets/rocket_design1.svg': '/src/assets/rocket_design1.svg', 
    '/src/assets/rocket_design2.svg': '/src/assets/rocket_design2.svg', 
    '/src/assets/rocket_design3.svg': '/src/assets/rocket_design3.svg', 
    '/src/assets/rocket_design4.svg': '/src/assets/rocket_design4.svg'
  };

  return designMap[design] || '/src/assets/rocket.png';
};

// 그룹 로켓 아이템 컴포넌트
const GroupRocketItem = ({ groupRocket, onClick, timerTick }) => {
  const [timeDisplay, setTimeDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeStatus, setTimeStatus] = useState('');

  useEffect(() => {
    // 잠금 상태 확인
    const lockStatus = groupRocket.isLock;
    
    if (!lockStatus) {
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
      // 시간이 만료된 경우 - 모임 로켓은 자동으로 오픈 가능
      setIsUnlocked(true);
      setTimeDisplay('오픈 가능');
      const expiredSince = targetDate.toLocaleString('ko-KR', {
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit'
      });
      setTimeStatus(`${expiredSince}부터`);
    }
  }, [groupRocket.lockExpiredAt, groupRocket.isLock, groupRocket.publicAt, timerTick]);

  return (
    <div 
      className={`group-rocket-item ${isUnlocked ? 'unlocked' : 'locked'}`} 
      onClick={() => onClick(groupRocket)}
    >
      <div className="rocket-image">
        <img 
          src={getDesignImage(groupRocket.designUrl)} 
          alt={groupRocket.rocketName} 
          onError={(e) => { e.target.src = '/src/assets/rocket.png' }} 
        />
        {groupRocket.isPublic && <div className="public-badge">공개</div>}
        <div className="group-badge">
          <GroupIcon /> 모임
        </div>
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
  
  // 모임 로켓이 잠금 해제된 경우
  if (!selectedRocket.isLocked) {
    return (
      <>
        <div className="group-rocket-contents">
          <h3>모임원들의 메시지</h3>
          {renderContents()}
        </div>
        {renderFiles()}
      </>
    );
  }
  
  // 잠금 상태 확인
  const now = new Date();
  const targetDate = new Date(selectedRocket.lockExpiredAt);
  const timeExpired = targetDate <= now;
  
  // 시간 만료됨 - 자동으로 내용 표시 (모임 로켓 특성)
  if (timeExpired) {
    return (
      <>
        <div className="group-rocket-contents">
          <h3>모임원들의 메시지</h3>
          {renderContents()}
        </div>
        {renderFiles()}
        <div className="auto-unlock-notice">
          <p>✨ 이 모임 로켓은 시간이 되어 자동으로 열렸습니다!</p>
        </div>
      </>
    );
  }
  
  // 아직 시간 남음 - 카운트다운 표시
  return (
    <div className="rocket-locked">
      <div className="lock-icon"></div>
      <p>이 모임 로켓은 현재 잠겨 있습니다.</p>
      <p className="countdown">남은 시간: {calculateCountdown(selectedRocket.lockExpiredAt)}</p>
      <p className="waiting-message">잠금 해제 시간이 되면 자동으로 열립니다.</p>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [timerTick, setTimerTick] = useState(0);
  
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
        page: currentPage, 
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
      } else {
        setGroupRockets([]);
        setTotalPages(0);
        setTotalRockets(0);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      
      console.error('모임 로켓 데이터 로드 실패:', err);
      setGroupRockets([]);
      if (err.response?.status !== 404) {
        setError('모임 로켓 데이터를 불러오는데 실패했습니다.');
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
        isLocked: detailData.isLocked || false
      };
    } catch (err) {
      console.error('모임 로켓 상세 정보 조회 실패:', err);
      throw err;
    }
  }, []);

  // UI 이벤트 핸들러
  const handleSearch = useCallback(e => {
    e.preventDefault();
    setIsSearchMode(true);
    setCurrentPage(1);
    fetchGroupRockets();
  }, [fetchGroupRockets]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchMode(false);
    setCurrentPage(1);
    fetchGroupRockets();
  }, [fetchGroupRockets]);

  // 모임 로켓 클릭 핸들러
  const handleGroupRocketClick = useCallback(async (groupRocket) => {
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
      alert("모임 로켓 정보를 가져오는데 실패했습니다.");
    }
  }, [fetchGroupRocketDetail]);

  // 파일 다운로드 핸들러
  const handleFileDownload = fileId => {
    if (!fileId) {
      alert('파일 ID가 없습니다.');
      return;
    }
    window.open(`/api/files/${fileId}/download`, '_blank');
  };

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
              <button className="download-button" onClick={() => handleFileDownload(file.fileId || file.id)}>
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
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="모임 로켓 이름으로 검색..."
            />
            <button type="submit" className="search-button"><SearchIcon /></button>
            {isSearchMode && searchTerm && (
              <button type="button" className="clear-search" onClick={clearSearch}><CloseIcon /></button>
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
          {groupRockets.map((groupRocket) => (
            <GroupRocketItem
              key={groupRocket.groupChestId}
              groupRocket={groupRocket}
              onClick={handleGroupRocketClick}
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
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
            .map(pageNum => (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            
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
                  onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
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
                  <strong>생성 시간:</strong>
                  {formatDate(selectedRocket.sentAt)}
                </p>

                {/* 모달 컨텐츠 */}
                <GroupRocketModalContent 
                  selectedRocket={selectedRocket}
                  renderFiles={renderFiles}
                  renderContents={renderContents}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupChest;
