import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import useAuthStore from '../authStore';
import api from '../utils/api';
import '../style/RocketChest.css';
import { LockIcon, UserIcon, SearchIcon, CloseIcon } from '../components/ui/Icons';

// API 경로 상수화
const API_PATHS = {
  CHESTS: '/chests',
  CHESTS_USERS: '/chests/users',
  DISPLAYS: '/displays',
  ROCKETS: '/rockets'
};

const RocketChest = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const isFetchingRef = useRef(false);

  // 로켓 데이터 상태
  const [rockets, setRockets] = useState([]);
  const [totalRockets, setTotalRockets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI 상태
  const [activeTab, setActiveTab] = useState('received');
  // 받은 로켓함의 하위 탭 상태 추가
  const [receivedSubTab, setReceivedSubTab] = useState('self'); // 'self' 또는 'other'
  const [sortOrder, setSortOrder] = useState('desc'); // 기본값을 desc로 설정 (최신순)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [rocketsToDelete, setRocketsToDelete] = useState([]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [rocketDetailLoading, setRocketDetailLoading] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1); // 페이지 번호는 1부터 시작 (백엔드)
  const [totalPages, setTotalPages] = useState(0);

  // 시간 갱신을 위한 타이머
  const [, setTimer] = useState(0);

  // 진열장 관련 상태 추가
  const [addToDisplayModal, setAddToDisplayModal] = useState(false);
  const [rocketToDisplay, setRocketToDisplay] = useState(null);

  // 페이지 로드 시 인증 검사
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 데이터 로드
  useEffect(() => {
    if (!userId) return;

    const fetchRockets = async () => {
      if (isFetchingRef.current) return; // 가드
      isFetchingRef.current = true;

      setIsLoading(true);
      try {
        console.log("API 요청 시작 - 사용자 ID:", userId);

        // 백엔드 API 요청 형식에 맞게 파라미터 설정
        const params = {
          page: currentPage,
          size: 10,
          sort: 'chestId',  // 기본 정렬 필드
          order: sortOrder, // 정렬 방향 적용
          rocketName: searchTerm.trim() || undefined
        };

        // 탭과 하위 탭에 따른 type/receiverType 설정
        let type = 'received';
        let receiverType;

        if (activeTab === 'received') {
          type = 'received';
          receiverType = receivedSubTab; // self or other
        } else if (activeTab === 'sent') {
          type = 'sent';
          // sent는 receiverType 없음
        } else if (activeTab === 'group') {
          type = 'received';
          receiverType = 'group';
        }

        // 요청 파라미터 조립
        const requestParams = {
          ...params,
          type,
        };

        if (receiverType !== undefined) {
          requestParams.receiverType = receiverType;
        }

        // API 요청 보내기
        const response = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}`, {
          params: {
            ...params,
            type,
            receiverType
          }
        });

        console.log(`${activeTab} 응답:`, response);

        // 응답 구조 처리
        if (response.data && response.data.data) {
          setRockets(response.data.data.chests || []);
          setTotalPages(response.data.data.totalPages || 0);
          setTotalRockets(response.data.data.totalElements || 0); // 추가
        } else {
          setRockets([]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('로켓 데이터 로드 실패:', err);
        if (err.response && err.response.status === 404) {
          // 404는 데이터가 없는 경우로 처리
          setRockets([]);
        } else {
          setError('로켓 데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        isFetchingRef.current = false;  // 반드시 해제
        setIsLoading(false);            // 로딩 상태도 해제
      }
    };

    fetchRockets();

    // 1초마다 시간 업데이트 (남은 시간 계산을 위해)
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [userId, currentPage, activeTab, receivedSubTab, sortOrder, isSearchMode, searchTerm]);

  // 로켓 잠금 해제 함수 추가
  const unlockRocket = async (rocketId) => {
    try {
      console.log(`로켓 잠금 해제 요청 - rocketId: ${rocketId}`);

      // 백엔드의 unlockRocket API 호출
      const response = await api.patch(`${API_PATHS.ROCKETS}/${rocketId}/unlock`);

      console.log('로켓 잠금 해제 응답:', response);

      if (response.data && response.status === 200) {
        return true;
      }
      return false;
    } catch (err) {
      console.error('로켓 잠금 해제 실패:', err);
      console.error('오류 세부 정보:', err.response || err);

      let errorMessage = '로켓 잠금 해제에 실패했습니다.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      // 잠금 해제일이 아직 지나지 않은 경우
      if (errorMessage.includes('잠금 해제일이 아직 지나지 않았습니다')) {
        return { locked: true, message: '아직 잠금 해제일이 지나지 않았습니다.' };
      }

      return { locked: true, message: errorMessage };
    }
  };

  // 로켓 상세 정보 조회 (수정됨)
  const fetchRocketDetail = async (chestId) => {
    try {
      setRocketDetailLoading(true);

      const response = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}/details/${chestId}`);
      if (!response.data || !response.data.data) {
        throw new Error('데이터 형식이 올바르지 않습니다.');
      }

      const detailData = response.data.data;
      const files = detailData.rocketFiles || detailData.files || [];

      setRocketDetailLoading(false);

      return {
        ...detailData,
        files,
        content: detailData.content || '',
        rocketFiles: files,
        // 잠금 상태는 서버 응답값 그대로 사용
        isLocked: detailData.isLocked
      };
    } catch (err) {
      console.error('로켓 상세 정보 조회 실패:', err);
      setRocketDetailLoading(false);
      throw err;
    }
  };

  const handleUnlockManually = async (rocketId) => {
    try {
      const response = await api.patch(`/rockets/${rocketId}/unlocked-rocket`);
      if (response.status === 200) {
        alert('로켓이 성공적으로 잠금 해제되었습니다.');

        // 상태 업데이트
        setSelectedRocket(prev => ({
          ...prev,
          isLocked: false
        }));

        // 목록에도 반영
        setRockets(prev =>
          prev.map(r => r.rocketId === rocketId ? { ...r, isLocked: false } : r)
        );
      }
    } catch (err) {
      console.error('잠금 해제 실패:', err);
      alert('잠금 해제에 실패했습니다.');
    }
  };
  // 로켓 공개 여부 토글 
  const toggleRocketVisibility = async (chestId) => {
    try {
      const currentRocket = rockets.find(r => r.chestId === chestId) ||
        selectedRocket || rocketToDisplay;

      if (!currentRocket) {
        alert('로켓 정보를 찾을 수 없습니다.');
        return false;
      }

      // 수동 잠금 해제를 사용하므로 클라이언트에서 잠금 상태만 확인
      if (currentRocket.isLocked) {
        alert('이 로켓은 잠금 상태입니다. 먼저 잠금을 해제해주세요.');
        return false;
      }

      const response = await api.patch(`${API_PATHS.CHESTS}/${chestId}/visibility`);

      if (response.data && response.status === 200) {
        const newIsPublic = !currentRocket.isPublic;

        setRockets(prevRockets => prevRockets.map(rocket =>
          rocket.chestId === chestId
            ? { ...rocket, isPublic: newIsPublic }
            : rocket
        ));

        if (selectedRocket?.chestId === chestId) {
          setSelectedRocket(prev => ({
            ...prev,
            isPublic: newIsPublic
          }));
        }

        if (rocketToDisplay?.chestId === chestId) {
          setRocketToDisplay(prev => ({
            ...prev,
            isPublic: newIsPublic
          }));
        }

        alert(newIsPublic ? '로켓이 진열장에 추가되었습니다.' : '로켓이 진열장에서 제거되었습니다.');

        if (newIsPublic) {
          setTimeout(() => {
            navigate('/display');
          }, 1000);
        }

        return true;
      }

      return false;
    } catch (err) {
      console.error('로켓 공개 설정 변경 실패:', err);
      alert('로켓 공개 설정을 변경하는데 실패했습니다.');
      return false;
    }
  };

  // 모달 내 진열장 추가 버튼 클릭 핸들러
  const handleDisplayButton = async () => {
    // 이미 공개 상태인 경우 진열장에서 제거
    if (selectedRocket.isPublic) {
      await toggleRocketVisibility(selectedRocket.chestId);
      return;
    }

    // 잠금 상태 확인
    const { isUnlocked } = calculateTimeRemaining(selectedRocket.lockExpiredAt);

    if (!isUnlocked) {
      alert('이 로켓은 아직 잠금 상태입니다. 잠금 해제 시간이 지나야 진열장에 추가할 수 있습니다.');
      return;
    }

    // 잠금 해제 및 공개 상태 변경
    try {
      // 먼저 잠금 해제 시도
      const unlockResult = await unlockRocket(selectedRocket.rocketId);

      if (unlockResult && unlockResult.locked) {
        alert(unlockResult.message || '로켓 잠금 해제에 실패했습니다.');
        return;
      }

      // 공개 상태로 변경
      await toggleRocketVisibility(selectedRocket.chestId);

    } catch (error) {
      console.error('진열장 추가 과정 오류:', error);
      alert('진열장 추가 중 오류가 발생했습니다.');
    }
  };

  // UI에서 공개 여부 토글 버튼 클릭 처리
  const handleToggleVisibility = async (e, chestId) => {
    e.preventDefault();
    e.stopPropagation();

    // toggleRocketVisibility 함수 호출
    await toggleRocketVisibility(chestId);
  };

  // 선택한 로켓 삭제
  const deleteSingleRocket = async (chestId) => {
    if (!window.confirm('이 로켓을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
      return;
    }

    try {
      // DELETE 요청으로 변경 - 실제 DB 삭제 수행
      const response = await api.delete(`${API_PATHS.CHESTS}/${chestId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`로켓 ${chestId} 삭제 응답:`, response);

      // UI에서도 제거 (DB에서도 실제로 삭제됨)
      setRockets(prevRockets => prevRockets.filter(rocket => rocket.chestId !== chestId));
      setIsModalOpen(false);
      alert('로켓이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('로켓 삭제 실패:', err);

      // 외래 키 제약조건 오류 처리
      if (err.response && err.response.status === 500 &&
        err.response.data && err.response.data.message &&
        err.response.data.message.includes('foreign key constraint')) {

        // 외래 키 제약조건 문제 해결을 위한 대안적 방법 제시
        alert('이 로켓은 다른 테이블에서 참조하고 있어 삭제할 수 없습니다. 먼저 관련된 항목을 삭제해주세요.');
      } else {
        alert(`로켓 삭제에 실패했습니다: ${err.response?.data?.message || '서버 오류'}`);
      }
    }
  };

  // 여러 로켓 삭제
  const deleteSelectedRockets = async () => {
    if (rocketsToDelete.length === 0) {
      alert('삭제할 로켓을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${rocketsToDelete.length}개의 로켓을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.`)) {
      return;
    }

    try {
      // 각각 개별적으로 DELETE 요청 보내기
      const deletePromises = rocketsToDelete.map(chestId =>
        api.delete(`${API_PATHS.CHESTS}/${chestId}`)
      );

      await Promise.all(deletePromises);

      // UI에서 삭제된 로켓 제거
      setRockets(rockets.filter(rocket => !rocketsToDelete.includes(rocket.chestId)));
      setRocketsToDelete([]);
      setIsDeleteMode(false);

      alert('선택한 로켓이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('로켓 삭제 실패:', err);

      if (err.response && err.response.status === 500 &&
        err.response.data && err.response.data.message &&
        err.response.data.message.includes('foreign key constraint')) {

        alert('일부 로켓은 다른 테이블에서 참조하고 있어 삭제할 수 없습니다. 먼저 관련된 항목을 삭제해주세요.');
      } else {
        alert(`로켓 삭제에 실패했습니다: ${err.response?.data?.message || '서버 오류'}`);
      }
    }
  };

  // 남은 시간 계산 함수
  const calculateTimeRemaining = async (unlockDate, rocketId) => {
    if (!unlockDate) {
      return { isUnlocked: true, timeString: '오픈 가능' };
    }

    const now = new Date();
    const targetDate = new Date(unlockDate);
    const diff = targetDate - now;

    if (diff <= 0 || isNaN(diff)) {
      return { isUnlocked: true, timeString: '오픈 가능' };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      isUnlocked: false,
      timeString: `${days.toString().padStart(2, '0')} : ${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`
    };
  };


  // 현재 탭에 따른 로켓 데이터 가져오기
  const getCurrentRockets = () => {
    return rockets;
  };

  // 검색 핸들러 - 검색 시 아예 새로운 API 요청을 보내도록 수정
  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearchMode(true); // 검색 모드 활성화
    setCurrentPage(1); // 페이지 초기화
  };

  // 검색 초기화
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setCurrentPage(1); // 페이지 초기화
  };

  // 로켓 클릭 처리 (수정됨)
  const handleRocketClick = async (rocket) => {
    const chestId = rocket.chestId;

    if (isDeleteMode) {
      // 삭제 모드일 때 오픈 가능한 로켓만 선택 가능
      const { isUnlocked } = calculateTimeRemaining(rocket.lockExpiredAt);
      if (isUnlocked) {
        if (rocketsToDelete.includes(chestId)) {
          setRocketsToDelete(rocketsToDelete.filter(id => id !== chestId));
        } else {
          setRocketsToDelete([...rocketsToDelete, chestId]);
        }
      }
      return;
    }

    // 상세 정보 가져오기
    try {
      console.log('클릭한 로켓 기본 정보:', rocket);

      // 먼저 모달을 열고 로딩 상태 표시
      setSelectedRocket({
        ...rocket,
        loading: true
      });
      setIsModalOpen(true);

      // 상세 정보 로드 
      const detailData = await fetchRocketDetail(chestId);
      console.log('로드된 상세 정보:', detailData);

      // 상세 정보가 로드되면 선택한 로켓 정보 업데이트
      setSelectedRocket(prev => {
        const updated = {
          ...prev,
          ...detailData,
          loading: false,
          // 필수 필드 확실하게 처리
          content: detailData.content || prev.content || '',
          files: detailData.files || detailData.rocketFiles || [],
          rocketFiles: detailData.files || detailData.rocketFiles || []
        };
        console.log('업데이트된 로켓 정보:', updated);
        return updated;
      });
    } catch (err) {
      console.error("로켓 상세 정보 가져오기 실패", err);

      // 에러 상태 설정
      setSelectedRocket(prevRocket => ({
        ...prevRocket,
        loading: false,
        loadError: true
      }));

      alert("로켓 정보를 가져오는데 실패했습니다.");
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
      switch (design) {
        case 'A':
          return '/src/assets/디자인 A.jpg';
        case 'B':
          return '/src/assets/디자인 B.jpg';
        case 'C':
          return '/src/assets/디자인 C.jpg';
        default:
          // 디자인 문자열이 경로인 경우 그대로 사용
          return design;
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
      return '날짜 포맷 오류';
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 파일 다운로드 처리
  const handleFileDownload = (fileId, fileName) => {
    // 새 탭에서 다운로드 API 호출 (브라우저가 자동으로 다운로드 처리)
    window.open(`/api/files/download/${fileId}`, '_blank');
  };

  // 진열장에 로켓 추가 함수 (수정됨)
  const handleAddToDisplay = (e, rocket) => {
    e.preventDefault(); // 기본 컨텍스트 메뉴 방지
    e.stopPropagation(); // 상위 요소로 이벤트 전파 방지

    // 잠금 상태 확인
    const { isUnlocked } = calculateTimeRemaining(rocket.lockExpiredAt);
    if (!isUnlocked) {
      alert('아직 잠금이 해제되지 않은 로켓은 진열할 수 없습니다.');
      return;
    }

    // 선택한 로켓 정보 설정 (진열장 추가 모달 띄우지 않고 바로 처리)
    setRocketToDisplay(rocket);

    // 직접 토글 함수 호출하여 처리
    toggleRocketVisibility(rocket.chestId);
  };

  if (error) {
    return (
      <div className="rocket-chest-error">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  const currentRockets = getCurrentRockets();

  return (
    <div className="rocket-chest-container">
      <div className="rocket-chest-header">
        <h1>로켓 보관함</h1>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('received');
              clearSearch();
              setIsDeleteMode(false);
              setRocketsToDelete([]);
              setCurrentPage(1); // 탭 전환 시 첫 페이지로 이동
            }}
          >
            받은 로켓함
          </button>
          <button
            className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('sent');
              clearSearch();
              setIsDeleteMode(false);
              setRocketsToDelete([]);
              setCurrentPage(1); // 탭 전환 시 첫 페이지로 이동
            }}
          >
            보낸 로켓함
          </button>
          <button
            className={`tab-button ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('group');
              clearSearch();
              setIsDeleteMode(false);
              setRocketsToDelete([]);
              setCurrentPage(1); // 탭 전환 시 첫 페이지로 이동
            }}
          >
            모임 로켓함
          </button>
        </div>
        {/* 받은 로켓함일 때 하위 탭 */}
        {activeTab === 'received' && (
          <div className="sub-tab-navigation">
            <button
              className={`sub-tab-button ${receivedSubTab === 'self' ? 'active' : ''}`}
              onClick={() => {
                setReceivedSubTab('self');
                setCurrentPage(1);
              }}
            >
              나에게
            </button>
            <button
              className={`sub-tab-button ${receivedSubTab === 'other' ? 'active' : ''}`}
              onClick={() => {
                setReceivedSubTab('other');
                setCurrentPage(1);
              }}
            >
              다른 사람에게
            </button>
          </div>
        )}
      </div>

      <div className="rocket-chest-controls">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="로켓 이름으로 검색..."
            />
            <button type="submit" className="search-button">
              <SearchIcon />
            </button>
            {isSearchMode && searchTerm && (
              <button type="button" className="clear-search" onClick={clearSearch}>
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
                setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
              }}
            >
              <option value="desc">최신 순</option>
              <option value="asc">오래된 순</option>
            </select>
          </div>

          <button
            className={`control-button delete ${isDeleteMode ? 'active' : ''}`}
            onClick={() => {
              if (isDeleteMode && rocketsToDelete.length > 0) {
                deleteSelectedRockets();
              } else {
                setIsDeleteMode(!isDeleteMode);
                setRocketsToDelete([]);
              }
            }}
          >
            {isDeleteMode ? (rocketsToDelete.length > 0 ? '삭제하기' : '취소') : '삭제하기'}
          </button>
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

      <div className="rockets-count">
        총 {totalRockets}개의 로켓이 있습니다
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>로켓 데이터를 불러오는 중...</p>
        </div>
      ) : currentRockets.length > 0 ? (
        <div className="rockets-grid">
          {currentRockets.map((rocket) => {
            const chestId = rocket.chestId;
            const { isUnlocked, timeString } = calculateTimeRemaining(rocket.lockExpiredAt);
            const isSelected = rocketsToDelete.includes(chestId);

            return (
              <div
                key={chestId}
                className={`rocket-item ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleRocketClick(rocket)}
                onContextMenu={(e) => isDeleteMode ? null : handleAddToDisplay(e, rocket)}
              >
                <div className="rocket-image">
                  <img
                    src={getRocketDesignImage(rocket.designUrl || rocket.design)}
                    alt={rocket.rocketName}
                    onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
                  />
                  {rocket.isPublic && <div className="public-badge">공개</div>}
                  {isDeleteMode && isUnlocked && (
                    <div className="delete-checkbox">
                      {isSelected ? '✓' : ''}
                    </div>
                  )}
                </div>
                <div className="rocket-details">
                  <h3 className="rocket-name">{rocket.rocketName}</h3>
                  <div className="rocket-sender">
                    <UserIcon /> {rocket.senderEmail || rocket.receiverEmail || '관련 사용자'}
                  </div>
                  <div className={`rocket-time ${isUnlocked ? 'unlocked' : ''}`}>
                    {isUnlocked ? (
                      <span className="unlocked-text">{timeString}</span>
                    ) : (
                      <>
                        <LockIcon /> <span>{timeString}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
            onClick={() => handlePageChange(currentPage - 1)}
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}

          <button
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
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

            <h2>{selectedRocket.rocketName}</h2>

            <div className="rocket-modal-content">
              <div className="rocket-modal-image">
                <img
                  src={getRocketDesignImage(selectedRocket.designUrl || selectedRocket.design)}
                  alt={selectedRocket.rocketName}
                  onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
                />
              </div>

              <div className="rocket-modal-details">
                <p className="rocket-sender">
                  <strong>보낸 사람:</strong> {selectedRocket.senderEmail || '알 수 없음'}
                </p>
                <p className="rocket-receiver">
                  <strong>받는 사람:</strong> {selectedRocket.receiverEmail || '알 수 없음'}
                </p>
                <p className="rocket-sent-at">
                  <strong>받은 시간:</strong> {formatDate(selectedRocket.sentAt || selectedRocket.createdAt)}
                </p>

                {(() => {
                  const locked = selectedRocket?.isLocked; // 수동 잠금 여부로 판단

                  return !locked ? (
                    selectedRocket.loading ? (
                      <div className="loading-content">
                        <div className="loading-spinner-sm"></div>
                        <p>로켓 내용을 불러오는 중...</p>
                      </div>
                    ) : (
                      <>
                        {/* 공개 상태 토글 버튼 */}
                        <div className="visibility-toggle">
                          <span>공개 상태: </span>
                          <button
                            className={`toggle-button ${selectedRocket.isPublic ? 'public' : 'private'}`}
                            onClick={handleDisplayButton}
                          >
                            {selectedRocket.isPublic ? '공개' : '비공개'}
                          </button>
                          <small>(진열장에 추가하려면 공개 상태로 설정해야 합니다)</small>
                        </div>

                        <div className="rocket-message">
                          <h3>메시지</h3>
                          <div className="message-content">
                            {selectedRocket.content || '내용이 없습니다.'}
                          </div>
                        </div>

                        {/* 파일 목록 출력 */}
                        {(() => {
                          const filesList = selectedRocket.files || selectedRocket.rocketFiles || [];
                          return filesList.length > 0 ? (
                            <div className="rocket-attachments">
                              <h3>첨부 파일 ({filesList.length}개)</h3>
                              <ul className="files-list">
                                {filesList.map((file, index) => (
                                  <li key={index} className="file-item">
                                    <span className="file-name">{file.originalName || file.name || `파일 ${index + 1}`}</span>
                                    <button
                                      className="download-button"
                                      onClick={() => handleFileDownload(file.fileId || file.id, file.originalName || file.name)}
                                    >
                                      다운로드
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="no-attachments">첨부 파일이 없습니다.</p>
                          );
                        })()}

                        <div className="rocket-actions">
                          <button
                            className="display-button"
                            onClick={handleDisplayButton}
                          >
                            {selectedRocket.isPublic ? '진열장에서 제거' : '진열장에 추가'}
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => deleteSingleRocket(selectedRocket.chestId)}
                          >
                            로켓 삭제
                          </button>
                        </div>
                      </>
                    )
                  ) : (
                    <div className="rocket-locked">
                      <div className="lock-icon"></div>
                      <p>이 로켓은 현재 잠겨 있습니다.</p>

                      {/* 남은 시간 계산 및 표시 */}
                      {(() => {
                        const { timeString } = calculateTimeRemaining(selectedRocket.unlockDate);
                        return <p>남은 시간: {timeString}</p>;
                      })()}

                      <button
                        className="unlock-button"
                        onClick={() => handleUnlockManually(selectedRocket.rocketId)}
                      >
                        🔓 잠금 해제
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RocketChest;