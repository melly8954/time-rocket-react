import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import '../style/RocketChest.css';
import { LockIcon, UserIcon, SearchIcon, CloseIcon, GroupIcon } from '../components/ui/Icons';
import { ConfirmModal, AlertModal } from '../components/common/Modal';
import useAlertModal from '../components/common/useAlertModal';
import useConfirmModal from '../components/common/useConfirmModal';

// 경로명 분리
const API_PATHS = {
  RECEIVED_CHESTS: '/received-chests',
  SENT_CHESTS: '/sent-chests',
  ROCKETS: '/rockets',
  GROUP_CHESTS: '/group-chests'
};

// 보관함 로켓 아이템 컴포넌트
const RocketItem = ({ rocket, idKey, isSentTab, isGroupTab, onClick, onContextMenu, isSelected, isDeleteMode, timerTick }) => {
  const [timeDisplay, setTimeDisplay] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeStatus, setTimeStatus] = useState('');

  // 보관함 리스트의 로켓 아이템의 잠금 해제일까지 남은시간 표기
  useEffect(() => {
    const lockStatus = !!(
      isGroupTab
        ? rocket.isLock
        : rocket.isLocked ?? rocket.isLock
    );

    if (!rocket.lockExpiredAt) {
      setIsUnlocked(false);
      setTimeDisplay('시간 정보 없음');
      setTimeStatus('');
      return;
    }

    const now = new Date();
    const targetDate = new Date(rocket.lockExpiredAt);
    const isExpired = targetDate <= now;

    if (isSentTab) {
      setIsUnlocked(true);
      setTimeDisplay('전송 완료');
      setTimeStatus('');
    } else {
      // 받은 탭에서 처리 시작
      if (!lockStatus || lockStatus === 0) {
        // 잠금이 안 걸린 경우: 오픈 완료
        setIsUnlocked(true);
        setTimeDisplay('오픈 완료');
        setTimeStatus('');
      } else if (isExpired) {
        // 잠금은 걸려있지만 시간이 만료된 경우
        setIsUnlocked(false); // 클릭으로 해제할 수 있음
        setTimeDisplay('오픈 가능');
        setTimeStatus('클릭하여 잠금 해제');
      } else {
        // 아직 시간이 남은 상태 (잠금 유지 중)
        setIsUnlocked(false);
        setTimeDisplay(calculateCountdown(rocket.lockExpiredAt));
        setTimeStatus(formatLockDeadline(rocket.lockExpiredAt));
      }
    }
  }, [rocket.lockExpiredAt, rocket.isLock, rocket.isLocked, isSentTab, isGroupTab, timerTick]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isSentTab || isGroupTab) return;
    if (isUnlocked && onContextMenu) {
      onContextMenu(e, rocket);
    }
  };

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
          {isGroupTab ? (
            <><GroupIcon /> {rocket.groupName || '모임 정보 없음'}</>
          ) : (
            <><UserIcon /> {isSentTab ? (rocket.receiverEmail || '수신자 정보 없음') : (rocket.senderEmail || rocket.senderName || '발신자 정보 없음')}</>
          )}
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
                <LockIcon style={{ color: '#ff5722', marginRight: '4px' }} />
                <span style={{ color: '#ff9800', fontWeight: 'bold' }}>{timeDisplay}</span>
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

