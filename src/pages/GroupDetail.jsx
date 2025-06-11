import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import { handleApiError } from '../utils/errorHandler';
import styles from '../style/GroupDetail.module.css';
import {
  UserIcon,
  LockIcon,
  CrownIcon,
  ExitIcon,
  SettingsIcon,
  RocketIcon,
  PeopleIcon,
  BackIcon
} from '../components/ui/Icons';

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

// 멤버 카드 컴포넌트
const MemberCard = ({ member, isLeader, currentUserId, onToggleReady, isMember, canKick, onKick }) => {
  const isCurrentUser = member.userId === currentUserId;

  return (
    <div className={`${styles.memberCard} ${member.isKicked ? styles.kicked : ''}`}>
      <div className={styles.memberInfo}>
        <div className={styles.memberAvatar}>
          <UserIcon />
        </div>
        <div className={styles.memberDetails}>
          <h4 className={styles.memberName}>
            {member.nickname}
            {isLeader && <CrownIcon className={styles.leaderBadge} />}
          </h4>
          <div className={styles.memberStatus}>
            {member.isKicked ? (
              <span className={styles.kickedStatus}>강퇴됨</span>
            ) : (
              <div className={styles.readyStatusContainer}>
                <span className={member.isReady ? styles.readyStatus : styles.waitingStatus}>
                  {member.isReady ? '준비 완료' : '준비 중'}
                </span>
                {isCurrentUser && isMember && !member.isKicked && (
                  <button
                    className={`${styles.readyToggleButton} ${member.isReady ? styles.ready : styles.notReady}`}
                    onClick={() => onToggleReady(member.userId)}
                  >
                    {member.isReady ? '✅ 준비 완료' : '❌ 준비 중'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {canKick && !member.isKicked && !isLeader && (
        <button
          className={styles.kickButton}
          onClick={() => onKick(member.userId)}
        >
          강퇴
        </button>
      )}
    </div>
  );
};

// 비밀번호 입력 모달
const PasswordModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.passwordModal}>
        <h3>비밀번호를 입력하세요</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="모임 비밀번호"
            className={styles.passwordInput}
            disabled={isLoading}
            autoFocus
          />
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.joinButton}
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? '참가 중...' : '참가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();

  // 상태 관리
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const stompClient = useAuthStore((state) => state.stompClient);

  // 인증 확인
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  // 데이터 로드
  useEffect(() => {
    if (groupId && userId) {
      fetchGroupDetail();
      fetchGroupMembers();
    }
    // eslint-disable-next-line
  }, [groupId, userId]);

  // 그룹 상세 정보 조회
  const fetchGroupDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/groups/${groupId}`);

      if (response.data?.data) {
        const groupData = response.data.data;
        setGroup(groupData);
        setIsLeader(groupData.leaderId === userId);
      }
    } catch (err) {
      handleApiError(err, '모임 정보를 불러오는데 실패했습니다.', navigate);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, userId, navigate]);

  // 그룹 멤버 목록 조회
  const fetchGroupMembers = useCallback(async () => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      if (response.data?.data?.members) {
        const memberData = response.data.data;
        setMembers(memberData.members || []);
        // 현재 사용자가 멤버인지 확인
        const currentUserMember = memberData.members?.find(m => m.userId === userId);
        setIsMember(!!currentUserMember && !currentUserMember.isKicked);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setIsMember(false);
      } else {
        handleApiError(err, '멤버 목록을 불러오는데 실패했습니다.');
      }
    }
  }, [groupId, userId]);

  // 그룹 참가
  const handleJoinGroup = useCallback(async (password = null) => {
    try {
      setIsJoining(true);
      const requestData = password ? { password } : {};
      await api.post(`/groups/${groupId}/members`, requestData);

      setShowPasswordModal(false);
      setIsMember(true);

      // 데이터 새로고침
      await fetchGroupDetail();
      await fetchGroupMembers();
      
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: `/app/group/${groupId}/join_member`,
          body: JSON.stringify({
            isReady: false,
          }),
        });
      }

      alert('모임에 성공적으로 참가했습니다!');
    } catch (err) {
      console.error('그룹 참가 실패:', err);
    } finally {
      setIsJoining(false);
    }
  }, [groupId, fetchGroupDetail, fetchGroupMembers]);

  // 그룹 퇴장
  const handleLeaveGroup = useCallback(async () => {
    if (!window.confirm('정말로 이 모임을 떠나시겠습니까?')) return;

    try {
      setIsLeaving(true);

      await api.delete(`/groups/${groupId}/members/me`);

      setIsMember(false);

      // 데이터 새로고침
      await fetchGroupDetail();
      await fetchGroupMembers();

      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: `/app/group/${groupId}/leave_member`,
          body: '', // 서버에서 principal 통해 userId 추출하면 body 없어도 됨
        });
      }

      alert('모임을 성공적으로 떠났습니다.');
    } catch (err) {
      handleApiError(err, '모임 탈퇴에 실패했습니다.');
    } finally {
      setIsLeaving(false);
    }
  }, [groupId, fetchGroupDetail, fetchGroupMembers]);

  // 멤버 강퇴
  const handleKickMember = useCallback(async (memberId) => {
    if (!window.confirm('정말로 이 멤버를 강퇴하시겠습니까?')) return;

    try {
      await api.patch(`/groups/${groupId}/members/${memberId}`);

      // 멤버 목록 새로고침
      await fetchGroupMembers();

      alert('멤버가 성공적으로 강퇴되었습니다.');
    } catch (err) {
      handleApiError(err, '멤버 강퇴에 실패했습니다.');
    }
  }, [groupId, fetchGroupMembers]);

  // 준비 상태 토글
  const handleToggleReady = useCallback(async (memberUserId) => {
    try {
      await api.patch(`/groups/${groupId}/members/${memberUserId}/ready`);
      await fetchGroupMembers();
    } catch (err) {
      handleApiError(err, '준비 상태 변경에 실패했습니다.');
    }
  }, [groupId, fetchGroupMembers]);

  // 참가 버튼 클릭
  const handleJoinClick = useCallback(() => {
    if (group?.isPrivate) {
      setShowPasswordModal(true);
    } else {
      handleJoinGroup();
    }
  }, [group?.isPrivate, handleJoinGroup]);

  // 로켓 생성 페이지로 이동
  const handleCreateRocket = useCallback(() => {
    navigate(`/groups/${groupId}/rockets/create`);
  }, [navigate, groupId]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>모임 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/groups')} className={styles.backButton}>
          모임 목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={styles.errorContainer}>
        <h2>모임을 찾을 수 없습니다</h2>
        <button onClick={() => navigate('/groups')} className={styles.backButton}>
          모임 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const themeEmoji = THEME_MAP[group.groupTheme] || '🌟';

  return (
    <div className={styles.groupDetailContainer}>
      {/* 헤더 */}
      <div className={styles.groupDetailHeader}>
        <button
          onClick={() => navigate('/groups')}
          className={styles.backButton}
        >
          <BackIcon /> 돌아가기
        </button>
      </div>

      {/* 그룹 정보 */}
      <div className={styles.groupInfo}>
        {group.backgroundImage && (
          <div className={styles.groupBackground}>
            <img src={group.backgroundImage} alt="Group Background" />
          </div>
        )}

        <div className={styles.groupContent}>
          <div className={styles.groupTheme}>
            <span className={styles.themeEmoji}>{themeEmoji}</span>
            <span className={styles.themeName}>{group.groupTheme || '기타'}</span>
            {group.isPrivate && <LockIcon className={styles.privateIcon} />}
          </div>

          <h1 className={styles.groupName}>{group.groupName}</h1>

          <p className={styles.groupDescription}>
            {group.description || '모임 소개가 없습니다.'}
          </p>

          <div className={styles.groupStats}>
            <div className={styles.stat}>
              <UserIcon className={styles.statIcon} />
              <span>{group.currentMemberCount}/{group.memberLimit || '∞'}</span>
              <span className={styles.statLabel}>멤버</span>
            </div>
            <div className={styles.stat}>
              <CrownIcon className={styles.statIcon} />
              <span>{group.leaderNickname}</span>
              <span className={styles.statLabel}>리더</span>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className={styles.groupActions}>
            {!isMember ? (
              <button
                onClick={handleJoinClick}
                className={styles.joinButton}
                disabled={isJoining}
              >
                <PeopleIcon />
                {isJoining ? '참가 중...' : '모임 참가'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleCreateRocket}
                  className={styles.createRocketButton}
                >
                  <RocketIcon />
                  모임 로켓 만들기
                </button>

                {!isLeader && (
                  <button
                    onClick={handleLeaveGroup}
                    className={styles.leaveButton}
                    disabled={isLeaving}
                  >
                    <ExitIcon />
                    {isLeaving ? '퇴장 중...' : '모임 떠나기'}
                  </button>
                )}

                {isLeader && (
                  <button
                    onClick={() => navigate(`/groups/${groupId}/settings`)}
                    className={styles.settingsButton}
                  >
                    <SettingsIcon />
                    모임 설정
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 멤버 목록 */}
      {isMember && (
        <div className={styles.membersSection}>
          <h2 className={styles.sectionTitle}>
            <PeopleIcon /> 모임 멤버 ({members.length}명)
          </h2>

          <div className={styles.membersGrid}>
            {members.map(member => (
              <MemberCard
                key={member.groupMemberId}
                member={member}
                isLeader={member.userId === group.leaderId}
                currentUserId={userId}
                onToggleReady={handleToggleReady}
                isMember={isMember}
                canKick={isLeader}
                onKick={handleKickMember}
              />
            ))}
          </div>
        </div>
      )}

      {/* 비밀번호 모달 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleJoinGroup}
        isLoading={isJoining}
      />
    </div>
  );
};

export default GroupDetail;
