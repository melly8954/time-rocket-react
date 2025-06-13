import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import { AlertModal, ConfirmModal } from '../components/common/Modal';
import '../style/RocketChest.css';
import { LockIcon, UserIcon, SearchIcon, CloseIcon, GroupIcon } from '../components/ui/Icons';

const API_PATHS = {
  RECEIVED_CHESTS: '/received-chests',
  SENT_CHESTS: '/sent-chests',
  ROCKETS: '/rockets',
  GROUP_CHESTS: '/group-chests'
};

const formatDate = dateString => {
  if (!dateString) return '정보 없음';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const calculateCountdown = (expireDate) => {
  if (!expireDate) return '00 : 00 : 00 : 00';
  const now = new Date();
  const diff = new Date(expireDate) - now;
  if (diff <= 0) return '00 : 00 : 00 : 00';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return [days, hours, minutes, seconds]
    .map(n => n.toString().padStart(2, '0'))
    .join(' : ');
};

const getDesignImage = (design) => {
  if (!design) return '/src/assets/rocket.png';
  if (design.startsWith('http') || design.includes('/src/assets/')) return design;
  return '/src/assets/rocket.png';
};

const RocketItem = ({ rocket, idKey, isSentTab, isGroupTab, onClick, onContextMenu, isSelected, isDeleteMode, timerTick }) => {
  const [timeDisplay, setTimeDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeStatus, setTimeStatus] = useState('');

  useEffect(() => {
    if (!rocket || !rocket.rocketName) {
      return;
    }

    const updateTime = () => {
      const lockStatus = rocket.isLock !== undefined && rocket.isLock !== null 
        ? rocket.isLock 
        : rocket.lockStatus !== undefined && rocket.lockStatus !== null
        ? rocket.lockStatus
        : null;
        
      const expireTime = rocket.lockExpiredAt;
      
      if (!expireTime) {
        if (isSentTab) {
          setIsUnlocked(false);
          setTimeDisplay('수신자 미확인');
          setTimeStatus('열람 대기중');
        } else {
          const isReallyUnlocked = lockStatus === false || lockStatus === 0;
          setIsUnlocked(isReallyUnlocked);
          setTimeDisplay(isReallyUnlocked ? '오픈 완료' : '시간 정보 없음');
          setTimeStatus('');
        }
        return;
      }
      
      const targetDate = new Date(expireTime);
      const currentTime = new Date();
      const diff = targetDate - currentTime;
      
      if (diff > 0) {
        setIsUnlocked(false);
        setTimeDisplay(calculateCountdown(expireTime));
        setTimeStatus(`${targetDate.toLocaleString('ko-KR', { 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}까지`);
      } else {
        if (isSentTab && !isGroupTab) {
          const isConfirmed = lockStatus === false || lockStatus === 0;
          setIsUnlocked(isConfirmed);
          setTimeDisplay(isConfirmed ? '수신자 확인됨' : '수신자 미확인');
          setTimeStatus(isConfirmed ? '' : '열람 대기중');
        } else if (isGroupTab) {
          setIsUnlocked(true);
          setTimeDisplay('오픈 완료');
          setTimeStatus('자동 오픈됨');
        } else {
          const isReallyUnlocked = lockStatus === false || lockStatus === 0;
          if (isReallyUnlocked) {
            setIsUnlocked(true);
            setTimeDisplay('오픈 완료');
            setTimeStatus('');
          } else {
            setIsUnlocked(false);
            setTimeDisplay('오픈 가능');
            setTimeStatus('클릭하여 잠금 해제');
          }
        }
      }
    };

    updateTime();
  }, [rocket?.rocketName, rocket?.isLock, rocket?.lockStatus, rocket?.lockExpiredAt, isSentTab, isGroupTab, timerTick]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isSentTab || isGroupTab) return;
    if (isUnlocked && onContextMenu) {
      onContextMenu(e, rocket);
    }
  };

  const getDisplayInfo = () => {
    if (isGroupTab) {
      return <><GroupIcon /> {rocket?.groupName || '모임 정보 없음'}</>;
    } else if (isSentTab) {
      const receiverInfo = rocket?.receiverEmail || rocket?.receiverNickname || rocket?.targetEmail || rocket?.toEmail || '수신자 정보 없음';
      return <><UserIcon /> {receiverInfo}</>;
    } else {
      const senderInfo = rocket?.senderEmail || rocket?.senderName || rocket?.senderNickname || rocket?.fromEmail || '발신자 정보 없음';
      return <><UserIcon /> {senderInfo}</>;
    }
  };

  if (!rocket || !rocket.rocketName) {
    return null;
  }

  return (
    <div 
      className={`rocket-item ${isGroupTab ? 'group-rocket-item' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`} 
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
        {isGroupTab && <div className="group-badge"><GroupIcon /> 모임</div>}
        {isDeleteMode && <div className="delete-checkbox">{isSelected ? '✓' : ''}</div>}
      </div>
      <div className="rocket-details">
        <h3 className="rocket-name">{rocket.rocketName || '이름 없음'}</h3>
        <div className={isGroupTab ? "group-info" : "rocket-sender"}>
          {getDisplayInfo()}
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
              {timeStatus && <div className="unlock-date-hint">{timeStatus}</div>}
            </div>
          )}
        </div>
      </div>
      {!isSentTab && !isGroupTab && isUnlocked && (
        <div className="context-menu-hint">우클릭으로 진열장에 추가/제거</div>
      )}
    </div>
  );
};

