import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import { AlertModal, ConfirmModal } from '../components/common/Modal';
import useAlertModal from '../components/common/useAlertModal';
import useConfirmModal from '../components/common/useConfirmModal';

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

// 테마 옵션
const THEME_OPTIONS = [
  { value: '요리', label: '🍳 요리' },
  { value: '음악', label: '🎵 음악' },
  { value: '운동', label: '💪 운동' },
  { value: '독서', label: '📚 독서' },
  { value: '영화', label: '🎬 영화' },
  { value: '여행', label: '✈️ 여행' },
  { value: '게임', label: '🎮 게임' },
  { value: '기타', label: '🌟 기타' }
];

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
  const themeEmoji = THEME_MAP[group.theme] || '🌟';

  return (
    <div
      className={`${styles.groupCard} ${isMyGroup ? styles.myGroupCard : ''}`}
      onClick={() => onClick(group)}
    >
      <div className={styles.groupHeader}>
        <div className={styles.groupTheme}>
          <span className={styles.themeEmoji}>{themeEmoji}</span>
          <span className={styles.themeName}>{group.theme || '기타'}</span>
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [hasMoreGroups, setHasMoreGroups] = useState(true);
  const [hasMoreMyGroups, setHasMoreMyGroups] = useState(true);
  const [groupsPage, setGroupsPage] = useState(1);
  const [myGroupsPage, setMyGroupsPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { alertModal, showAlert, closeAlert, handleApiError } = useAlertModal();
  const { confirmModal, showConfirm, closeConfirm } = useConfirmModal();

  // 인증 확인
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  // 전체 그룹 조회
  const fetchGroups = useCallback(async (isLoadMore = false) => {
    if (isFetchingRef.current) return;

    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setGroupsPage(1);
    }

    try {
      const currentPage = isLoadMore ? groupsPage : 1;
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
        const newGroups = responseData.groups || [];

        if (isLoadMore) {
          setGroups(prev => [...prev, ...newGroups]);
        } else {
          setGroups(newGroups);
        }

        setHasMoreGroups(responseData.hasNext || false);

        if (responseData.hasNext) {
          setGroupsPage(currentPage + 1);
        }

        setError(null);
      } else {
        setGroups([]);
        setHasMoreGroups(false);
        setError(null);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;

      setGroups([]);
      setHasMoreGroups(false);
      handleApiError(err);
    } finally {
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [groupsPage, searchTerm, selectedTheme]);

  // 내가 참여한 그룹 조회
  const fetchMyGroups = useCallback(async (isLoadMore = false) => {
    if (isFetchingRef.current) return;

    const currentFetchId = Date.now();
    isFetchingRef.current = currentFetchId;

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setMyGroupsPage(1);
    }

    try {
      const currentPage = isLoadMore ? myGroupsPage : 1;
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
        const newGroups = responseData.groups || [];

        if (isLoadMore) {
          setMyGroups(prev => [...prev, ...newGroups]);
        } else {
          setMyGroups(newGroups);
        }

        setHasMoreMyGroups(responseData.hasNext || false);

        if (responseData.hasNext) {
          setMyGroupsPage(currentPage + 1);
        }

        setError(null);
      } else {
        setMyGroups([]);
        setHasMoreMyGroups(false);
        setError(null);
      }
    } catch (err) {
      if (isFetchingRef.current !== currentFetchId) return;
      setMyGroups([]);
      setHasMoreMyGroups(false);
      handleApiError(err);
    } finally {
      if (isFetchingRef.current === currentFetchId) {
        isFetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [myGroupsPage, searchTerm, selectedTheme]);

  // 데이터 로드 - 의존성 배열에서 함수 제거
  useEffect(() => {
    if (!userId) return;
    if (activeTab === 'all') {
      fetchGroups();
    } else {
      fetchMyGroups();
    }
  }, [userId, activeTab, selectedTheme]); // 함수들 제거

  // 실시간 검색 기능 - 의존성 배열에서 함수 제거
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
      if (activeTab === 'all') {
        setGroupsPage(1);
        fetchGroups();
      } else {
        setMyGroupsPage(1);
        fetchMyGroups();
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, activeTab]); // 함수들 제거

  // 무한스크롤 구현
  const handleScroll = useCallback(() => {
    if (isLoadingMore) return;

    const currentHasMore = activeTab === 'all' ? hasMoreGroups : hasMoreMyGroups;
    if (!currentHasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollTop + clientHeight >= scrollHeight - 200) {
      if (activeTab === 'all') {
        fetchGroups(true);
      } else {
        fetchMyGroups(true);
      }
    }
  }, [isLoadingMore, hasMoreGroups, hasMoreMyGroups, activeTab, fetchGroups, fetchMyGroups]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // UI 이벤트 핸들러
  const handleSearch = useCallback(e => {
    e.preventDefault();
    setIsSearchMode(true);
    if (activeTab === 'all') {
      setGroupsPage(1);
      fetchGroups();
    } else {
      setMyGroupsPage(1);
      fetchMyGroups();
    }
  }, [activeTab, fetchGroups, fetchMyGroups]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchMode(false);
    if (activeTab === 'all') {
      setGroupsPage(1);
      fetchGroups();
    } else {
      setMyGroupsPage(1);
      fetchMyGroups();
    }
  }, [activeTab, fetchGroups, fetchMyGroups]);

  const handleTabChange = useCallback(tab => {
    setActiveTab(tab);
    setSearchTerm('');
    setIsSearchMode(false);
    setSelectedTheme('');
    setError(null);
  }, []);

  const handleGroupClick = useCallback((group) => {
    navigate(`/groups/${group.groupId}`);
  }, [navigate]);

  const handleCreateGroup = useCallback(() => {
    navigate('/groups/create');
  }, [navigate]);

  const handleThemeChange = useCallback((e) => {
    const newTheme = e.target.value;
    setSelectedTheme(newTheme);
    setError(null);
  }, []);

  // 현재 표시할 데이터
  const currentGroups = activeTab === 'all' ? groups : myGroups;

  return (
    <div className={styles.groupsContainer}>
      {/* 에러 메시지 표시 */}
      {error && (
        <div className={styles.errorBanner} style={{
          background: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fcc'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

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
            onChange={handleThemeChange}
            className={styles.themeFilter}
          >
            <option value="">모든 테마</option>
            {THEME_OPTIONS.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSearchMode && (
        <div className={styles.searchResultsInfo}>
          <p>
            검색어: "{searchTerm}"
            {currentGroups.length === 0 && ' - 해당하는 모임이 없습니다'}
          </p>
        </div>
      )}

      {/* 선택된 테마 표시 */}
      {selectedTheme && (
        <div className={styles.searchResultsInfo}>
          <p>
            선택된 테마: "{selectedTheme}"
            {currentGroups.length === 0 && ' - 해당 테마의 모임이 없습니다'}
          </p>
        </div>
      )}

      {/* 그룹 목록 */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>모임 데이터를 불러오는 중...</p>
        </div>
      ) : currentGroups.length > 0 ? (
        <>
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

          {/* 무한스크롤 로딩 표시 */}
          {isLoadingMore && (
            <div className={styles.loadingMore} style={{
              textAlign: 'center',
              padding: '20px',
              color: '#666'
            }}>
              <div className={styles.loadingSpinner}></div>
              <p>더 많은 모임을 불러오는 중...</p>
            </div>
          )}
        </>
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

export default Groups;