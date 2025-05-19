import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import '../style/RocketChest.css';
import { LockIcon, UserIcon, SearchIcon, CloseIcon } from '../components/ui/Icons';

// API 경로 상수화 - /api 접두사 제거 (api 유틸리티의 baseURL이 이미 /api로 설정됨)
const API_PATHS = {
  CHESTS: '/chests',
  CHESTS_USERS: '/chests/users'
};

const RocketChest = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  
  // 로켓 데이터 상태
  const [myRockets, setMyRockets] = useState([]);
  const [receivedRockets, setReceivedRockets] = useState([]);
  const [podRockets, setPodRockets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI 상태
  const [activeTab, setActiveTab] = useState('myBase');
  const [sortOrder, setSortOrder] = useState('oldest');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isMovingMode, setIsMovingMode] = useState(false);
  const [selectedRocketId, setSelectedRocketId] = useState(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [rocketsToDelete, setRocketsToDelete] = useState([]);
  
  // 배치 이동을 위한 추가 상태
  const [firstSelectedRocket, setFirstSelectedRocket] = useState(null);
  const [secondSelectedRocket, setSecondSelectedRocket] = useState(null);
  const [rocketPositions, setRocketPositions] = useState({});
  const [initialRocketPositions, setInitialRocketPositions] = useState({});
  const [swappedRockets, setSwappedRockets] = useState([]);
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRocket, setSelectedRocket] = useState(null);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1); // 페이지 번호는 1부터 시작 (백엔드)
  const [totalPages, setTotalPages] = useState(0);
  
  // 시간 갱신을 위한 타이머
  const [, setTimer] = useState(0);
  
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
      setIsLoading(true);
      try {
        console.log("API 요청 시작 - 사용자 ID:", userId);
        
        // 백엔드 API 요청 형식에 맞게 파라미터 설정
        const params = {
          page: currentPage,
          size: 10,
          sort: 'chestId',  // 기본 정렬 필드
          order: sortOrder === 'oldest' ? 'asc' : 'desc' // 정렬 방향 적용
        };
        
        // 나에게 보낸 로켓 (myBase)
        if (activeTab === 'myBase') {
          const myBaseResponse = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}`, {
            params: {
              ...params,
              receiverType: 'self'
            }
          });
          console.log("MyBase 응답:", myBaseResponse);
          
          // 응답 구조 처리
          if (myBaseResponse.data && myBaseResponse.data.data) {
            setMyRockets(myBaseResponse.data.data.chests || []);
            setTotalPages(myBaseResponse.data.data.totalPages || 0);
          } else {
            setMyRockets([]);
          }
        } 
        // 다른 사람에게 보낸 로켓 (mailbox)
        else if (activeTab === 'mailbox') {
          const mailboxResponse = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}`, {
            params: {
              ...params,
              receiverType: 'other'
            }
          });
          console.log("Mailbox 응답:", mailboxResponse);
          
          // 응답 구조 처리
          if (mailboxResponse.data && mailboxResponse.data.data) {
            setReceivedRockets(mailboxResponse.data.data.chests || []);
            setTotalPages(mailboxResponse.data.data.totalPages || 0);
          } else {
            setReceivedRockets([]);
          }
        }
        // 모임을 통해 받은 로켓 (pod)
        else if (activeTab === 'pod') {
          // 모임 관련 API가 아직 구현되지 않았을 수 있음
          try {
            const podResponse = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}/pod`, {
              params
            });
            console.log("Pod 응답:", podResponse);
            
            // 응답 구조 처리
            if (podResponse.data && podResponse.data.data) {
              setPodRockets(podResponse.data.data.chests || []);
              setTotalPages(podResponse.data.data.totalPages || 0);
            } else {
              setPodRockets([]);
            }
          } catch (podError) {
            console.error("Pod API 호출 실패:", podError);
            setPodRockets([]);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('로켓 데이터 로드 실패:', err);
        if (err.response && err.response.status === 404) {
          // 404는 데이터가 없는 경우로 처리
          if (activeTab === 'myBase') setMyRockets([]);
          if (activeTab === 'mailbox') setReceivedRockets([]);
          if (activeTab === 'pod') setPodRockets([]);
        } else {
          setError('로켓 데이터를 불러오는데 실패했습니다.');
        }
        setIsLoading(false);
      }
    };
    
    fetchRockets();
    
    // 1초마다 시간 업데이트 (남은 시간 계산을 위해)
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [userId, currentPage, activeTab, sortOrder]); // sortOrder 추가
  
  // 로켓 위치 초기화 - 그리드 기반 위치 설정
  useEffect(() => {
    // 로켓 데이터가 로드되면 초기 위치 생성
    const initPositions = {};
    
    let currentRockets = [];
    if (activeTab === 'myBase') currentRockets = myRockets;
    else if (activeTab === 'mailbox') currentRockets = receivedRockets;
    else if (activeTab === 'pod') currentRockets = podRockets;
    
    if (currentRockets.length === 0) return;
    
    // 각 로켓에 그리드 위치 할당
    currentRockets.forEach((rocket, index) => {
      // 그리드 내 위치 계산 (5x2 그리드)
      const gridIndex = index; // 0부터 시작하는 인덱스
      
      // 랜덤으로 위치가 약간씩 다르게 보이도록 오프셋 추가
      const rocketIdStr = rocket.chestId.toString();
      const rocketIdSum = rocketIdStr.split('').reduce((sum, digit) => sum + parseInt(digit || 0), 0);
      
      // 약간의 오프셋 추가 (고정 랜덤)
      const xOffset = ((rocketIdSum * 7) % 20) - 10; // -10~10 사이 값
      const yOffset = ((rocketIdSum * 13) % 16) - 8; // -8~8 사이 값
      
      // 기본 위치 정보 저장
      initPositions[rocket.chestId] = {
        gridIndex, // 그리드 내 인덱스
        x: xOffset, // 시각적 오프셋
        y: yOffset, // 시각적 오프셋
        position: gridIndex // 서버에 전송할 위치 정보 (인덱스 - 문자열이 아닌 숫자로 저장)
      };
    });
    
    setRocketPositions(initPositions);
    setInitialRocketPositions(initPositions);
  }, [myRockets, receivedRockets, podRockets, activeTab]);
  
  // 로켓 상세 정보 조회
  const fetchRocketDetail = async (chestId) => {
    try {
      const response = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}/details/${chestId}`);
      return response.data.data;
    } catch (err) {
      console.error('로켓 상세 정보 조회 실패:', err);
      throw err;
    }
  };
  
  // 로켓 공개 여부 토글
  const toggleRocketVisibility = async (e, chestId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // API 명세에 맞게 수정
      const response = await api.patch(`${API_PATHS.CHESTS}/${chestId}/visibility`);
      console.log('공개 여부 변경 응답:', response);
      
      // 상태 업데이트
      const updateRocketList = (rocketList) => {
        return rocketList.map(rocket => 
          rocket.chestId === chestId
            ? { ...rocket, isPublic: !rocket.isPublic }
            : rocket
        );
      };
      
      setMyRockets(updateRocketList(myRockets));
      setReceivedRockets(updateRocketList(receivedRockets));
      setPodRockets(updateRocketList(podRockets));
      
    } catch (err) {
      console.error('로켓 공개 설정 변경 실패:', err);
      alert('로켓 공개 설정을 변경하는데 실패했습니다.');
    }
  };
  
  // 로켓 배치이동 - 두 로켓의 위치 교환
  const swapRocketPositions = (rocket1Id, rocket2Id) => {
    const updatedPositions = { ...rocketPositions };
    
    // 두 로켓의 위치 정보 임시 저장
    const pos1 = { ...updatedPositions[rocket1Id] };
    const pos2 = { ...updatedPositions[rocket2Id] };
    
    // 그리드 인덱스 교환 (위치 교환의 핵심)
    const tempGridIndex = pos1.gridIndex;
    pos1.gridIndex = pos2.gridIndex;
    pos2.gridIndex = tempGridIndex;
    
    // 교환된 위치 정보 저장
    updatedPositions[rocket1Id] = pos1;
    updatedPositions[rocket2Id] = pos2;
    
    // 위치가 바뀐 로켓들의 ID 저장
    setSwappedRockets([...swappedRockets, rocket1Id, rocket2Id]);
    setRocketPositions(updatedPositions);
    
    // UI에 변경 반영을 위한 로직
    const currentRockets = getCurrentRockets();
    const rocket1 = currentRockets.find(r => r.chestId === rocket1Id);
    const rocket2 = currentRockets.find(r => r.chestId === rocket2Id);
    
    // 해당 로켓들의 인덱스 찾기
    if (rocket1 && rocket2) {
      const updatedRockets = [...currentRockets];
      const index1 = updatedRockets.findIndex(r => r.chestId === rocket1Id);
      const index2 = updatedRockets.findIndex(r => r.chestId === rocket2Id);
      
      // 배열에서 위치 교환
      [updatedRockets[index1], updatedRockets[index2]] = [updatedRockets[index2], updatedRockets[index1]];
      
      // 현재 활성 탭에 따라 상태 업데이트
      if (activeTab === 'myBase') {
        setMyRockets([...updatedRockets]);
      } else if (activeTab === 'mailbox') {
        setReceivedRockets([...updatedRockets]);
      } else if (activeTab === 'pod') {
        setPodRockets([...updatedRockets]);
      }
    }
  };
  
  // 로켓 배치 저장 - DB에 위치 변경 반영
  const saveRocketOrder = async () => {
  if (Object.keys(rocketPositions).length === 0) {
    alert('배치 이동할 로켓이 없습니다.');
    setIsMovingMode(false);
    return;
  }
  
  try {
    // 두 로켓씩 묶어서 위치 교환 요청
    const processedIds = new Set();
    const swappedIds = [...new Set(swappedRockets)]; // 중복 제거
    
    for (let i = 0; i < swappedIds.length; i++) {
      const swappedId = swappedIds[i];
      
      // 이미 처리한 ID는 건너뜀
      if (processedIds.has(swappedId)) continue;
      
      // 다음 ID 찾기 - 순서대로 사용
      const swappedIdIndex = swappedRockets.indexOf(swappedId);
      let partnerId = null;
      
      // 같은 쌍의 파트너 ID 찾기
      for (let j = swappedIdIndex + 1; j < swappedRockets.length; j++) {
        if (!processedIds.has(swappedRockets[j])) {
          partnerId = swappedRockets[j];
          break;
        }
      }
      
      // 파트너 ID가 없으면 건너뜀
      if (partnerId === null) continue;
      
      // 처리 표시
      processedIds.add(swappedId);
      processedIds.add(partnerId);
      
      // 요청 생성
      const requestData = {
        sourceChestId: swappedId,
        targetChestId: partnerId
      };
      
      console.log(`로켓 위치 교환 요청: ${swappedId} ↔ ${partnerId}`, requestData);
      
      try {
        // 요청 보내기
        const response = await api.patch(`${API_PATHS.CHESTS}/chest-location`, requestData);
        console.log(`위치 저장 성공:`, response.data);
      } catch (updateError) {
        console.error(`로켓 위치 교환 실패:`, updateError);
        
        // 오류 상세 정보 로깅
        if (updateError.response) {
          console.error('오류 상태:', updateError.response.status);
          console.error('오류 데이터:', updateError.response.data);
          console.error('오류 헤더:', updateError.response.headers);
        }
        
        throw updateError;
      }
    }
      
    // 상태 초기화
    setIsMovingMode(false);
    setFirstSelectedRocket(null);
    setSecondSelectedRocket(null);
    setSwappedRockets([]);
    
    alert('로켓 배치가 성공적으로 저장되었습니다.');
  } catch (err) {
    console.error('배치 저장 실패:', err);
    
    // 상세 오류 확인
    if (err.response) {
      console.error('오류 응답:', err.response.data);
      console.error('오류 상태:', err.response.status);
      console.error('오류 헤더:', err.response.headers);
    }
    
    alert('로켓 배치 저장에 실패했습니다. 다시 시도해주세요.');
    
    // 실패 시 원래 위치로 복원
    setRocketPositions(initialRocketPositions);
    
    // UI 상태도 초기화
    setIsMovingMode(false);
    setFirstSelectedRocket(null);
    setSecondSelectedRocket(null);
    setSwappedRockets([]);
    
    // 데이터 리로드
    const currentTab = activeTab;
    setActiveTab('');
    setTimeout(() => setActiveTab(currentTab), 100);
  }
};
  
  // 선택한 로켓 삭제
  const deleteSelectedRockets = async () => {
    if (rocketsToDelete.length === 0) {
      alert('삭제할 로켓을 선택해주세요.');
      return;
    }
    
    if (!window.confirm(`선택한 ${rocketsToDelete.length}개의 로켓을 삭제하시겠습니까?`)) {
      return;
    }
    
    try {
      // 백엔드 API는 여러 개 동시 삭제를 지원하지 않을 수 있음
      // 각각 개별적으로 삭제 요청
      for (const chestId of rocketsToDelete) {
        await api.patch(`${API_PATHS.CHESTS}/${chestId}/deleted-flag`);
      }
      
      // 상태에서 삭제된 로켓 제거
      const filterDeletedRockets = (rocketList) => {
        return rocketList.filter(rocket => !rocketsToDelete.includes(rocket.chestId));
      };
      
      setMyRockets(filterDeletedRockets(myRockets));
      setReceivedRockets(filterDeletedRockets(receivedRockets));
      setPodRockets(filterDeletedRockets(podRockets));
      
      setRocketsToDelete([]);
      setIsDeleteMode(false);
      
      alert('로켓이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('로켓 삭제 실패:', err);
      alert('로켓 삭제에 실패했습니다.');
    }
  };
  
  // 단일 로켓 삭제
  const deleteSingleRocket = async (chestId) => {
    if (!window.confirm('이 로켓을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      await api.patch(`${API_PATHS.CHESTS}/${chestId}/deleted-flag`);
      
      // 상태에서 삭제된 로켓 제거
      const filterDeletedRocket = (rocketList) => {
        return rocketList.filter(rocket => rocket.chestId !== chestId);
      };
      
      setMyRockets(filterDeletedRocket(myRockets));
      setReceivedRockets(filterDeletedRocket(receivedRockets));
      setPodRockets(filterDeletedRocket(podRockets));
      
      setIsModalOpen(false);
      alert('로켓이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('로켓 삭제 실패:', err);
      alert('로켓 삭제에 실패했습니다.');
    }
  };
  
  // 남은 시간 계산 함수
  const calculateTimeRemaining = (unlockDate) => {
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
    if (isSearchMode) {
      return searchResults;
    }
    
    let rockets;
    switch (activeTab) {
      case 'myBase':
        rockets = [...myRockets];
        break;
      case 'mailbox':
        rockets = [...receivedRockets];
        break;
      case 'pod':
        rockets = [...podRockets];
        break;
      default:
        rockets = [];
    }
    
    return rockets;
  };
  
  // 로켓 검색
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setIsSearchMode(false);
      return;
    }
    
    // API 명세에 맞게 검색 로직 수정
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // 현재 탭에 따라 receiverType 설정 추가
        const receiverType = activeTab === 'myBase' ? 'self' : 
                            activeTab === 'mailbox' ? 'other' : 
                            activeTab === 'pod' ? 'pod' : null;
        
        const response = await api.get(`${API_PATHS.CHESTS_USERS}/${userId}`, {
          params: {
            page: 1,
            size: 10,
            sort: 'chestId',
            order: sortOrder === 'oldest' ? 'asc' : 'desc',
            rocketName: searchTerm.trim(),
            receiverType: receiverType // 추가된 파라미터
          }
        });
        
        if (response.data && response.data.data) {
          setSearchResults(response.data.data.chests || []);
          setTotalPages(response.data.data.totalPages || 0);
        } else {
          setSearchResults([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('검색 실패:', err);
        setSearchResults([]);
        setIsLoading(false);
      }
      
      setIsSearchMode(true);
    };
    
    fetchSearchResults();
  };
  
  // 검색 초기화
  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
  };
  
  // 로켓 클릭 처리
  const handleRocketClick = (rocket) => {
    // rocketId를 API 명세에 맞게 chestId로 변경
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
    
    if (isMovingMode) {
      // 배치 이동 모드일 때 선택한 로켓 저장
      if (!firstSelectedRocket) {
        // 첫 번째 로켓 선택
        setFirstSelectedRocket(rocket);
        console.log("첫 번째 로켓 선택:", rocket.chestId, rocket.rocketName);
      } else if (firstSelectedRocket.chestId !== chestId) {
        // 두 번째 로켓 선택 - 위치 교환
        setSecondSelectedRocket(rocket);
        console.log("두 번째 로켓 선택:", rocket.chestId, rocket.rocketName);
        
        // 두 로켓의 위치 정보 교환
        swapRocketPositions(firstSelectedRocket.chestId, chestId);
        console.log("로켓 위치 교환:", firstSelectedRocket.chestId, "↔", chestId);
        
        setFirstSelectedRocket(null); // 선택 초기화
      }
      return;
    }
    
    // 일반 모드일 때 모달 열기
    console.log("모달에 표시할 로켓:", rocket);
    setSelectedRocket(rocket);
    setIsModalOpen(true);
  };
  
  // 로켓 디자인 이미지 가져오기
  const getRocketDesignImage = (design) => {
    switch(design) {
      case 'A':
        return '/src/assets/디자인 A.jpg';
      case 'B':
        return '/src/assets/디자인 B.jpg';
      case 'C':
        return '/src/assets/디자인 C.jpg';
      default:
        return '/src/assets/rocket.png';
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
  
  // 배치 이동 버튼 클릭 핸들러
  const handleMovingModeToggle = () => {
    if (isMovingMode) {
      // 저장 버튼 클릭 시
      saveRocketOrder();
    } else {
      // 배치 이동 모드 시작
      setIsMovingMode(true);
      setIsDeleteMode(false);
      setRocketsToDelete([]);
      setFirstSelectedRocket(null);
      setSecondSelectedRocket(null);
      setSwappedRockets([]);
    }
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
            className={`tab-button ${activeTab === 'myBase' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('myBase');
              clearSearch();
              setIsDeleteMode(false);
              setRocketsToDelete([]);
              setIsMovingMode(false);
              setFirstSelectedRocket(null);
              setSecondSelectedRocket(null);
              setCurrentPage(1); // 탭 전환 시 첫 페이지로 이동
            }}
          >
            내 로켓보관함
          </button>
          <button
            className={`tab-button ${activeTab === 'mailbox' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('mailbox');
              clearSearch();
              setIsDeleteMode(false);
              setRocketsToDelete([]);
              setIsMovingMode(false);
              setFirstSelectedRocket(null);
              setSecondSelectedRocket(null);
              setCurrentPage(1); // 탭 전환 시 첫 페이지로 이동
            }}
          >
            받은 로켓보관함
          </button>
          <button
            className={`tab-button ${activeTab === 'pod' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('pod');
              clearSearch();
              setIsDeleteMode(false);
              setRocketsToDelete([]);
              setIsMovingMode(false);
              setFirstSelectedRocket(null);
              setSecondSelectedRocket(null);
              setCurrentPage(1); // 탭 전환 시 첫 페이지로 이동
            }}
          >
            우주모임 로켓보관함
          </button>
        </div>
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
            {isSearchMode && (
              <button type="button" className="clear-search" onClick={clearSearch}>
                <CloseIcon />
              </button>
            )}
          </form>
        </div>
        
        <div className="control-buttons">
          <div className="sort-controls">
            <label>정렬:</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="oldest">오래된 순</option>
              <option value="newest">최근 순</option>
            </select>
          </div>
          
          {currentRockets.length > 0 && (
            <button
              className={`control-button ${isMovingMode ? 'active' : ''}`}
              onClick={handleMovingModeToggle}
            >
              {isMovingMode ? '저장' : '배치 이동'}
            </button>
          )}
          
          <button
            className={`control-button delete ${isDeleteMode ? 'active' : ''}`}
            onClick={() => {
              if (isDeleteMode && rocketsToDelete.length > 0) {
                deleteSelectedRockets();
              } else {
                setIsDeleteMode(!isDeleteMode);
                setIsMovingMode(false);
                setRocketsToDelete([]);
                setFirstSelectedRocket(null);
                setSecondSelectedRocket(null);
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
            검색 결과: {searchResults.length}개의 로켓을 찾았습니다
            {searchResults.length === 0 && ' (해당하는 로켓은 존재하지 않습니다)'}
          </p>
        </div>
      )}
      
      <div className="rockets-count">
        총 {currentRockets.length}개의 로켓이 있습니다
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
            const isFirstSelected = firstSelectedRocket && firstSelectedRocket.chestId === chestId;
            
            // 로켓 위치 스타일
            const rocketPosition = rocketPositions[chestId] || { x: 0, y: 0 };
            const positionStyle = {
              transform: `translate(${rocketPosition.x}px, ${rocketPosition.y}px)${isFirstSelected ? ' scale(1.1)' : isMovingMode ? ' scale(1.05)' : ''}`
            };
            
            return (
              <div
                key={chestId}
                className={`rocket-item ${isMovingMode ? 'moving' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''} ${isFirstSelected ? 'first-selected' : ''}`}
                style={positionStyle}
                onClick={() => handleRocketClick(rocket)}
                onContextMenu={(e) => toggleRocketVisibility(e, chestId)}
              >
                <div className="rocket-image">
                  <img src={getRocketDesignImage(rocket.design)} alt={rocket.rocketName} />
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
                    <UserIcon /> {rocket.senderEmail || '보낸사람'}
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
                <img src={getRocketDesignImage(selectedRocket.design)} alt={selectedRocket.rocketName} />
              </div>
              
              <div className="rocket-modal-details">
                <p className="rocket-sender">
                  <strong>보낸 사람:</strong> {selectedRocket.senderEmail || '알 수 없음'}
                </p>
                <p className="rocket-sent-at">
                  <strong>받은 시간:</strong> {formatDate(selectedRocket.sentAt || selectedRocket.createdAt)}
                </p>
                
                {(() => {
                  const { isUnlocked, timeString } = calculateTimeRemaining(selectedRocket.lockExpiredAt);
                  
                  return isUnlocked ? (
                    <>
                      <div className="rocket-message">
                        <h3>메시지</h3>
                        <div className="message-content">
                          {selectedRocket.content || '내용이 없습니다.'}
                        </div>
                      </div>
                      
                      {selectedRocket.attachments && selectedRocket.attachments.length > 0 && (
                        <div className="rocket-attachments">
                          <h3>첨부 파일</h3>
                          <ul>
                            {selectedRocket.attachments.map((file, index) => (
                              <li key={index}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  {file.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <button
                        className="delete-button"
                        onClick={() => deleteSingleRocket(selectedRocket.chestId)}
                      >
                        로켓 삭제
                      </button>
                    </>
                  ) : (
                    <div className="rocket-locked">
                      <div className="lock-icon"><LockIcon /></div>
                      <p>이 로켓은 아직 잠겨 있습니다.</p>
                      <p className="time-remaining">
                        <strong>잠금 해제까지 남은 시간:</strong><br />
                        {timeString}
                      </p>
                      <p className="unlock-date">
                        <strong>잠금 해제일:</strong><br />
                        {formatDate(selectedRocket.lockExpiredAt)}
                      </p>
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