// 보관함 로켓 아이템 상세화면 컴포넌트
const RocketItemDetail = ({
  selectedRocket,
  activeTab,
  isSentTab,
  isGroupTab,
  idKey,
  handleUnlockManually,
  handleUnlockGroupRocket,
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

  const lockStatus = isGroupTab ? selectedRocket.isLock : Number(selectedRocket.isLocked !== undefined ? selectedRocket.isLocked : selectedRocket.isLock || 0);
  const isLocked = lockStatus === 1 || lockStatus === true;

  if (!isLocked) {
    return (
      <>
        {isGroupTab ? (
          <div className="group-rocket-contents">
            <h3>모임원들의 메시지</h3>
            {renderContents()}
          </div>
        ) : (
          <div className="rocket-message">
            <h3>메시지</h3>
            <div className="message-content">
              {selectedRocket.content || '내용이 없습니다.'}
            </div>
          </div>
        )}
        {renderFiles()}
        <div className="rocket-actions">
          {activeTab === 'received' && (
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

  // 보낸 탭이면서 모임 탭이 아닌 경우: 단순 전송 완료 메시지만 표시
  if (isSentTab && !isGroupTab) {
    return (
      <div className="rocket-locked">
        <div className="lock-icon"></div>
        <p>이 로켓은 아직 수신자가 열어보지 않았습니다.</p>
        <p className="waiting-message">수신자가 열람할 때까지 기다려주세요.</p>
        <div className="rocket-actions">
          <button className="delete-button" onClick={() => deleteSingleRocket(selectedRocket[idKey])}>
            로켓 삭제
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const targetDate = new Date(selectedRocket.lockExpiredAt);
  const timeExpired = targetDate <= now;

  // 시간이 만료된 경우 - 잠금 해제 가능
  if (timeExpired) {
    if (isGroupTab) {
      return (
        <div className="rocket-locked rocket-unlockable">
          <div className="lock-icon"></div>
          <p>모임 로켓 잠금 해제가 가능합니다.</p>
          <button
            className="unlock-button"
            onClick={() => handleUnlockGroupRocket(selectedRocket[idKey])}
          >
            🔓 모임 로켓 열기
          </button>
        </div>
      );
    } else {
      return (
        <div className="rocket-locked rocket-unlockable">
          <div className="lock-icon"></div>
          <p>로켓 잠금 해제가 가능합니다.</p>
          <button
            className="unlock-button"
            onClick={() => handleUnlockManually(selectedRocket.rocketId)}
          >
            🔓 잠금 해제하기
          </button>
        </div>
      );
    }
  }

  return (
    <div className="rocket-locked">
      <div className="lock-icon"></div>
      <p>이 {isGroupTab ? '모임 ' : ''}로켓은 현재 잠겨 있습니다.</p>
      <p className="countdown">남은 시간: {calculateCountdown(selectedRocket.lockExpiredAt)}</p>
      <p className="waiting-message">
        {isGroupTab ? '잠금 해제 시간이 되면 자동으로 열립니다.' : '잠금 해제 시간이 되면 버튼이 나타납니다.'}
      </p>
    </div>
  );
};

// 보관함 전체 컴포넌트
const RocketChest = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const isFetchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  const { alertModal, showAlert, closeAlert, handleApiError } = useAlertModal();
  const { confirmModal, showConfirm, closeConfirm } = useConfirmModal();
  const [rockets, setRockets] = useState([]);
  const [totalRockets, setTotalRockets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received');
  const [receivedSubTab, setReceivedSubTab] = useState('self');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchRocketName, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [rocketsToDelete, setRocketsToDelete] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [timerTick, setTimerTick] = useState(0);

  const isSentTab = activeTab === 'sent';
  const isGroupTab = activeTab === 'group';
  const idKey = isSentTab ? 'sentChestId' : isGroupTab ? 'groupChestId' : 'receivedChestId';

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
    const timer = setInterval(() => setTimerTick(tick => tick + 1), 1000);
    return () => clearInterval(timer);
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!userId) return;
    fetchChestList();
  }, [userId, currentPage, activeTab, receivedSubTab, sortOrder]);

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    if (searchRocketName.trim() === '') {
      if (isSearchMode) {
        setIsSearchMode(false);
        fetchChestList();
      }
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchMode(true);
      setCurrentPage(1);
      fetchChestList();
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchRocketName]);

  const fetchChestList = useCallback(async () => {
    if (isFetchingRef.current) return;

    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;
    setIsLoading(true);

    try {
      const params = {
        page: currentPage,
        size: 10,
        sort: isGroupTab ? 'groupChestId' : isSentTab ? 'sentChestId' : 'receivedChestId',
        order: sortOrder
      };

      if (searchRocketName.trim()) {
        params[isGroupTab ? 'group-rocket-name' : 'rocket-name'] = searchRocketName.trim();
      }

      if (activeTab === 'received') {
        params.receiverType = receivedSubTab;
      }

      const apiUrl = isGroupTab ? API_PATHS.GROUP_CHESTS : isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS;
      const response = await api.get(apiUrl, { params });

      // 비동기 함수에서 여러 번 API 요청 시 중복되거나 오래된 요청의 결과를 무시하기 위한 안전 장치
      if (isFetchingRef.current !== currentFetchId) return;

      if (response.data?.data) {
        const data = response.data.data;
        const rocketsList = isGroupTab
          ? data.groupChests
          : isSentTab
            ? data.sentChests
            : data.receivedChests;

        setRockets(rocketsList || []);
        setTotalPages(data.totalPages || 0);
        setTotalRockets(data.totalElements || 0);
        setError(null);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      handleApiError(err);
      setRockets([]);         // 로켓 리스트 초기화 -> 빈 화면 표시 조건 충족
      setTotalPages(0);       // 필요 시 페이지 정보 초기화
      setTotalRockets(0);     // 필요 시 총 개수 초기화
    } finally {
      // 중복 요청으로 인해 상태가 꼬이는 것을 방지하기 위한 안전장치
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [activeTab, currentPage, isSentTab, isGroupTab, receivedSubTab, searchRocketName, sortOrder]);

  const fetchChestDetail = useCallback(async (rocket) => {
    try {
      const detailId = rocket[idKey];
      if (!detailId) throw new Error('로켓 세부 정보를 가져올 수 없습니다.');

      let apiUrl = "";
      if (isGroupTab) {
        apiUrl = `${API_PATHS.GROUP_CHESTS}/${detailId}`;
      } else if (isSentTab) {
        apiUrl = `${API_PATHS.SENT_CHESTS}/${detailId}`;
      } else {
        apiUrl = `${API_PATHS.RECEIVED_CHESTS}/${detailId}`;
      }
      const response = await api.get(apiUrl);
      const data = response.data.data;
      return {
        ...data,
        files: data.rocketFiles || data.files || [],
        contents: data.contents || [],
      };
    } catch (err) {
      handleApiError(err);
      return {
        files: [],
        contents: [],
      };
    }
  }, [idKey, isSentTab, isGroupTab]);

  const handleUnlockManually = useCallback(async (rocketId) => {
    if (!rocketId) return;

    try {
      await api.patch(`${API_PATHS.ROCKETS}/${rocketId}/unlock`);

      // 잠금 해제 후 fetchChestDetail로 최신 정보 다시 받아오기
      const unlockedRocket = rockets.find(r => r.rocketId === rocketId);
      if (!unlockedRocket) return;

      const updatedDetail = await fetchChestDetail(unlockedRocket);

      // selectedRocket과 rockets 리스트 둘 다 업데이트
      setSelectedRocket({ ...unlockedRocket, ...updatedDetail, isLock: 0, isLocked: false, loading: false });
      setRockets(prev => prev.map(r => r.rocketId === rocketId ? { ...r, isLock: 0, isLocked: false } : r));

      showAlert('로켓이 성공적으로 잠금 해제되었습니다.');
    } catch (err) {
      handleApiError(err);
    }
  }, [fetchChestDetail, rockets]);

  const handleUnlockGroupRocket = useCallback(async (groupChestId) => {
    if (!groupChestId) return;

    try {
      const groupId = selectedRocket?.groupId;
      const groupRocketId = selectedRocket?.groupRocketId;

      // 바로 올바른 ID로 호출 (첫 번째 실패하는 호출 제거)
      await api.patch(`/groups/${groupId}/rockets/${groupRocketId}/unlock`);
      // 잠금 해제 후 상세정보 새로 받아오기
      const unlockedRocket = rockets.find(r => r[idKey] === groupChestId);
      if (!unlockedRocket) return;

      const updatedDetail = await fetchChestDetail(unlockedRocket);

      setSelectedRocket({ ...unlockedRocket, ...updatedDetail, isLock: 0, isLocked: false, loading: false });
      setRockets(prev => prev.map(r => r[idKey] === groupChestId ? { ...r, isLock: 0, isLocked: false } : r));

      showAlert('모임 로켓이 성공적으로 잠금 해제되었습니다.');
    } catch (err) {
      handleApiError(err);
    }
  }, [selectedRocket, rockets, idKey, fetchChestDetail]);

  const toggleVisibility = useCallback(async (chestId) => {
    if (!chestId) return;

    try {
      const apiUrl = isGroupTab ? `${API_PATHS.GROUP_CHESTS}/${chestId}/visibility` : `${API_PATHS.RECEIVED_CHESTS}/${chestId}/visibility`;
      await api.patch(apiUrl);

      const currentRocket = rockets.find(r => r[idKey] === chestId) || selectedRocket;
      const updatedIsPublic = !currentRocket.isPublic;

      setRockets(prev => prev.map(r => r[idKey] === chestId ? { ...r, isPublic: updatedIsPublic } : r));
      if (selectedRocket?.[idKey] === chestId) {
        setSelectedRocket(prev => ({ ...prev, isPublic: updatedIsPublic }));
      }

      fetchChestList();
      showAlert(updatedIsPublic ? '로켓이 진열장에 추가되었습니다.' : '로켓이 진열장에서 제거되었습니다.');

    } catch (error) {
      handleApiError(err);
    }
  }, [rockets, selectedRocket, idKey, isGroupTab, fetchChestList]);

  const deleteSingleRocket = useCallback(async (rocketId) => {
    if (!rocketId) return;

    showConfirm({
      title: '로켓 삭제',
      message: `해당 ${isGroupTab ? '모임 ' : ''}로켓을 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
      type: 'warning',
      onConfirm: async () => {
        try {
          const endpoint = isGroupTab
            ? `${API_PATHS.GROUP_CHESTS}/${rocketId}/deleted-flag`
            : `${isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS}/${rocketId}/deleted-flag`;

          await api.patch(endpoint);
          closeConfirm(); // 모달 닫기
          setIsModalOpen(false); // 상세 모달 닫기

          // 1. 삭제 후 예상 아이템 수 계산
          const nextCount = rockets.length - 1;
          const newTotal = totalRockets - 1;
          const maxPage = Math.ceil(newTotal / 10);

          // 2. 페이지 이동이 필요할 경우 처리
          if (nextCount === 0 && currentPage > 1) {
            setCurrentPage((prev) => Math.max(prev - 1, 1));
          } else {
            fetchChestList(); // 그냥 갱신
          }

          showAlert(`${isGroupTab ? '모임 ' : ''}로켓이 성공적으로 삭제되었습니다.`);
        } catch (err) {
          handleApiError(err);
        }
      }
    });
  }, [isSentTab, isGroupTab, fetchChestList, showConfirm, closeConfirm, rockets, currentPage, totalRockets]);

  const deleteSelectedRockets = useCallback(() => {
    if (rocketsToDelete.length === 0) return;
    const rocketType = isGroupTab ? '모임 로켓' : '로켓';

    showConfirm({
      title: '로켓 삭제',
      message: `선택한 ${rocketsToDelete.length}개의 ${rocketType}을 삭제하시겠습니까?`,
      confirmText: '삭제',
      cancelText: '취소',
      type: 'warning',
      onConfirm: async () => {
        try {
          const deletePromises = rocketsToDelete.map(rocketId => {
            const endpoint = isGroupTab
              ? `${API_PATHS.GROUP_CHESTS}/${rocketId}/deleted-flag`
              : `${isSentTab ? API_PATHS.SENT_CHESTS : API_PATHS.RECEIVED_CHESTS}/${rocketId}/deleted-flag`;
            return api.patch(endpoint);
          });

          await Promise.all(deletePromises);
          const deletedCount = rocketsToDelete.length;
          const remainingTotal = totalRockets - deletedCount;
          const newTotalPages = Math.ceil(remainingTotal / 10); // pageSize가 10일 경우

          // 현재 페이지가 더 이상 존재하지 않으면 이전 페이지로 이동
          if (currentPage > newTotalPages) {
            setCurrentPage(Math.max(1, currentPage - 1));
          } else {
            fetchChestList(); // 여전히 현재 페이지가 유효하면 바로 갱신
          }

          setIsModalOpen(false);
          setRocketsToDelete([]);
          setIsDeleteMode(false);
          showAlert(`선택한 ${rocketType}이 성공적으로 삭제되었습니다.`);
          closeConfirm();
        } catch (err) {
          handleApiError(err);
        }
      }
    });
  }, [rocketsToDelete, isSentTab, isGroupTab, fetchChestList, showConfirm, closeConfirm, currentPage, totalRockets]);

  const handleRocketClick = useCallback(async (rocket) => {
    const detailId = rocket[idKey];
    if (!detailId) return;

    if (isDeleteMode) {
      const canDelete =
        isSentTab || Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0) === 0;
      if (canDelete) {
        setRocketsToDelete(prev =>
          prev.includes(detailId) ? prev.filter(id => id !== detailId) : [...prev, detailId]
        );
      } else {
        showAlert("로켓의 잠금을 해제하셔야 삭제가 가능합니다.");
      }
      return;
    }

    try {
      setSelectedRocket({ ...rocket, loading: true });
      setIsModalOpen(true);
      const detailData = await fetchChestDetail(rocket);
      setSelectedRocket({ ...rocket, ...detailData, loading: false });
    } catch (err) {
      setSelectedRocket(prev => ({ ...prev, loading: false, loadError: true }));
      showAlert("로켓 정보를 가져오는데 실패했습니다.");
    }
  }, [idKey, isDeleteMode, isGroupTab, isSentTab, fetchChestDetail]);

  const handleContextMenu = useCallback((e, rocket) => {
    e.preventDefault();
    if (isSentTab || isGroupTab) return;
    const lockStatus = Number(rocket.isLocked !== undefined ? rocket.isLocked : rocket.isLock || 0);
    if (lockStatus !== 0) {
      alert('이 로켓은 잠금 상태입니다. 먼저 잠금을 해제해주세요.');
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
          <form onSubmit={(e) => { e.preventDefault(); setIsSearchMode(true); setCurrentPage(1); fetchChestList(); }}>
            <input
              type="text"
              value={searchRocketName}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`${isGroupTab ? '모임 ' : ''}로켓 이름으로 검색...`}
            />
            <button type="submit" className="search-button"><SearchIcon /></button>
            {isSearchMode && searchRocketName && (
              <button type="button" className="clear-search" onClick={() => {
                setSearchTerm('');
                setIsSearchMode(false);
                setCurrentPage(1);
                fetchChestList();
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
          <p>검색어: "{searchRocketName}" - {totalRockets}개의 {isGroupTab ? '모임 로켓' : '로켓'}을 찾았습니다</p>
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
              key={`${rocket[idKey]}-${index}`} // 고유한 key 생성
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
                    <p className="rocket-receiver">
                      <strong>받는 사람:</strong> {selectedRocket.receiverEmail || selectedRocket.receiverNickname || '알 수 없음'}
                    </p>
                    <p className="rocket-sent-at">
                      <strong>{isSentTab ? '보낸 시간:' : '받은 시간:'}</strong> {formatDate(selectedRocket.sentAt || selectedRocket.createdAt)}
                    </p>
                  </>
                )}

                <RocketItemDetail
                  selectedRocket={selectedRocket}
                  isSentTab={isSentTab}
                  isGroupTab={isGroupTab}
                  idKey={idKey}
                  handleUnlockManually={handleUnlockManually}
                  handleUnlockGroupRocket={handleUnlockGroupRocket}
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
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          closeAlert();
        }}
        message={alertModal.message}
        title={alertModal.title}
        type={alertModal.type}
      />
    </div>
  );
};

export default RocketChest;

const formatDate = dateString => {
  if (!dateString) return '정보 없음';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const calculateCountdown = (expireDate) => {
  if (!expireDate) return '00 : 00 : 00 : 00';

  const now = new Date();
  const target = new Date(expireDate);
  const diff = target - now;
  if (diff <= 0) return '00 : 00 : 00 : 00';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return [days, hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(' : ');
};

const formatLockDeadline = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + '까지';
};

const getDesignImage = (design) => {
  if (!design) return '/src/assets/rocket.png';
  if (design.startsWith('http') || design.includes('/src/assets/')) return design;
  return '/src/assets/rocket.png';
};

