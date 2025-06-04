import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import styles from '../style/Groups.module.css';
import { 
  SearchIcon, 
  CloseIcon, 
  PeopleIcon, 
  UserIcon, 
  LockIcon, 
  PlusIcon,
  CrownIcon
} from '../components/ui/Icons';

// API 경로 상수화
const API_PATHS = {
  GROUPS: '/groups',
  MY_GROUPS: '/groups/me'
};

// 테마 맵핑
const THEME_MAP = {
  '요리': '🍳',
  '음악': '🎵',
  '운동': '💪',
  '독서': '📚',
  '영화': '🎬',
  '여행': '✈️',
  '게임': '🎮',
  '기타': '🌟'
};

// 그룹 카드 컴포넌트
const GroupCard = ({ group, onClick, isMyGroup = false }) => {
  const themeEmoji = THEME_MAP[group.groupTheme] || '🌟';
  
  return (
    <div 
      className={`${styles.groupCard} ${isMyGroup ? styles.myGroupCard : ''}`}
      onClick={() => onClick(group)}
    >
      <div className={styles.groupHeader}>
        <div className={styles.groupTheme}>
          <span className={styles.themeEmoji}>{themeEmoji}</span>
          <span className={styles.themeName}>{group.groupTheme || '기타'}</span>
        </div>
        <div className={styles.groupBadges}>
          {group.isPrivate && <LockIcon className={styles.privateIcon} />}
          {isMyGroup && group.isLeader && <CrownIcon className={styles.leaderIcon} />}
        </div>
      </div>
      
      <div className={styles.groupInfo}>
        <h3 className={styles.groupName}>{group.groupName}</h3>
        <p className={styles.groupDescription}>
          {group.description || '모임 소개가 없습니다.'}
        </p>
      </div>
      
      <div className={styles.groupStats}>
        <div className={styles.memberCount}>
          <UserIcon className={styles.statIcon} />
          <span>{group.currentMemberCount}/{group.memberLimit || '∞'}</span>
        </div>
        <div className={styles.leaderInfo}>
          <CrownIcon className={styles.statIcon} />
          <span>{group.leaderNickname}</span>
        </div>
      </div>
      
      {group.backgroundImage && (
        <div className={styles.groupBackground}>
          <img src={group.backgroundImage} alt="Group Background" />
        </div>
      )}
    </div>
  );
};

