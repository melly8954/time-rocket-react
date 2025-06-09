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
  const [members, setMembers] = useState([]); // 빈 배열로 초기화
  const [currentRound, setCurrentRound] = useState(1);
  const [formData, setFormData] = useState({
    rocketName: '',
    design: '',
    lockExpiredAt: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 실시간 채팅 state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [hasMore, setHasMore] = useState(true);   // 더 불러올 메시지 있는지 여부
  const [loading, setLoading] = useState(false);  // 이전 메시지 불러오는 중 중복방지
  const messageEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const myNickname = useAuthStore(state => state.nickname);
  const stompClient = useAuthStore((state) => state.stompClient);
  const subscriptionRef = useRef(null);

  // 로켓 컨텐츠 준비 state
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState([]);


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
        setIsOwner(groupData.ownerId === userId);

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
      const responseData = response.data?.data;

      if (responseData && Array.isArray(responseData.members)) {
        setMembers(responseData.members); // 불필요한 가공 없이 바로 저장
        setCurrentRound(responseData.currentRound);
      } else {
        console.warn('응답 데이터 형식이 올바르지 않습니다:', response.data);
        setMembers([]);
      }
    } catch (err) {
      console.error('멤버 조회 실패:', err);
      alert('멤버 정보를 불러오는 데 실패했습니다.');
    }
  };

  // 모든 멤버가 완료했는지 확인 (안전하게)
  const isAllMembersComplete = () => {
    if (!Array.isArray(members) || members.length === 0) {
      return false;
    }
    return members.every(member => member.status === 'COMPLETE');
  };

  // 완료된 멤버 수 계산 (안전하게)
  const getCompleteCount = () => {
    if (!Array.isArray(members)) {
      return 0;
    }
    return members.filter(member => member.status === 'COMPLETE').length;
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

  // 로켓 생성 및 전송
  const handleRocketSubmit = async (e) => {
    e.preventDefault();

    if (!isOwner) {
      alert('방장만 로켓을 발사할 수 있습니다.');
      return;
    }

    if (!isAllMembersComplete()) {
      alert('모든 참가자가 작업을 완료해야 로켓을 발사할 수 있습니다.');
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

      // FormData 생성 (파일 업로드 포함)
      const formDataToSend = new FormData();
      formDataToSend.append('rocketName', formData.rocketName.trim());
      formDataToSend.append('design', formData.design);
      formDataToSend.append('lockExpiredAt', formData.lockExpiredAt);
      formDataToSend.append('content', formData.content);

      // 파일 추가
      files.forEach((file, index) => {
        formDataToSend.append(`files`, file);
      });

      await api.post(`/groups/${groupId}/rockets`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('모임 로켓이 성공적으로 발사되었습니다! 🚀');
      navigate(`/groups/${groupId}`);

    } catch (err) {
      console.error('로켓 전송 실패:', err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;

      if (err.response?.status === 400) {
        alert(`요청 오류: ${backendMessage || '입력 정보를 확인해주세요.'}`);
      } else if (err.response?.status === 403) {
        alert(`권한 오류: ${backendMessage || '방장만 로켓을 발사할 수 있습니다.'}`);
      } else if (err.response?.status === 500) {
        alert(`서버 오류: ${backendMessage || '백엔드 서버에 문제가 있습니다.'}`);
      } else {
        alert(`로켓 발사 실패: ${backendMessage || '알 수 없는 오류'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // chat - psw
  // 히스토리 불러오기 함수
  const fetchChatHistory = async (beforeMessageId = Number.MAX_SAFE_INTEGER) => {
    if (loading || !hasMore) return;  // 중복 호출 방지 및 더 없으면 종료

    setLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/chats/history`, {
        params: { beforeMessageId, size: 5 }
      });
      const { messages: historyMessages, hasNext } = res.data.data;

      if (!historyMessages.length) {
        setHasMore(false); // 더 이상 메시지 없음
        return;
      }

      // 메시지 정렬은 API가 어떤 순서로 보내는지 확인 후 필요시 reverse
      // 여기서는 오래된 순으로 온다고 가정 (오래된 메시지 → 최근 메시지)
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

    // 초기 히스토리 조회 (가장 최신 메시지부터)
    fetchChatHistory();

    // 실시간 채팅 구독
    subscriptionRef.current = stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
      const payload = JSON.parse(message.body);
      console.log('받은 메시지:', payload);
      setMessages((prev) => [...prev, payload]);
    });
    console.log(`Subscribed to /topic/group/${groupId}`);

    // 준비 상태 구독
    const readyStatusSub = stompClient.subscribe(`/topic/group/${groupId}/readyStatus`, (message) => {
      const payload = JSON.parse(message.body);
      console.log('준비 상태 메시지 받음:', payload);

      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          String(member.userId) === String(payload.userId)
            ? { ...member, isReady: payload.isReady }
            : member
        )
      );
    });
    console.log(`Subscribed to /topic/group/${groupId}/readyStatus`);

    // 입장 메시지 발송
    stompClient.publish({
      destination: `/app/group/${groupId}/enter`,
      body: '',
    });
    console.log('Enter 메시지 발송');

    return () => {
      // 컴포넌트 언마운트
      if (stompClient && stompClient.connected) {
        // 실시간 채팅 구독 해제
        subscriptionRef.current?.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}`);
        // 준비 상태 구독 해제
        readyStatusSub.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}/readyStatus`);

        // 퇴장 메시지 발송
        stompClient.publish({
          destination: `/app/group/${groupId}/exit`,
          body: '',
        });
        console.log('Exit 메시지 발송');
      }
    };
  }, [stompClient?.connected, groupId, accessToken]);

  // 스크롤 위치 복원
  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && messages.length > 0 && hasMore && !loading) {
      const firstMessageId = messages[0]?.chatMessageId || Number.MAX_SAFE_INTEGER;
      const prevScrollHeight = container.scrollHeight;

      fetchChatHistory(firstMessageId).then(() => {
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          // 이전과 새로 생긴 높이 차만큼 스크롤 위치를 내려줌으로써 스크롤 유지
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
    console.log('보내는 메시지:', newMessage);

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

    // 오전/오후
    const period = hours < 12 ? '오전' : '오후';
    const displayHour = hours % 12 || 12; // 0시는 12시로 표시

    // 두 자리수 보장
    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const paddedMinute = minutes.toString().padStart(2, '0');

    return `${paddedMonth}월 ${paddedDay}일 ${period} ${displayHour}:${paddedMinute}`;
  };

  // 모임 로켓 컨텐츠 준비완료
  const handleSubmit = async () => {
    if (!formData.content.trim()) {
      alert('메시지를 작성해주세요.');
      return;
    }

    const form = new FormData();
    const requestData = {
      content: formData.content,
    };

    const jsonBlob = new Blob([JSON.stringify(requestData)], {
      type: 'application/json',
    });

    form.append('data', jsonBlob);

    files.forEach((file) => {
      form.append('files', file);
    });

    try {
      const response = await api.post(`/groups/${groupId}/rockets/contents`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('모임 로켓 메시지를 성공적으로 저장했습니다!');
      console.log(response.data);

      // 저장 후 초기화
      setFormData({ content: '' });
      setFiles([]);

      // 퍼블리시 준비 상태 전송
      stompClient.publish({
        destination: `/app/group/${groupId}/readyStatus`,
        body: JSON.stringify({
          groupId: groupId,
          currentRound: currentRound,
          isReady: true,
        }),
      });
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
      console.error(error);
    }
  };


  // -----
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
              <h3>💬 함께 작성하는 메시지</h3>
              <p>모든 참가자가 메시지를 작성해주세요</p>
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
            <div className={styles.actionSection}>
              <button onClick={handleSubmit} className={styles.submitButton}>
                ✉️ 메시지 저장하기
              </button>
            </div>
          </div>

          {/* 참가자 현황 */}
          <div className={styles.nicknameFrame}>
            {Array.isArray(members) && members.map((member) => (
              <div
                key={member.userId}
                className={styles.nicknameBox}
                style={{
                  border: '2px solid',
                  borderColor: member.isReady ? 'green' : 'red',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  margin: '6px',
                  display: 'inline-block',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '100px'
                }}
              >
                <div>{member.nickname}</div>
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '0.85rem',
                    color: member.isReady ? 'green' : 'red',
                    fontWeight: 'normal',
                  }}
                >
                  {member.isReady ? '준비 완료' : '대기 중'}
                </div>
              </div>
            ))}
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

          {/* 실시간 채팅 카드 */}
          <div style={sstyles.container}>
            <h2>실시간 채팅</h2>
            <div style={sstyles.chatBox}>
              <div
                style={sstyles.messages}
                onScroll={handleScroll}        // 스크롤 이벤트 핸들러 추가
                ref={messageContainerRef}      // ref 추가
              >
                {messages.map((msg, index) => {
                  const isMine = msg.nickname === myNickname;
                  const isEnterOrExitMessage = !msg.message?.trim();

                  return (
                    <div
                      key={index}
                      style={{
                        ...sstyles.message,
                        textAlign: isEnterOrExitMessage ? 'center' : isMine ? 'right' : 'left',
                        backgroundColor: isEnterOrExitMessage ? '#eee' : isMine ? '#dcf8c6' : '#ffffff',
                        borderRadius: '8px',
                        padding: '8px',
                        margin: '5px 0',
                        alignSelf: isEnterOrExitMessage ? 'center' : isMine ? 'flex-end' : 'flex-start',
                        fontStyle: isEnterOrExitMessage ? 'italic' : 'normal',
                        color: isEnterOrExitMessage ? '#888' : 'inherit',
                      }}
                    >
                      {isEnterOrExitMessage ? (
                        <em>
                          {msg.nickname}님이 입장하셨습니다.
                        </em>
                      ) : (
                        <>
                          <div style={sstyles.header}>
                            <strong>
                              {msg.nickname}
                              {isMine && ' (나)'}
                            </strong>{' '}
                            {msg.sentAt && (
                              <span style={sstyles.timestamp}>
                                {formatTimestamp(msg.sentAt)}
                              </span>
                            )}
                          </div>
                          <div>{msg.message}</div>
                        </>
                      )}
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              <form onSubmit={handleSendMessage} style={sstyles.inputForm}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  style={sstyles.input}
                />
                <button type="submit" style={sstyles.button} disabled={!newMessage.trim()}>
                  전송
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

const sstyles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  chatBox: {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: '#f9f9f9',
  },
  messages: {
    height: '300px',
    overflowY: 'auto',
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    padding: '5px 0',
    borderBottom: '1px solid #eee',
  },
  inputForm: {
    display: 'flex',
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '8px',
  },
  button: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    cursor: 'pointer',
  },
  timestamp: {
    color: '#888', // 회색
    fontSize: '0.85em',
  }
};

export default GroupRocketCreate;