const ModalContent = ({ 
  selectedRocket, 
  isSentTab, 
  isGroupTab,
  idKey, 
  handleUnlockManually, 
  toggleVisibility, 
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

  if (isGroupTab) {
    const expireTime = selectedRocket.lockExpiredAt;
    const now = new Date();
    const targetDate = new Date(expireTime);
    const timeExpired = !expireTime || targetDate <= now;
    
    if (timeExpired || !selectedRocket.isLock) {
      return (
        <>
          <div className="group-rocket-contents">
            <h3>모임원들의 메시지</h3>
            {renderContents()}
          </div>
          {renderFiles()}
          {timeExpired && selectedRocket.isLock && (
            <div className="auto-unlock-notice">
              <p>✨ 이 모임 로켓은 시간이 되어 자동으로 열렸습니다!</p>
            </div>
          )}
          <div className="rocket-actions">
            <button className="display-button" onClick={() => toggleVisibility(selectedRocket[idKey])}>
              {selectedRocket.isPublic ? '진열장에서 제거' : '진열장에 추가'}
            </button>
            <button className="delete-button" onClick={() => deleteSingleRocket(selectedRocket[idKey])}>
              로켓 삭제
            </button>
          </div>
        </>
      );
    } else {
      return (
        <div className="rocket-locked">
          <div className="lock-icon"></div>
          <p>이 모임 로켓은 현재 잠겨 있습니다.</p>
          <p className="countdown">남은 시간: {calculateCountdown(expireTime)}</p>
          <p className="waiting-message">잠금 해제 시간이 되면 자동으로 열립니다.</p>
        </div>
      );
    }
  }

  let lockStatus = null;
  if (selectedRocket.isLock !== undefined && selectedRocket.isLock !== null) {
    lockStatus = selectedRocket.isLock;
  } else if (selectedRocket.isLocked !== undefined && selectedRocket.isLocked !== null) {
    lockStatus = selectedRocket.isLocked;
  } else if (selectedRocket.locked !== undefined && selectedRocket.locked !== null) {
    lockStatus = selectedRocket.locked;
  }
  
  const isLocked = lockStatus === 1 || lockStatus === true || lockStatus === '1' || lockStatus === 'true';
  
  if (!isLocked) {
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
          {!isSentTab && (
            <button 
              className="display-button"
              onClick={() => toggleVisibility(selectedRocket[idKey])}
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

  if (isSentTab) {
    return (
      <div className="rocket-locked">
        <div className="lock-icon"></div>
        <p>이 로켓은 아직 수신자가 열어보지 않았습니다.</p>
        <div className="rocket-actions">
          <button className="delete-button" onClick={() => deleteSingleRocket(selectedRocket[idKey])}>
            로켓 삭제
          </button>
        </div>
      </div>
    );
  }

  const expireTime = selectedRocket.lockExpiredAt || selectedRocket.expiredAt || selectedRocket.unlockTime;
  const now = new Date();
  const targetDate = new Date(expireTime);
  const timeExpired = targetDate <= now;

  if (timeExpired) {
    return (
      <div className="rocket-locked rocket-unlockable">
        <div className="lock-icon"></div>
        <p>잠금 해제가 가능합니다.</p>
        <button 
          className="unlock-button" 
          onClick={() => handleUnlockManually(selectedRocket.rocketId)}
        >
          🔓 잠금 해제하기
        </button>
      </div>
    );
  }

  return (
    <div className="rocket-locked">
      <div className="lock-icon"></div>
      <p>이 로켓은 현재 잠겨 있습니다.</p>
      <p className="countdown">남은 시간: {calculateCountdown(expireTime)}</p>
      <p className="waiting-message">잠금 해제 시간이 되면 버튼이 나타납니다.</p>
    </div>
  );
};

const RocketChest = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const isFetchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  
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

  // 통합된 에러 처리 함수
  const handleApiError = (err, defaultMessage = '오류가 발생했습니다.') => {
    console.error('API 오류:', err);
    
    const errorMessage = err.response?.data?.message || defaultMessage;
    showAlert(errorMessage, 'danger', '오류');
    
    if (err.response?.status === 401) {
      setTimeout(() => navigate('/login'), 2000);
    }
  };
  
  const isSentTab = activeTab === 'sent';
  const isGroupTab = activeTab === 'group';
  const idKey = isSentTab ? 'sentChestId' : isGroupTab ? 'groupChestId' : 'receivedChestId';
  
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
    const timer = setInterval(() => setTimerTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId, currentPage, activeTab, receivedSubTab, sortOrder]);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    if (searchTerm.trim() === '') {
      if (isSearchMode) {
        setIsSearchMode(false);
        fetchData();
      }
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchMode(true);
      setCurrentPage(1);
      fetchData();
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;
    setIsLoading(true);

    try {
      const params = {
        page: isGroupTab ? currentPage - 1 : currentPage,
        size: 10,
        sort: isGroupTab ? 'groupChestId' : isSentTab ? 'sentChestId' : 'receivedChestId',
        order: sortOrder
      };
      
      if (searchTerm.trim()) {
        params[isGroupTab ? 'group-rocket-name' : 'rocket-name'] = searchTerm.trim();
      }
      
      if (activeTab === 'received') {
        params.receiverType = receivedSubTab;
      }

      const apiUrl = isGroupTab ? API_PATHS.GROUP_CHESTS : isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS;
      const response = await api.get(apiUrl, { params });
      
      if (isFetchingRef.current !== currentFetchId) return;
      
      if (response.data?.data) {
        const responseData = response.data.data;
        let rocketsList = [];
        
        if (isGroupTab) {
          rocketsList = responseData.groupChests || [];
        } else if (isSentTab) {
          rocketsList = responseData.sentChests || [];
        } else {
          rocketsList = responseData.receivedChests || [];
        }
        
        const validRockets = rocketsList.filter(rocket => 
          rocket && rocket.rocketName && rocket.rocketName.trim() !== ''
        );
        
        setRockets(validRockets);
        setTotalPages(responseData.totalPages || 0);
        setTotalRockets(responseData.totalElements || 0);
        setError(null);
      } else {
        setRockets([]);
        setTotalPages(0);
        setTotalRockets(0);
        setError(null);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      
      handleApiError(err, '데이터를 불러오는데 실패했습니다.');
      setRockets([]);
      setTotalPages(0);
      setTotalRockets(0);
    } finally {
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [activeTab, currentPage, isSentTab, isGroupTab, receivedSubTab, searchTerm, sortOrder]);

  const fetchDetail = useCallback(async (rocket) => {
    const detailId = rocket[idKey];
    if (!detailId) throw new Error('로켓 세부 정보를 가져올 수 없습니다.');
    
    const apiUrl = isGroupTab 
      ? `${API_PATHS.GROUP_CHESTS}/${detailId}`
      : `${isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS}/${detailId}`;
    
    const response = await api.get(apiUrl);
    if (!response.data?.data) throw new Error('데이터 형식이 올바르지 않습니다.');
    
    const detailData = response.data.data;
    console.log('모임 로켓 상세 데이터:', detailData);

    return {
      ...response.data.data,
      files: response.data.data.rocketFiles || response.data.data.files || [],
      contents: response.data.data.contents || [],
    };
  }, [idKey, isSentTab, isGroupTab]);

  const handleUnlockManually = useCallback(async (rocketId) => {
    if (!rocketId) return;
    
    try {
      await api.patch(`${API_PATHS.ROCKETS}/${rocketId}/unlock`);
      setSelectedRocket(prev => prev ? { ...prev, isLock: 0, isLocked: false } : null);
      setRockets(prev => prev.map(r => r.rocketId === rocketId ? { ...r, isLock: 0, isLocked: false } : r));
      fetchData();
      showAlert('로켓이 성공적으로 잠금 해제되었습니다.', 'success');
    } catch (err) {
      handleApiError(err, '잠금 해제에 실패했습니다.');
    }
  }, [fetchData]);

  const toggleVisibility = useCallback(async (chestId) => {
    if (!chestId) return;

    try {
      const apiPath = isGroupTab ? `${API_PATHS.GROUP_CHESTS}/${chestId}/visibility` : `${API_PATHS.RECEIVED_CHESTS}/${chestId}/visibility`;
      const response = await api.patch(apiPath);
      
      if (response.status === 200) {
        const currentRocket = rockets.find(r => r[idKey] === chestId) || selectedRocket;
        const updatedIsPublic = !currentRocket.isPublic;
        
        setRockets(prev => prev.map(r => r[idKey] === chestId ? { ...r, isPublic: updatedIsPublic } : r));
        if (selectedRocket?.[idKey] === chestId) {
          setSelectedRocket(prev => ({ ...prev, isPublic: updatedIsPublic }));
        }
        
        fetchData();
        showAlert(updatedIsPublic ? '로켓이 진열장에 추가되었습니다.' : '로켓이 진열장에서 제거되었습니다.', 'success');
      }
    } catch (error) {
      handleApiError(error, '오류가 발생했습니다.');
    }
  }, [rockets, selectedRocket, idKey, isGroupTab, fetchData]);

  const deleteSingleRocket = useCallback(async (rocketId) => {
    if (!rocketId) return;
    
    showConfirm(
      `해당 ${isGroupTab ? '모임 ' : ''}로켓을 삭제하시겠습니까?`,
      async () => {
        try {
          const endpoint = isGroupTab 
            ? `${API_PATHS.GROUP_CHESTS}/${rocketId}/deleted-flag`
            : `${isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS}/${rocketId}/deleted-flag`;
          
          await api.patch(endpoint);
          setIsModalOpen(false);
          fetchData();
          showAlert(`${isGroupTab ? '모임 ' : ''}로켓이 성공적으로 삭제되었습니다.`, 'success');
        } catch (err) {
          handleApiError(err, '로켓 삭제 중 오류가 발생했습니다.');
        }
      }
    );
  }, [isSentTab, isGroupTab, fetchData]);

  const deleteSelectedRockets = useCallback(async () => {
    if (rocketsToDelete.length === 0) return;
    const rocketType = isGroupTab ? '모임 로켓' : '로켓';
    
    showConfirm(
      `선택한 ${rocketsToDelete.length}개의 ${rocketType}을 삭제하시겠습니까?`,
      async () => {
        try {
          const deletePromises = rocketsToDelete.map(rocketId => {
            const endpoint = isGroupTab 
              ? `${API_PATHS.GROUP_CHESTS}/${rocketId}/deleted-flag`
              : `${isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS}/${rocketId}/deleted-flag`;
            return api.patch(endpoint);
          });
          
          await Promise.all(deletePromises);
          fetchData();
          setRocketsToDelete([]);
          setIsDeleteMode(false);
          showAlert(`선택한 ${rocketType}이 성공적으로 삭제되었습니다.`, 'success');
        } catch (err) {
          handleApiError(err, '로켓 삭제 중 오류가 발생했습니다.');
        }
      }
    );
  }, [rocketsToDelete, isSentTab, isGroupTab, fetchData]);

  const handleRocketClick = useCallback(async (rocket) => {
    const detailId = rocket[idKey];
    if (!detailId) return;
    
    if (isDeleteMode) {
      const canDelete = isGroupTab || isSentTab || Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0) === 0;
      if (canDelete) {
        setRocketsToDelete(prev => 
          prev.includes(detailId) ? prev.filter(id => id !== detailId) : [...prev, detailId]
        );
      }
      return;
    }
    
    try {
      setSelectedRocket({ ...rocket, loading: true });
      setIsModalOpen(true);
      const detailData = await fetchDetail(rocket);
      setSelectedRocket({ ...rocket, ...detailData, loading: false });
    } catch (err) {
      setSelectedRocket(prev => ({ ...prev, loading: false, loadError: true }));
      showAlert("로켓 정보를 가져오는데 실패했습니다.", 'danger');
    }
  }, [idKey, isDeleteMode, isGroupTab, isSentTab, fetchDetail]);

  const handleContextMenu = useCallback((e, rocket) => {
    e.preventDefault();
    if (isSentTab || isGroupTab) return;
    const lockStatus = Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0);
    if (lockStatus !== 0) {
      showAlert('이 로켓은 잠금 상태입니다. 먼저 잠금을 해제해주세요.', 'warning');
      return;
    }
    toggleVisibility(rocket.receivedChestId);
  }, [isSentTab, isGroupTab, toggleVisibility]);

  const renderFiles = useCallback(() => {
    const filesList = selectedRocket?.files || [];
    return filesList.length > 0 ? (
      <div className="rocket-attachments">
        <h3>첨부 파일 ({filesList.length}개)</h3>
        <ul className="files-list">
          {filesList.map((file, index) => (
            <li key={index} className="file-item">
              <span className="file-name">{file.originalName || `파일 ${index + 1}`}</span>
              <button className="download-button" onClick={() => window.open(`/api/files/${file.fileId || file.id}/download`, '_blank')}>
                다운로드
              </button>
            </li>
          ))}
        </ul>
      </div>
    ) : <p className="no-attachments">첨부 파일이 없습니다.</p>;
  }, [selectedRocket]);

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
            <div className="content-message">{content.content || '내용이 없습니다.'}</div>
          </div>
        ))}
      </div>
    ) : <p className="no-contents">작성된 내용이 없습니다.</p>;
  }, [selectedRocket]);

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
      <div className="rocket-chest-header">
        <h1>로켓 보관함</h1>
        <div className="tab-navigation">
          {[
            { key: 'received', label: '받은 로켓함' },
            { key: 'sent', label: '보낸 로켓함' },
            { key: 'group', label: '모임 로켓함' }
          ].map(tab => (
            <button 
              key={tab.key} 
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`} 
              onClick={() => {
                setActiveTab(tab.key);
                setSearchTerm('');
                setIsSearchMode(false);
                setIsDeleteMode(false);
                setRocketsToDelete([]);
                setCurrentPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'received' && (
          <div className="sub-tab-navigation">
            {[
              { key: 'self', label: '나에게' },
              { key: 'other', label: '다른 사람에게' }
            ].map(subTab => (
              <button 
                key={subTab.key}
                className={`sub-tab-button ${receivedSubTab === subTab.key ? 'active' : ''}`} 
                onClick={() => {
                  setReceivedSubTab(subTab.key);
                  setCurrentPage(1);
                }}
              >
                {subTab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rocket-chest-controls">
        <div className="search-bar">
          <form onSubmit={(e) => { e.preventDefault(); setIsSearchMode(true); setCurrentPage(1); fetchData(); }}>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder={`${isGroupTab ? '모임 ' : ''}로켓 이름으로 검색...`}
            />
            <button type="submit" className="search-button"><SearchIcon /></button>
            {isSearchMode && searchTerm && (
              <button type="button" className="clear-search" onClick={() => {
                setSearchTerm('');
                setIsSearchMode(false);
                setCurrentPage(1);
                fetchData();
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
          <p>검색어: "{searchTerm}" - {totalRockets}개의 {isGroupTab ? '모임 로켓' : '로켓'}을 찾았습니다</p>
        </div>
      )}

      <div className="rockets-count">총 {totalRockets}개의 {isGroupTab ? '모임 로켓' : '로켓'}이 있습니다</div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{isGroupTab ? '모임 로켓' : '로켓'} 데이터를 불러우는 중...</p>
        </div>
      ) : rockets.length > 0 ? (
        <div className="rockets-grid">
          {rockets.map((rocket, index) => (
            <RocketItem
              key={`${rocket[idKey]}-${index}`}
              rocket={rocket}
              idKey={idKey}
              isSentTab={isSentTab}
              isGroupTab={isGroupTab}
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
          <h2>{isGroupTab ? '모임 로켓 보관함이 비어있습니다' : '보관함이 비어있습니다'}</h2>
          <p>
            {isGroupTab 
              ? '모임에 참여하여 첫 번째 모임 로켓을 만들어보세요!' 
              : '첫 번째 로켓을 만들어 시간여행을 시작해 보세요!'
            }
          </p>
          <button 
            onClick={() => navigate(isGroupTab ? '/groups' : '/rockets/create')} 
            className="create-rocket-btn"
          >
            {isGroupTab ? '모임 둘러보기' : '새 로켓 만들기'}
          </button>
        </div>
      )}

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

      {isModalOpen && selectedRocket && (
        <div className="rocket-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className={`rocket-modal ${isGroupTab ? 'group-rocket-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
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
                {isGroupTab && (
                  <div className="group-modal-badge">
                    <GroupIcon /> 모임 로켓
                  </div>
                )}
              </div>

              <div className="rocket-modal-details">
                {isGroupTab ? (
                  <>
                    <p className="group-name">
                      <strong>모임:</strong> {selectedRocket.groupName || '알 수 없음'}
                    </p>
                    <p className="rocket-sent-at">
                      <strong>생성 시간:</strong> {formatDate(selectedRocket.sentAt)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="rocket-sender">
                      <strong>보낸 사람:</strong> {selectedRocket.senderEmail || '알 수 없음'}
                    </p>
                    <p className="rocket-receiver">
                      <strong>받는 사람:</strong> {selectedRocket.receiverEmail || selectedRocket.receiverNickname || '알 수 없음'}
                    </p>
                    <p className="rocket-sent-at">
                      <strong>{isSentTab ? '보낸 시간:' : '받은 시간:'}</strong> {formatDate(selectedRocket.sentAt || selectedRocket.createdAt)}
                    </p>
                  </>
                )}

                <ModalContent 
                  selectedRocket={selectedRocket}
                  isSentTab={isSentTab}
                  isGroupTab={isGroupTab}
                  idKey={idKey}
                  handleUnlockManually={handleUnlockManually}
                  toggleVisibility={toggleVisibility}
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

export default RocketChest;