// 메인 Groups 컴포넌트
const Groups = () => {
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const isFetchingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  
  // 상태 관리
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalMyGroups, setTotalMyGroups] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 인증 확인
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  // 데이터 로드
  useEffect(() => {
    if (!userId) return;
    if (activeTab === 'all') {
      fetchGroups();
    } else {
      fetchMyGroups();
    }
  }, [userId, currentPage, activeTab, selectedTheme]);

  // 실시간 검색 기능
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current);
    
    if (searchTerm.trim() === '') {
      if (isSearchMode) {
        setIsSearchMode(false);
        if (activeTab === 'all') {
          fetchGroups();
        } else {
          fetchMyGroups();
        }
      }
      return;
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setIsSearchMode(true);
      setCurrentPage(1);
      if (activeTab === 'all') {
        fetchGroups();
      } else {
        fetchMyGroups();
      }
    }, 500);
    
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, activeTab]);

  // 전체 그룹 조회
  const fetchGroups = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;
    setIsLoading(true);

    try {
      const params = {
        page: currentPage,
        size: 12
      };
      
      if (searchTerm.trim()) {
        params['group-name'] = searchTerm.trim();
      }
      
      if (selectedTheme) {
        params['group-theme'] = selectedTheme;
      }

      const response = await api.get(API_PATHS.GROUPS, { params });
      
      if (isFetchingRef.current !== currentFetchId) return;
      
      if (response.data?.data) {
        const responseData = response.data.data;
        setGroups(responseData.groups || []);
        setTotalPages(responseData.totalPages || 0);
        setTotalGroups(responseData.totalElements || 0);
      } else {
        setGroups([]);
        setTotalPages(0);
        setTotalGroups(0);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      
      console.error('그룹 데이터 로드 실패:', err);
      setGroups([]);
      if (err.response?.status !== 404) {
        setError('그룹 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [currentPage, searchTerm, selectedTheme]);

  // 내가 참여한 그룹 조회
  const fetchMyGroups = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;
    setIsLoading(true);

    try {
      const params = {
        page: currentPage,
        size: 12
      };
      
      if (searchTerm.trim()) {
        params['group-name'] = searchTerm.trim();
      }
      
      if (selectedTheme) {
        params['group-theme'] = selectedTheme;
      }

      const response = await api.get(API_PATHS.MY_GROUPS, { params });
      
      if (isFetchingRef.current !== currentFetchId) return;
      
      if (response.data?.data) {
        const responseData = response.data.data;
        setMyGroups(responseData.groups || []);
        setTotalPages(responseData.totalPages || 0);
        setTotalMyGroups(responseData.totalElements || 0);
      } else {
        setMyGroups([]);
        setTotalPages(0);
        setTotalMyGroups(0);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      
      console.error('내 그룹 데이터 로드 실패:', err);
      setMyGroups([]);
      if (err.response?.status !== 404) {
        setError('내 그룹 데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [currentPage, searchTerm, selectedTheme]);

  // UI 이벤트 핸들러
  const handleSearch = useCallback(e => {
    e.preventDefault();
    setIsSearchMode(true);
    setCurrentPage(1);
    if (activeTab === 'all') {
      fetchGroups();
    } else {
      fetchMyGroups();
    }
  }, [activeTab, fetchGroups, fetchMyGroups]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchMode(false);
    setCurrentPage(1);
    if (activeTab === 'all') {
      fetchGroups();
    } else {
      fetchMyGroups();
    }
  }, [activeTab, fetchGroups, fetchMyGroups]);

  const handleTabChange = useCallback(tab => {
    setActiveTab(tab);
    setSearchTerm('');
    setIsSearchMode(false);
    setCurrentPage(1);
    setTimeout(() => {
      if (tab === 'all') {
        fetchGroups();
      } else {
        fetchMyGroups();
      }
    }, 0);
  }, [fetchGroups, fetchMyGroups]);

  const handleGroupClick = useCallback((group) => {
    navigate(`/groups/${group.groupId}`);
  }, [navigate]);

  const handleCreateGroup = useCallback(() => {
    navigate('/groups/create');
  }, [navigate]);

  // 현재 표시할 데이터
  const currentGroups = activeTab === 'all' ? groups : myGroups;
  const currentTotal = activeTab === 'all' ? totalGroups : totalMyGroups;

  // 오류 화면
  if (error) {
    return (
      <div className={styles.groupsError}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className={styles.groupsContainer}>
      {/* 헤더 영역 */}
      <div className={styles.groupsHeader}>
        <div className={styles.headerContent}>
          <h1>
            <PeopleIcon className={styles.headerIcon} />
            모임
          </h1>
          <p className={styles.description}>
            같은 관심사를 가진 사람들과 함께 추억을 만들어보세요
          </p>
        </div>
        
        <button className={styles.createGroupBtn} onClick={handleCreateGroup}>
          <PlusIcon />
          새 모임 만들기
        </button>
      </div>

      {/* 탭 네비게이션 */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => handleTabChange('all')}
        >
          전체 모임
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'my' ? styles.active : ''}`}
          onClick={() => handleTabChange('my')}
        >
          내 모임
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.groupsControls}>
        <div className={styles.searchBar}>
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="모임 이름으로 검색..."
            />
            <button type="submit" className={styles.searchButton}>
              <SearchIcon />
            </button>
            {isSearchMode && searchTerm && (
              <button type="button" className={styles.clearSearch} onClick={clearSearch}>
                <CloseIcon />
              </button>
            )}
          </form>
        </div>

        <div className={styles.filterControls}>
          <select 
            value={selectedTheme} 
            onChange={(e) => {
              setSelectedTheme(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.themeFilter}
          >
            <option value="">모든 테마</option>
            {Object.keys(THEME_MAP).map(theme => (
              <option key={theme} value={theme}>
                {THEME_MAP[theme]} {theme}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSearchMode && (
        <div className={styles.searchResultsInfo}>
          <p>
            검색어: "{searchTerm}" - {currentTotal}개의 모임을 찾았습니다
            {currentGroups.length === 0 && ' (해당하는 모임은 존재하지 않습니다)'}
          </p>
        </div>
      )}

      <div className={styles.groupsCount}>
        총 {currentTotal}개의 모임이 있습니다
      </div>

      {/* 그룹 목록 */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>모임 데이터를 불러오는 중...</p>
        </div>
      ) : currentGroups.length > 0 ? (
        <div className={styles.groupsGrid}>
          {currentGroups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              onClick={handleGroupClick}
              isMyGroup={activeTab === 'my'}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyGroups}>
          {activeTab === 'all' ? (
            <>
              <h2>참여할 수 있는 모임이 없습니다</h2>
              <p>새로운 모임을 만들어 첫 번째 멤버가 되어보세요!</p>
              <button onClick={handleCreateGroup} className={styles.createFirstGroupBtn}>
                첫 모임 만들기
              </button>
            </>
          ) : (
            <>
              <h2>참여 중인 모임이 없습니다</h2>
              <p>관심있는 모임에 참여하거나 새로운 모임을 만들어보세요!</p>
              <div className={styles.emptyActions}>
                <button onClick={() => handleTabChange('all')} className={styles.browseGroupsBtn}>
                  모임 둘러보기
                </button>
                <button onClick={handleCreateGroup} className={styles.createGroupBtn}>
                  새 모임 만들기
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {!isLoading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
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
                className={`${styles.paginationBtn} ${currentPage === pageNum ? styles.active : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            
          <button
            className={styles.paginationBtn}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default Groups;
