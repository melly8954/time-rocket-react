import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import styles from '../style/GroupRocketCreate.module.css';
import {
  BackIcon,
  RocketIcon,
  ImageIcon,
  CalendarIcon,
  UserIcon,
  GroupIcon,
  FileIcon,
  CloseIcon,
  SendIcon,
  ChatIcon,
  KickIcon
} from '../components/ui/Icons';

const GroupRocketCreate = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const { userId, isLoggedIn } = useAuthStore();
  const fileInputRef = useRef(null);

  // 상태 관리
  const [group, setGroup] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState([]);
  const [isMyReady, setIsMyReady] = useState(false);
  const [formData, setFormData] = useState({
    rocketName: '',
    design: '',
    lockExpiredAt: '',
    content: ''
  });
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 채팅 관련 상태
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const myNickname = useAuthStore(state => state.nickname);
  const stompClient = useAuthStore((state) => state.stompClient);
  const subscriptionRef = useRef(null);

  // 로켓 디자인 옵션
  const DESIGN_OPTIONS = [
    {
      value: '/src/assets/rocket_design1.svg',
      label: '클래식',
      preview: '/src/assets/rocket_design1.svg'
    },
    {
      value: '/src/assets/rocket_design2.svg',
      label: '모던',
      preview: '/src/assets/rocket_design2.svg'
    },
    {
      value: '/src/assets/rocket_design3.svg',
      label: '컬러풀',
      preview: '/src/assets/rocket_design3.svg'
    },
    {
      value: '/src/assets/rocket_design4.svg',
      label: '우주선',
      preview: '/src/assets/rocket_design4.svg'
    }
  ];

  // 인증 및 그룹 정보 확인
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (groupId) {
      fetchGroupInfo();
      fetchMembers();
    }
  }, [isLoggedIn, groupId]);

  // 그룹 정보 조회
  const fetchGroupInfo = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/groups/${groupId}`);
      if (response.data?.data) {
        const groupData = response.data.data;
        setGroup(groupData);
        setIsOwner(groupData.leaderId === userId);

        setFormData(prev => ({
          ...prev,
          rocketName: `${groupData.groupName} 로켓`,
          design: DESIGN_OPTIONS[0].value
        }));
      }
    } catch (err) {
      console.error('그룹 정보 조회 실패:', err);
      alert('모임 정보를 불러올 수 없습니다.');
      navigate('/groups');
    } finally {
      setIsLoading(false);
    }
  };

  // 멤버 정보 조회
  const fetchMembers = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      
      if (response.data?.data?.members && Array.isArray(response.data.data.members)) {
        setMembers(response.data.data.members);
        
        // 내 준비 상태 확인
        const myMember = response.data.data.members.find(m => m.userId === userId);
        if (myMember) {
          setIsMyReady(myMember.isReady || false);
        }
      } else {
        console.warn('멤버 데이터가 배열이 아닙니다:', response.data);
        setMembers([]);
      }
    } catch (err) {
      console.error('멤버 정보 조회 실패:', err);
      setMembers([]);
    }
  };

  // 내 준비 상태 토글
  const handleToggleMyReady = async () => {
    try {
      const newStatus = isMyReady ? 'INACTIVE' : 'ACTIVE';
      
      await api.put(`/groups/${groupId}/rocket-status`, {
        status: newStatus
      });
      
      setIsMyReady(!isMyReady);
      await fetchMembers();
    } catch (err) {
      console.error('준비 상태 변경 실패:', err);
      alert('준비 상태 변경에 실패했습니다.');
    }
  };

  // 준비 상태 토글
  const handleToggleReady = async (memberId) => {
    try {
      const currentMember = members.find(m => m.userId === memberId);
      const newStatus = currentMember?.isReady ? 'INACTIVE' : 'ACTIVE';
      
      await api.put(`/groups/${groupId}/rocket-status`, {
        status: newStatus
      });
      
      await fetchMembers();
    } catch (err) {
      console.error('준비 상태 변경 실패:', err);
    }
  };

  // 모든 멤버가 준비 완료했는지 확인
  const isAllMembersComplete = () => {
    if (!Array.isArray(members) || members.length === 0) {
      return false;
    }
    return members.every(member => member.isReady);
  };

  // 준비 완료된 멤버 수
  const getCompleteCount = () => {
    if (!Array.isArray(members)) {
      return 0;
    }
    return members.filter(member => member.isReady).length;
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      alert('최대 5개의 파일만 업로드 가능합니다.');
      return;
    }

    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('각 파일은 10MB 이하여야 합니다.');
      return;
    }

    setFiles(selectedFiles);
  };

  // 파일 제거
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 멤버 강퇴 (방장만 가능)
  const handleKickMember = async (memberId) => {
    if (!isOwner) return;

    if (window.confirm('정말로 이 멤버를 강퇴하시겠습니까?')) {
      try {
        await api.patch(`/groups/${groupId}/members/${memberId}`);
        await fetchMembers();
        alert('멤버가 강퇴되었습니다.');
      } catch (err) {
        console.error('멤버 강퇴 실패:', err);
        alert('멤버 강퇴에 실패했습니다.');
      }
    }
  };

  // 로켓 생성 및 전송
  const handleRocketSubmit = async (e) => {
    e.preventDefault();

    if (!isOwner) {
      alert('방장만 로켓을 발사할 수 있습니다.');
      return;
    }

    if (!isAllMembersComplete()) {
      alert('모든 참가자가 준비를 완료해야 로켓을 발사할 수 있습니다.');
      return;
    }

    const newErrors = {};
    if (!formData.rocketName.trim()) {
      newErrors.rocketName = '로켓 이름을 입력해주세요.';
    }
    if (!formData.design) {
      newErrors.design = '로켓 디자인을 선택해주세요.';
    }
    if (!formData.lockExpiredAt) {
      newErrors.lockExpiredAt = '잠금 해제 시간을 설정해주세요.';
    } else {
      const now = new Date();
      const selectedTime = new Date(formData.lockExpiredAt);
      if (selectedTime <= now) {
        newErrors.lockExpiredAt = '미래 시간을 선택해주세요.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);

      // 먼저 컨텐츠 준비
      const formDataForContent = new FormData();
      formDataForContent.append('data', JSON.stringify({
        content: formData.content
      }));
      
      files.forEach((file) => {
        formDataForContent.append('files', file);
      });

      await api.post(`/groups/${groupId}/rockets/contents`, formDataForContent, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // 그다음 로켓 전송
      await api.post(`/groups/${groupId}/rockets`, {
        rocketName: formData.rocketName.trim(),
        design: formData.design,
        lockExpiredAt: formData.lockExpiredAt
      });

      alert('모임 로켓이 성공적으로 발사되었습니다! 🚀');
      navigate(`/groups/${groupId}`);

    } catch (err) {
      console.error('로켓 전송 실패:', err);
      alert('로켓 발사에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // 채팅 히스토리 불러오기
  const fetchChatHistory = async (beforeMessageId = Number.MAX_SAFE_INTEGER) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/chats/history`, {
        params: { beforeMessageId, size: 5 }
      });
      const { messages: historyMessages, hasNext } = res.data.data;

      if (!historyMessages.length) {
        setHasMore(false);
        return;
      }

      setMessages(prev => [...historyMessages.reverse(), ...prev]);
      setHasMore(hasNext);
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stompClient || !stompClient.connected || !groupId || !accessToken) return;

    fetchChatHistory();

    subscriptionRef.current = stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
      const payload = JSON.parse(message.body);
      setMessages((prev) => [...prev, payload]);
    });

    stompClient.publish({
      destination: `/app/group/${groupId}/enter`,
      body: '',
    });

    return () => {
      if (stompClient && stompClient.connected) {
        subscriptionRef.current?.unsubscribe();
        stompClient.publish({
          destination: `/app/group/${groupId}/exit`,
          body: '',
        });
      }
    };
  }, [stompClient?.connected, groupId, accessToken]);

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && messages.length > 0 && hasMore && !loading) {
      const firstMessageId = messages[0]?.chatMessageId || Number.MAX_SAFE_INTEGER;
      const prevScrollHeight = container.scrollHeight;

      fetchChatHistory(firstMessageId).then(() => {
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }, 50);
      });
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    stompClient.publish({
      destination: `/app/group/${groupId}/chat`,
      body: JSON.stringify({ message: newMessage }),
    });

    setNewMessage('');
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const period = hours < 12 ? '오전' : '오후';
    const displayHour = hours % 12 || 12;

    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const paddedMinute = minutes.toString().padStart(2, '0');

    return `${paddedMonth}월 ${paddedDay}일 ${period} ${displayHour}:${paddedMinute}`;
  };

  if (isLoading && !group) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>모임 정보를 불러오는 중...</p>
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

  return (
    <div className={styles.groupRocketCreateContainer}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button
          onClick={() => navigate(`/groups/${groupId}`)}
          className={styles.backButton}
        >
          <BackIcon /> 돌아가기
        </button>
        <div className={styles.headerInfo}>
          <h1><RocketIcon /> 함께 만드는 모임 로켓</h1>
          <span><GroupIcon /> {group.groupName} {isOwner && <span className={styles.ownerBadge}>방장</span>}</span>
        </div>
      </div>

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        {/* 왼쪽 영역 */}
        <div className={styles.leftSection}>
          {/* 공동 메시지 작성 카드 */}
          <div className={styles.messageCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <h3>💬 함께 작성하는 메시지</h3>
                <p>모든 참가자가 메시지를 작성해주세요</p>
              </div>
              {/* 준비 상태 토글 버튼을 오른쪽 상단에 배치 */}
              <div className={styles.headerRight}>
                <button 
                  className={`${styles.readyToggleButton} ${isMyReady ? styles.ready : styles.notReady}`}
                  onClick={handleToggleMyReady}
                >
                  {isMyReady ? '✅ 준비 완료' : '❌ 준비 중'}
                </button>
              </div>
            </div>

            <div className={styles.messageEditor}>
              <div className={styles.messagePreview}>
                <div className={styles.previewHeader}>
                  <div className={styles.avatar}>
                    <UserIcon />
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>나</span>
                    <span className={styles.timeStamp}>지금</span>
                  </div>
                </div>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className={`${styles.messageInput} ${errors.content ? styles.error : ''}`}
                  placeholder="모임원들과 함께 나누고 싶은 이야기를 작성해보세요...&#10;&#10;예시:&#10;• 오늘 모임 정말 즐거웠어요!&#10;• 다음에도 함께 해요 😊&#10;• 소중한 추억 감사합니다"
                  rows={4}
                  maxLength={500}
                />
                <div className={styles.inputFooter}>
                  <span className={styles.charCount}>{formData.content.length}/500</span>
                </div>
              </div>
            </div>

            {/* 파일 첨부 */}
            <div className={styles.fileSection}>
              <label className={styles.fieldLabel}>📎 파일 첨부 (선택사항)</label>
              <div className={styles.fileUploadArea}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={styles.hiddenFileInput}
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  max="5"
                />
                <div
                  className={styles.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className={styles.uploadIcon} />
                  <div className={styles.uploadText}>
                    <p>파일을 선택하거나 드래그해서 업로드</p>
                    <span>이미지, 동영상, 문서 (최대 5개, 각 10MB 이하)</span>
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className={styles.selectedFiles}>
                  <h4>선택된 파일 ({files.length}/5)</h4>
                  <div className={styles.fileList}>
                    {files.map((file, index) => (
                      <div key={index} className={styles.fileItem}>
                        <FileIcon className={styles.fileIcon} />
                        <div className={styles.fileInfo}>
                          <span className={styles.fileName}>
                            {file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name}
                          </span>
                          <span className={styles.fileSize}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className={styles.removeFileButton}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 참가자 현황 */}
          <div className={styles.participantsCard}>
            <div className={styles.cardHeader}>
              <h3>👥 참가자 현황 ({getCompleteCount()}/{members.length})</h3>
              <p>모든 참가자가 준비 완료되면 로켓을 발사할 수 있어요</p>
            </div>

            <div className={styles.participantsList}>
              {Array.isArray(members) && members.map((member) => (
                <div key={member.userId} className={styles.participantItem}>
                  <div className={styles.participantInfo}>
                    <div className={styles.participantAvatar}>
                      <UserIcon />
                    </div>
                    <div className={styles.participantDetails}>
                      <span className={styles.participantName}>
                        {member.nickname}
                        {member.userId === group.leaderId && <span className={styles.ownerIcon}>👑</span>}
                      </span>
                      <div className={styles.participantStatus}>
                        <span className={member.isReady ? styles.readyStatus : styles.waitingStatus}>
                          {member.isReady ? '준비 완료' : '준비 중'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 방장만 다른 멤버 강퇴 가능 */}
                  {isOwner && member.userId !== group.leaderId && member.userId !== userId && (
                    <button
                      onClick={() => handleKickMember(member.userId)}
                      className={styles.kickButton}
                      title="멤버 강퇴"
                    >
                      <KickIcon />
                    </button>
                  )}
                </div>
              ))}

              {(!Array.isArray(members) || members.length === 0) && (
                <div className={styles.noMembers}>
                  <p>멤버 정보를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 영역 */}
        <div className={styles.rightSection}>
          {/* 로켓 설정 카드 (방장만) */}
          {isOwner && (
            <div className={styles.configCard}>
              <div className={styles.cardHeader}>
                <h3>⚙️ 로켓 설정 (방장 전용)</h3>
                <p>로켓의 세부 정보를 설정해주세요</p>
              </div>

              <div className={styles.configForm}>
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>로켓 이름 *</label>
                  <input
                    type="text"
                    name="rocketName"
                    value={formData.rocketName}
                    onChange={handleInputChange}
                    className={`${styles.fieldInput} ${errors.rocketName ? styles.error : ''}`}
                    placeholder="로켓 이름을 입력하세요"
                    maxLength={30}
                  />
                  {errors.rocketName && (
                    <div className={styles.errorText}>{errors.rocketName}</div>
                  )}
                </div>

                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>잠금 해제 시간 *</label>
                  <input
                    type="datetime-local"
                    name="lockExpiredAt"
                    value={formData.lockExpiredAt}
                    onChange={handleInputChange}
                    className={`${styles.fieldInput} ${errors.lockExpiredAt ? styles.error : ''}`}
                    min={getMinDateTime()}
                  />
                  <div className={styles.fieldHint}>
                    설정한 시간에 모임원들이 로켓을 열어볼 수 있어요
                  </div>
                  {errors.lockExpiredAt && (
                    <div className={styles.errorText}>{errors.lockExpiredAt}</div>
                  )}
                </div>

                {/* 로켓 디자인 선택 */}
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>로켓 디자인 *</label>
                  <div className={styles.designGrid}>
                    {DESIGN_OPTIONS.map((design) => (
                      <div
                        key={design.value}
                        className={`${styles.designOption} ${formData.design === design.value ? styles.selected : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, design: design.value }))}
                      >
                        <div className={styles.designImageWrapper}>
                          <img
                            src={design.preview}
                            alt={design.label}
                            className={styles.designImage}
                            onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
                          />
                          {formData.design === design.value && (
                            <div className={styles.selectedBadge}>✓</div>
                          )}
                        </div>
                        <span className={styles.designLabel}>{design.label}</span>
                      </div>
                    ))}
                  </div>
                  {errors.design && (
                    <div className={styles.errorText}>{errors.design}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 로켓 미리보기 (일반 멤버용) */}
          {!isOwner && (
            <div className={styles.previewCard}>
              <div className={styles.cardHeader}>
                <h3>🚀 로켓 미리보기</h3>
                <p>방장이 설정 중인 로켓 정보예요</p>
              </div>

              <div className={styles.rocketPreview}>
                <div className={styles.previewInfo}>
                  <h4>{formData.rocketName || '로켓 이름 설정 중...'}</h4>
                  <p>잠금 해제: {formData.lockExpiredAt ?
                    new Date(formData.lockExpiredAt).toLocaleString('ko-KR') :
                    '시간 설정 중...'}</p>
                </div>
                {formData.design && (
                  <div className={styles.previewDesign}>
                    <img
                      src={formData.design}
                      alt="선택된 로켓 디자인"
                      className={styles.previewImage}
                      onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 실시간 채팅 */}
          <div className={styles.chatCard}>
            <div className={styles.cardHeader}>
              <h3>💬 실시간 채팅</h3>
            </div>
            <div className={styles.chatBox}>
              <div
                className={styles.messages}
                onScroll={handleScroll}
                ref={messageContainerRef}
              >
                {messages.map((msg, index) => {
                  const isMine = msg.nickname === myNickname;
                  const isEnterOrExitMessage = !msg.message?.trim();

                  return (
                    <div
                      key={index}
                      className={`${styles.message} ${isMine ? styles.myMessage : styles.otherMessage} ${isEnterOrExitMessage ? styles.systemMessage : ''}`}
                    >
                      {isEnterOrExitMessage ? (
                        <em>{msg.nickname}님이 입장하셨습니다.</em>
                      ) : (
                        <>
                          <div className={styles.messageHeader}>
                            <strong>
                              {msg.nickname}
                              {isMine && ' (나)'}
                            </strong>
                            {msg.sentAt && (
                              <span className={styles.timestamp}>
                                {formatTimestamp(msg.sentAt)}
                              </span>
                            )}
                          </div>
                          <div className={styles.messageContent}>{msg.message}</div>
                        </>
                      )}
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className={styles.chatInput}
                />
                <button 
                  type="submit" 
                  className={styles.sendButton} 
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 발사 버튼 */}
      <div className={styles.launchSection}>
        {isOwner && (
          <button
            onClick={handleRocketSubmit}
            className={`${styles.launchButton} ${!isAllMembersComplete() ? styles.disabled : ''}`}
            disabled={isLoading || !isAllMembersComplete()}
          >
            <span className={styles.launchIcon}>🚀</span>
            <span className={styles.launchText}>
              {isLoading ? '발사 준비 중...' :
                !isAllMembersComplete() ? '모든 참가자 완료 대기 중...' :
                  '로켓 발사하기'}
            </span>
          </button>
        )}

        {!isOwner && (
          <div className={styles.waitingMessage}>
            <span>방장이 로켓을 발사할 때까지 기다려주세요 ⏳</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupRocketCreate;
