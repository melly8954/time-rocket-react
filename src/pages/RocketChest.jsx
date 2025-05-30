import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import '../style/RocketChest.css';
import { LockIcon, UserIcon, SearchIcon, CloseIcon } from '../components/ui/Icons';

// API 경로 상수화
const API_PATHS = {
  RECEIVED_CHESTS: '/received-chests',
  SENT_CHESTS: '/sent-chests',
  ROCKETS: '/rockets'
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

// 로켓 아이템 컴포넌트 수정
const RocketItem = ({ rocket, idKey, isSentTab, onClick, onContextMenu, isSelected, isDeleteMode, timerTick }) => {
  const [timeDisplay, setTimeDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeStatus, setTimeStatus] = useState(''); // 시간 상태 추가 (남은 시간 또는 오픈 가능)

  useEffect(() => {
  // 잠금 상태 확인
  const lockStatus = Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock);
  
  if (lockStatus === 0) {
    setIsUnlocked(true);
    setTimeDisplay('오픈 완료');
    // 잠금 해제된 시간 표시 (만약 있다면)
    if (rocket.unlockedAt) {
      const unlockDate = formatShortDate(new Date(rocket.unlockedAt));
      setTimeStatus(`${unlockDate}에 열림`);
    } else {
      setTimeStatus('');
    }
    return;
  }
  
  const expireTime = rocket.lockExpiredAt;
  if (!expireTime) {
    setIsUnlocked(false);
    setTimeDisplay('시간 정보 없음');
    setTimeStatus('');
    return;
  }
  
  const now = new Date();
  const targetDate = new Date(expireTime);
  const diff = targetDate - now;
  
  if (diff <= 0) {
     // 아직 시간이 남은 경우 - 모든 로켓은 잠금 상태로 표시
      setIsUnlocked(false);
      
      // 남은 시간을 카운트다운으로 표시
      setTimeDisplay(calculateCountdown(expireTime)); // 남은 시간 직접 표시
      setTimeStatus(`${formatShortDate(targetDate)}까지`);
    } else {
      // 시간이 만료된 경우
      if (isSentTab) {
        // 보낸함의 경우
        setIsUnlocked(false);
        setTimeDisplay('수신자 미확인');
        const expiredSince = formatShortDate(targetDate);
        setTimeStatus(`${expiredSince}부터 열람 가능`);
      } else {
        // 받은함의 경우 - 시간이 만료되었고 잠금 해제 가능
        setIsUnlocked(true);
        setTimeDisplay('오픈 가능'); // 시간이 완전히 만료된 경우에만 '오픈 가능'
        const expiredSince = formatShortDate(targetDate);
        setTimeStatus(`${expiredSince}부터`);
      }
    }
  }, [rocket.lockExpiredAt, rocket.isLock, rocket.isLocked, rocket.unlockedAt, isSentTab, timerTick]);

  // 우클릭 이벤트 처리 (동일)
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (!isSentTab && isUnlocked && onContextMenu) {
      onContextMenu(e, rocket);
    }
  };

  // 간단한 날짜 포맷팅
  const formatShortDate = (date) => {
    if (!date) return '';
    try {
      return date.toLocaleString('ko-KR', {
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  };

  return (
  <div 
    className={`rocket-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`} 
    onClick={() => onClick(rocket)}
    onContextMenu={handleContextMenu}
  >
    <div className="rocket-image">
      <img 
        src={getDesignImage(rocket.designUrl || rocket.design)} 
        alt={rocket.rocketName} 
        onError={(e) => { e.target.src = '/src/assets/rocket.png' }} 
      />
      {rocket.isPublic && <div className="public-badge">공개</div>}
      {isDeleteMode && (
        <div className="delete-checkbox">{isSelected ? '✓' : ''}</div>
      )}
    </div>
    <div className="rocket-details">
      <h3 className="rocket-name">{rocket.rocketName || '이름 없음'}</h3>
      <div className="rocket-sender">
        <UserIcon /> {isSentTab 
          ? (rocket.receiverEmail || '수신자 정보 없음') 
          : (rocket.senderEmail || rocket.senderName || '발신자 정보 없음')}
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
  )}

// 모달 컨텐츠 컴포넌트
const RocketModalContent = ({ 
  selectedRocket, 
  isSentTab, 
  idKey, 
  handleUnlockManually, 
  toggleRocketVisibility, 
  deleteSingleRocket,
  renderFiles
}) => {
  // 잠금 상태 확인
  const lockStatus = Number(selectedRocket.isLocked !== undefined 
    ? selectedRocket.isLocked 
    : selectedRocket.isLock || 0);
  
  // 보낸함 컨텐츠
  if (isSentTab) {
    if (lockStatus === 0) {
      return (
        <>
          <div className="rocket-message">
            <h3>메시지</h3>
            <div className="message-content">
              {selectedRocket.content || '내용이 없습니다.'}
            </div>
          </div>
          {renderFiles()}
          <div className="rocket-actions">
            <button 
              className="delete-button" 
              onClick={() => deleteSingleRocket(selectedRocket[idKey])}
            >
              로켓 삭제
            </button>
          </div>
        </>
      );
    }
    
    // 아직 잠긴 로켓
    const now = new Date();
    const targetDate = new Date(selectedRocket.lockExpiredAt);
    const diff = targetDate - now;
    
    return (
      <div className="rocket-locked">
        <div className="lock-icon"></div>
        <p className="locked-status">이 로켓은 아직 수신자가 열어보지 않았습니다.</p>
        
        {selectedRocket.lockExpiredAt && (
          <div className="countdown-info">
            {diff <= 0 ? (
              <p className="expired-status">로켓을 열 수 있는 시간이 되었지만, 수신자가 아직 열어보지 않았습니다.</p>
            ) : (
              <p className="locked-status">수신자는 {calculateCountdown(selectedRocket.lockExpiredAt)} 후에 로켓을 열 수 있습니다.</p>
            )}
          </div>
        )}
        
        <div className="rocket-actions">
          <button 
            className="delete-button" 
            onClick={() => deleteSingleRocket(selectedRocket[idKey])}
          >
            로켓 삭제
          </button>
        </div>
      </div>
    );
  }
  
  // 받은함 컨텐츠
  if (selectedRocket.loading) {
    return (
      <div className="loading-content">
        <div className="loading-spinner-sm"></div>
        <p>로켓 내용을 불러오는 중...</p>
      </div>
    );
  }
  
  // 이미 잠금 해제된 로켓
  if (lockStatus === 0) {
    return (
      <>
        <div className="rocket-message">
          <h3>메시지</h3>
          <div className="message-content">
            {selectedRocket.content || '내용이 없습니다.'}
          </div>
        </div>
        {renderFiles()}
        <div className="rocket-actions">
          {selectedRocket.receivedChestId && (
            <button 
              className="display-button" 
              onClick={() => toggleRocketVisibility(selectedRocket.receivedChestId)}
            >
              {selectedRocket.isPublic ? '진열장에서 제거' : '진열장에 추가'}
            </button>
          )}
          <button 
            className="delete-button" 
            onClick={() => deleteSingleRocket(selectedRocket[idKey])}
          >
            로켓 삭제
          </button>
        </div>
      </>
    );
  }
  
  // 잠금 상태 확인
  const now = new Date();
  const targetDate = new Date(selectedRocket.lockExpiredAt);
  const timeExpired = targetDate <= now;
  
  // 시간 만료됨 - 잠금 해제 가능
  if (timeExpired) {
    return (
      <div className="rocket-locked rocket-unlockable">
        <div className="lock-icon"></div>
        <p>잠금 해제가 가능합니다.</p>
        <p>아래 버튼을 클릭하여 로켓의 내용을 확인하세요.</p>
        <button 
          className="unlock-button" 
          onClick={() => handleUnlockManually(selectedRocket.rocketId)}
        >
          🔓 잠금 해제하기
        </button>
      </div>
    );
  }
  
  // 아직 시간 남음 - 카운트다운 표시
  return (
    <div className="rocket-locked">
      <div className="lock-icon"></div>
      <p>이 로켓은 현재 잠겨 있습니다.</p>
      <p className="countdown">남은 시간: {calculateCountdown(selectedRocket.lockExpiredAt)}</p>
      <p className="waiting-message">잠금 해제 시간이 되면 버튼이 나타납니다.</p>
    </div>
  );
};

// 메인 컴포넌트
const RocketChest = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const isFetchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  
  // 상태 관리
  const [rockets, setRockets] = useState([]);
  const [totalRockets, setTotalRockets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received');
  const [receivedSubTab, setReceivedSubTab] = useState('self');
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
  
  // 계산된 상태
  const isSentTab = activeTab === 'sent';
  const idKey = isSentTab ? 'sentChestId' : 'receivedChestId';
  
  // 인증 확인 및 타이머 설정
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
    const timer = setInterval(() => setTimerTick(tick => tick + 1), 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, navigate]);
  
  // 잘못된 경로 리디렉션 처리
  useEffect(() => {
    const path = window.location.pathname;

    // URL에서 탭 정보 추출
    if (path.includes('/rocket-chest')) {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      const subTabParam = urlParams.get('subTab');
      
      // URL에 탭 정보가 있으면 해당 탭으로 설정
      if (tabParam && ['received', 'sent', 'group'].includes(tabParam)) {
        setActiveTab(tabParam);
        
        // received 탭이고 하위 탭 정보가 있으면 설정
        if (tabParam === 'received' && subTabParam && ['self', 'other'].includes(subTabParam)) {
          setReceivedSubTab(subTabParam);
        }
      }
    }
  }, [navigate]);

  // 로컬 스토리지에서 잠금 해제된 로켓 정보 적용
  useEffect(() => {
    try {
      const unlockedRockets = JSON.parse(localStorage.getItem('unlockedRockets') || '[]');
      if (unlockedRockets.length > 0 && rockets.length > 0) {
        setRockets(prev => prev.map(r => 
          unlockedRockets.includes(r.rocketId) ? { ...r, isLock: 0, isLocked: false } : r
        ));
      }
    } catch (e) {
      console.error('로컬 스토리지 불러오기 실패:', e);
    }
  }, [rockets.length]);

  // 데이터 로드
  useEffect(() => {
    if (!userId) return;
    fetchRockets();
  }, [userId, currentPage, activeTab, receivedSubTab, sortOrder]);

  // 실시간 검색 기능 - 타이핑 후 500ms 후 검색 실행
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    
    if (searchTerm.trim() === '') {
      if (isSearchMode) {
        setIsSearchMode(false);
        fetchRockets();
      }
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchMode(true);
      setCurrentPage(1);
      fetchRockets();
    }, 500);
    
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  // 로켓 데이터 조회
  const fetchRockets = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    // 고유한 요청 ID 생성
    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;
    setIsLoading(true);

    try {
      // 요청 파라미터 설정
      const params = {
        page: currentPage, 
        size: 10,
        sort: isSentTab ? 'sentChestId' : 'receivedChestId',
        order: sortOrder
      };
      
      // 검색어가 있으면 추가
      if (searchTerm.trim()) {
        params['rocket-name'] = searchTerm.trim();
      }
      
      // 하위 탭에 따라 receiverType 파라미터 추가
      if (activeTab === 'received') {
        params.receiverType = receivedSubTab;
      } else if (activeTab === 'group') {
        params.receiverType = 'group';
      }

      // API 엔드포인트 결정
      const apiUrl = isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS;
      
      // API 요청 실행
      const response = await api.get(apiUrl, { params });
      
      // 이 요청이 가장 최근의 요청인지 확인
      if (isFetchingRef.current !== currentFetchId) return;
      
      if (response.data?.data) {
        const responseData = response.data.data;
        
        // 응답 데이터 처리
        const rocketsList = isSentTab ? responseData.sentChests || [] : responseData.receivedChests || [];
        
        // 데이터 전처리
        const processedRockets = rocketsList.map(rocket => ({
          ...rocket,
          isLock: Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0),
          // 보낸함에서는 현재 로그인한 사용자를 보낸 사람으로 설정
          senderEmail: isSentTab ? (userId || rocket.senderEmail || '') : (rocket.senderEmail || ''),
          senderName: isSentTab ? (userId || rocket.senderName || '') : (rocket.senderName || '')
        }));
        
        setRockets(processedRockets);
        setTotalPages(responseData.totalPages || 0);
        setTotalRockets(responseData.totalElements || 0);
      } else {
        setRockets([]);
        setTotalPages(0);
        setTotalRockets(0);
      }
    } catch (err) {
      // 이 요청이 가장 최근의 요청인지 확인
      if (isFetchingRef.current !== currentFetchId) return;
      
      console.error('로켓 데이터 로드 실패:', err);
      setRockets([]);
      if (err.response?.status !== 404) {
        setError('로켓 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      // 이 요청이 가장 최근의 요청인지 확인
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [activeTab, currentPage, isSentTab, receivedSubTab, searchTerm, sortOrder, userId]);

  // 로켓 상세 정보 조회
  const fetchRocketDetail = useCallback(async (rocket) => {
    const detailId = rocket[idKey];
    
    if (!detailId) {
      console.error('로켓 ID가 없음:', { rocket, idKey });
      throw new Error('로켓 세부 정보를 가져올 수 없습니다.');
    }
    
    try {
      const apiUrl = `${isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS}/${detailId}`;
      const response = await api.get(apiUrl);
      
      if (!response.data?.data) throw new Error('데이터 형식이 올바르지 않습니다.');
      
      const detailData = response.data.data;
      
      // 데이터 필드 통합 처리
      const lockStatus = Number(detailData.isLocked !== undefined ? detailData.isLocked : detailData.isLock || 0);
      const senderEmail = detailData.senderEmail || rocket.senderEmail || '';
      const receiverEmail = detailData.receiverEmail || rocket.receiverEmail || '';
      let lockExpiredAt = detailData.lockExpiredAt || rocket.lockExpiredAt;
      
      if (!lockExpiredAt && detailData.unlockAt) {
        lockExpiredAt = detailData.unlockAt;
      }
      
      return {
        ...detailData,
        senderEmail,
        receiverEmail,
        files: detailData.rocketFiles || detailData.files || [],
        content: detailData.content || '',
        isLock: lockStatus,
        isLocked: lockStatus === 1,
        lockExpiredAt
      };
    } catch (err) {
      console.error('로켓 상세 정보 조회 실패:', err);
      throw err;
    }
  }, [idKey, isSentTab]);

  // 로켓 잠금 해제
  const handleUnlockManually = useCallback(async (rocketId) => {
    if (!rocketId) {
      alert('유효하지 않은 로켓 ID입니다.');
      return;
    }
    
    try {
      await api.patch(`${API_PATHS.ROCKETS}/${rocketId}/unlock`);
      
      // 로켓 상태 즉시 업데이트
      setSelectedRocket(prev => prev ? { ...prev, isLock: 0, isLocked: false } : null);
      
      // 목록에서도 상태 업데이트
      setRockets(prev => prev.map(r => 
        r.rocketId === rocketId ? { ...r, isLock: 0, isLocked: false } : r
      ));
      
      // 로컬 스토리지에 잠금 해제된 로켓 정보 저장
      try {
        const unlockedRockets = JSON.parse(localStorage.getItem('unlockedRockets') || '[]');
        if (!unlockedRockets.includes(rocketId)) {
          unlockedRockets.push(rocketId);
          localStorage.setItem('unlockedRockets', JSON.stringify(unlockedRockets));
        }
      } catch (e) {
        console.error('로컬 스토리지 저장 실패:', e);
      }
      
      // 데이터 새로고침
      fetchRockets();
      
      alert('로켓이 성공적으로 잠금 해제되었습니다.');
    } catch (err) {
      console.error('잠금 해제 오류:', err);
      alert(err.response?.data?.message || '잠금 해제에 실패했습니다.');
    }
  }, [fetchRockets]);

  // 진열장 상태 변경
  const toggleRocketVisibility = useCallback(async (chestId) => {
    if (!chestId) {
      console.error('유효하지 않은 chestId:', chestId);
      alert('로켓 정보를 찾을 수 없습니다.');
      return false;
    }

    try {
      const currentRocket = rockets.find(r => r.receivedChestId === chestId) || selectedRocket;
      
      if (!currentRocket) {
        alert('로켓 정보를 찾을 수 없습니다.');
        return false;
      }

      const lockStatus = Number(currentRocket.isLocked !== undefined ? currentRocket.isLocked : currentRocket.isLock || 0);
      if (lockStatus !== 0) {
        alert('이 로켓은 잠금 상태입니다. 먼저 잠금을 해제해주세요.');
        return false;
      }

      const response = await api.patch(`${API_PATHS.RECEIVED_CHESTS}/${chestId}/visibility`);
      
      if (response.status === 200) {
        const updatedIsPublic = !currentRocket.isPublic;
        
        // 상태 업데이트
        setRockets(prev => prev.map(r => 
          r.receivedChestId === chestId ? { ...r, isPublic: updatedIsPublic } : r
        ));
        
        if (selectedRocket?.receivedChestId === chestId) {
          setSelectedRocket(prev => ({ ...prev, isPublic: updatedIsPublic }));
        }
        
        alert(updatedIsPublic ? '로켓이 진열장에 추가되었습니다.' : '로켓이 진열장에서 제거되었습니다.');
        fetchRockets();
        return updatedIsPublic;
      }
      
      alert('로켓 공개 상태 변경에 실패했습니다.');
      return false;
    } catch (error) {
      console.error('로켓 공개 설정 변경 실패:', error);
      alert(error.response?.data?.message || '오류가 발생했습니다.');
      return false;
    }
  }, [fetchRockets, rockets, selectedRocket]);

  // 단일 로켓 삭제
  const deleteSingleRocket = useCallback(async (rocketId) => {
    if (!rocketId) {
      alert('유효하지 않은 로켓입니다.');
      return;
    }
    
    if (!window.confirm('해당 로켓을 삭제하시겠습니까?')) return;
    
    try {
      const endpoint = isSentTab 
        ? `${API_PATHS.SENT_CHESTS}/${rocketId}/deleted-flag` 
        : `${API_PATHS.RECEIVED_CHESTS}/${rocketId}/deleted-flag`;
      
      await api.patch(endpoint);
      setIsModalOpen(false);
      fetchRockets();
      alert('로켓이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('로켓 삭제 실패:', err);
      alert(err?.response?.data?.message || '로켓 삭제 중 오류가 발생했습니다.');
    }
  }, [fetchRockets, isSentTab]);

  // 선택된 로켓 일괄 삭제
  const deleteSelectedRockets = useCallback(async () => {
    if (rocketsToDelete.length === 0) return;
    if (!window.confirm(`선택한 ${rocketsToDelete.length}개의 로켓을 삭제하시겠습니까?`)) return;
    
    try {
      const deletePromises = rocketsToDelete.map(rocketId => {
        const endpoint = isSentTab 
          ? `${API_PATHS.SENT_CHESTS}/${rocketId}/deleted-flag` 
          : `${API_PATHS.RECEIVED_CHESTS}/${rocketId}/deleted-flag`;
        return api.patch(endpoint);
      });
      
      await Promise.all(deletePromises);
      fetchRockets();
      setRocketsToDelete([]);
      alert('선택한 로켓이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('로켓 삭제 실패:', err);
      alert(err?.response?.data?.message || '로켓 삭제 중 오류가 발생했습니다.');
    }
  }, [fetchRockets, isSentTab, rocketsToDelete]);

  // UI 이벤트 핸들러
  const handleSearch = useCallback(e => {
    e.preventDefault();
    setIsSearchMode(true);
    setCurrentPage(1);
    fetchRockets();
  }, [fetchRockets]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchMode(false);
    setCurrentPage(1);
    fetchRockets();
  }, [fetchRockets]);

  const handleTabChange = useCallback(tab => {
    setActiveTab(tab);
    setSearchTerm('');
    setIsSearchMode(false);
    setIsDeleteMode(false);
    setRocketsToDelete([]);
    setCurrentPage(1);
    
    // 다음 렌더링 주기에서 데이터 로드
    setTimeout(() => fetchRockets(), 0);
  }, [fetchRockets]);
  
  const handleSubTabChange = useCallback(subTab => {
    setReceivedSubTab(subTab);
    setCurrentPage(1);
    
    // 다음 렌더링 주기에서 데이터 로드
    setTimeout(() => fetchRockets(), 0);
  }, [fetchRockets]);

  // 로켓 클릭 핸들러 (계속)
  const handleRocketClick = useCallback(async (rocket) => {
    const detailId = rocket[idKey];
    if (!detailId) {
      console.error('유효하지 않은 로켓 ID:', rocket);
      return;
    }
    
    if (isDeleteMode) {
      // 삭제 모드일 때 선택/해제 처리
      const lockStatus = Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0);
      const canDelete = isSentTab || lockStatus === 0;
      
      if (canDelete) {
        setRocketsToDelete(prev => 
          prev.includes(detailId) 
            ? prev.filter(id => id !== detailId) 
            : [...prev, detailId]
        );
      }
      return;
    }
    
    // 상세 정보 조회
    try {
      setSelectedRocket({ ...rocket, loading: true });
      setIsModalOpen(true);
      
      const detailData = await fetchRocketDetail(rocket);
      setSelectedRocket({ 
        ...rocket, 
        ...detailData, 
        loading: false 
      });
    } catch (err) {
      console.error('로켓 상세 정보 로드 실패:', err);
      setSelectedRocket(prev => ({ ...prev, loading: false, loadError: true }));
      alert("로켓 정보를 가져오는데 실패했습니다.");
    }
  }, [fetchRocketDetail, idKey, isDeleteMode, isSentTab]);

  // 컨텍스트 메뉴 핸들러 (우클릭)
  const handleContextMenu = useCallback((e, rocket) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 보낸함이거나 잠금 상태면 무시
    if (isSentTab) return;
    
    const lockStatus = Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0);
    if (lockStatus !== 0) {
      alert('이 로켓은 잠금 상태입니다. 먼저 잠금을 해제해주세요.');
      return;
    }
    
    toggleRocketVisibility(rocket.receivedChestId);
  }, [isSentTab, toggleRocketVisibility]);

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
    const filesList = selectedRocket?.files || selectedRocket?.rocketFiles || [];
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
  }, [handleFileDownload, selectedRocket]);
  
  // 오류 화면
  if (error) {
    return (
      <div className="rocket-chest-error">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="rocket-chest-container">
      {/* 헤더 영역 */}
      <div className="rocket-chest-header">
        <h1>로켓 보관함</h1>
        <div className="tab-navigation">
          {['received', 'sent', 'group'].map(tab => (
            <button 
              key={tab} 
              className={`tab-button ${activeTab === tab ? 'active' : ''}`} 
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'received' ? '받은 로켓함' : tab === 'sent' ? '보낸 로켓함' : '모임 로켓함'}
            </button>
          ))}
        </div>
        
        {activeTab === 'received' && (
          <div className="sub-tab-navigation">
            <button 
              className={`sub-tab-button ${receivedSubTab === 'self' ? 'active' : ''}`} 
              onClick={() => handleSubTabChange('self')}
            >
              나에게
            </button>
            <button 
              className={`sub-tab-button ${receivedSubTab === 'other' ? 'active' : ''}`} 
              onClick={() => handleSubTabChange('other')}
            >
              다른 사람에게
            </button>
          </div>
        )}
      </div>

      {/* 검색 및 컨트롤 */}
      <div className="rocket-chest-controls">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="로켓 이름으로 검색..."
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
            검색어: "{searchTerm}" - {totalRockets}개의 로켓을 찾았습니다
            {rockets.length === 0 && ' (해당하는 로켓은 존재하지 않습니다)'}
          </p>
        </div>
      )}

      <div className="rockets-count">총 {totalRockets}개의 로켓이 있습니다</div>

      {/* 로켓 목록 */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>로켓 데이터를 불러오는 중...</p>
        </div>
      ) : rockets.length > 0 ? (
        <div className="rockets-grid">
          {rockets.map((rocket) => (
            <RocketItem
              key={rocket[idKey]}
              rocket={rocket}
              idKey={idKey}
              isSentTab={isSentTab}
              onClick={handleRocketClick}
              onContextMenu={handleContextMenu}
              isSelected={rocketsToDelete.includes(rocket[idKey])}
              isDeleteMode={isDeleteMode}
              timerTick={timerTick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-storage">
          <h2>보관함이 비어있습니다</h2>
          <p>첫 번째 로켓을 만들어 시간여행을 시작해 보세요!</p>
          <button onClick={() => navigate('/rockets/create')} className="create-rocket-btn">
            새 로켓 만들기
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

      {/* 로켓 상세 모달 */}
      {isModalOpen && selectedRocket && (
        <div className="rocket-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="rocket-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setIsModalOpen(false)}>
              <CloseIcon />
            </button>
            <h2>{selectedRocket.rocketName || '이름 없음'}</h2>

            <div className="rocket-modal-content">
              <div className="rocket-modal-image">
                <img
                  src={selectedRocket.designUrl || selectedRocket.design || '/src/assets/rocket.png'}
                  alt={selectedRocket.rocketName}
                  onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
                />
              </div>

              <div className="rocket-modal-details">
                <p className="rocket-sender">
                  <strong>보낸 사람:</strong> {selectedRocket.senderEmail || '알 수 없음'}
                </p>
                <p className="rocket-receiver">
                  <strong>받는 사람:</strong> {selectedRocket.receiverEmail || selectedRocket.receiverNickname || '알 수 없음'}
                </p>
                <p className="rocket-sent-at">
                  <strong>{isSentTab ? '보낸 시간:' : '받은 시간:'}</strong>
                  {formatDate(selectedRocket.sentAt || selectedRocket.createdAt)}
                </p>

                {/* 모달 컨텐츠 */}
                <RocketModalContent 
                  selectedRocket={selectedRocket}
                  isSentTab={isSentTab}
                  idKey={idKey}
                  handleUnlockManually={handleUnlockManually}
                  toggleRocketVisibility={toggleRocketVisibility}
                  deleteSingleRocket={deleteSingleRocket}
                  renderFiles={renderFiles}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RocketChest;
