import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../authStore';
import api from '../utils/api';
import debounce from 'lodash/debounce';
import styles from '../style/GroupRocketCreate.module.css';
import { ConfirmModal, AlertModal } from '../components/common/Modal';
import useAlertModal from '../components/common/useAlertModal';
import useConfirmModal from '../components/common/useConfirmModal';
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
  const currentUserId = userId;
  const [isSocketConnected, setIsSocketConnected] = useState(false);

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
  const { alertModal, showAlert, closeAlert, handleApiError } = useAlertModal();
  const { confirmModal, showConfirm, closeConfirm } = useConfirmModal();
  const [navigatePath, setNavigatePath] = useState(null);
  // 로켓 컨텐츠 준비 state
  const [textContent, setTextContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isReady, setIsReady] = useState(false); // 준비 상태 관리


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

  const handleCloseAlert = () => {
    closeAlert();
    if (navigatePath) {
      navigate(navigatePath);
      setNavigatePath(null);
    }
  };

  // 인증 및 그룹 정보 확인
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (groupId) {
      fetchGroupInfo();
      fetchMembers();
      fetchRocketConfig();
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
      }
    } catch (err) {
      handleApiError(err)
      setNavigatePath('/groups');
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
        setMembers([]);
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  // 모든 멤버가 완료했는지 확인 (안전하게)
  const isAllMembersComplete = () => {
    return members.every((member) => member.isReady);
  };

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      showAlert('최대 5개의 파일만 업로드 가능합니다.');
      return;
    }

    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showAlert('각 파일은 10MB 이하여야 합니다.');
      return;
    }

    setFiles(selectedFiles);
  };

  // 파일 제거
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 모임 로켓 설정 확정
  const handleConfigSave = async () => {
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
      // API 호출: DB에 설정 저장
      await api.put(`/groups/${groupId}/rocket-config`, {
        rocketName: formData.rocketName.trim(),
        design: formData.design,
        lockExpiredAt: formData.lockExpiredAt,
      });

      // 저장 성공 시 소켓으로 브로드캐스트
      if (stompClient && isOwner) {
        stompClient.publish({
          destination: `/app/group/${groupId}/rocket-config`,
          body: JSON.stringify({
            rocketName: formData.rocketName.trim(),
            design: formData.design,
            lockExpiredAt: formData.lockExpiredAt,
            senderId: userId,
          }),
        });
      }

      showAlert('설정이 성공적으로 저장되었습니다!');
    } catch (error) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 모임 로켓 설정 조회
  const fetchRocketConfig = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/rocket-config`);
      const data = res.data?.data;

      if (data) {
        setFormData(prev => ({
          ...prev,
          rocketName: data.rocketName || '',
          design: data.design || '',
          lockExpiredAt: data.lockExpiredAt || '',
        }));
      }
    } catch (err) {
      console.log("기존 저장된 로켓 설정이 존재하지 않습니다." + err);
    }
  };

  // 모임 로켓 전송
  const handleRocketSubmit = async (e) => {
    e.preventDefault();

    if (!isOwner) {
      showAlert('방장만 로켓을 발사할 수 있습니다.');
      return;
    }

    if (!isAllMembersComplete()) {
      showAlert('모든 참가자가 작업을 완료해야 로켓을 발사할 수 있습니다.');
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

      // JSON 데이터 직접 전송
      const dataToSend = {
        rocketName: formData.rocketName.trim(),
        design: formData.design,
        lockExpiredAt: formData.lockExpiredAt,
      };

      await api.post(`/groups/${groupId}/rockets`, dataToSend);

      showAlert('모임 로켓이 성공적으로 발사되었습니다! 🚀');
      setNavigatePath(`/groups/${groupId}`);

      // 모임 로켓 전송 pub
      stompClient.publish({
        destination: `/app/group/${groupId}/send`,
        body: '',
      });
      console.log('모임 로켓 전송');

    } catch (err) {
      handleApiError(err);
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
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stompClient || !groupId || !accessToken) return;

    const onConnect = () => {
      console.log(`STOMP 연결 완료 - 그룹 ${groupId}`);

      // 멤버 정보 최신화
      fetchMembers();

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

      // 강퇴 구독
      const kickSub = stompClient.subscribe(`/topic/group/${groupId}/kick`, (message) => {
        const kickedUserId = message.body;
        console.log('강퇴 메시지 받음:', kickedUserId);

        setMembers((prevMembers) => {
          const hasKickedUser = prevMembers.some(m => String(m.userId) === String(kickedUserId));
          const filtered = prevMembers.filter(m => String(m.userId) !== String(kickedUserId));

          if (!hasKickedUser) {
            // 새로고침 후 유저 리스트가 잘못되었을 수 있으니 fetchMembers 재호출
            fetchMembers();
          }

          return filtered;
        });
      });
      console.log(`Subscribed to /topic/group/${groupId}/kick`);

      const myKickSub = stompClient.subscribe('/user/queue/kick', (message) => {
        showAlert('방장에 의해 강퇴당했습니다.');
        setNavigatePath(`/groups/${groupId}`);
      });
      console.log(`Subscribed to /user/queue/kick`);

      // 입장 메시지 발송
      stompClient.publish({
        destination: `/app/group/${groupId}/enter`,
        body: '',
      });
      console.log('Enter 메시지 발송');

      // 멤버 현황 구독
      const membersSub = stompClient.subscribe(
        `/topic/group/${groupId}/members`,
        (message) => {
          const payload = JSON.parse(message.body);

          if (payload.member) {
            // 입장한 유저 추가
            setMembers((prev) => [...prev, payload.member]);
          } else if (payload.leaveUserId) {
            // 퇴장한 유저 제거
            setMembers((prev) =>
              prev.filter((m) => m.userId !== payload.leaveUserId)
            );
          } else {
            fetchMembers(); // fallback
          }
        }
      );
      console.log(`Subscribed to /topic/group/${groupId}/members`);

      // 로켓 전송 구독
      const rocketSendSub = stompClient.subscribe(
        `/topic/group/${groupId}/send`,
        (message) => {
          const payload = JSON.parse(message.body);
          console.log('로켓 전송 메시지:', payload);

          // 내 메시지면 무시 (리더가 자기 pub에 반응하지 않도록)
          if (payload.senderId === userId) return;

          if (payload.type === 'rocketSent') {
            showAlert(`모임장이 로켓을 전송했습니다!`);
            setNavigatePath(`/groups/${groupId}`);
          }
        }
      );
      console.log(`Subscribed to /topic/group/${groupId}/send`);

      // 로켓 설정 실시간 반영 구독
      const rocketConfigSub = stompClient.subscribe(
        `/topic/group/${groupId}/rocket-config`,
        (message) => {
          const data = JSON.parse(message.body);
          console.log('로켓 설정 업데이트 수신:', data);

          // 방장이 보낸 메시지면 무시 (자기 자신)
          if (data.senderId && data.senderId === userId) return;

          setFormData((prev) => ({ ...prev, ...data }));
        }
      );
      console.log(`Subscribed to /topic/group/${groupId}/rocket-config`);

      return () => {
        // 구독 해제
        subscriptionRef.current?.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}`);

        readyStatusSub.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}/readyStatus`);

        kickSub.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}/kick`);

        myKickSub.unsubscribe();
        console.log('Unsubscribed from /user/queue/kick');

        membersSub.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}/members`);

        rocketSendSub.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}/send`);

        rocketConfigSub.unsubscribe();
        console.log(`Unsubscribed from /topic/group/${groupId}/rocket-config`);

        // 퇴장 메시지 발송
        stompClient.publish({
          destination: `/app/group/${groupId}/exit`,
          body: '',
        });
        console.log('Exit 메시지 발송');
      };
    };

    if (stompClient.connected) {
      // 이미 연결되어 있다면 바로 onConnect 실행
      const cleanup = onConnect();
      return cleanup;
    } else {
      // 연결 완료 이벤트에 onConnect 콜백 등록
      stompClient.onConnect = () => {
        console.log('STOMP onConnect 이벤트 발생');
        const cleanup = onConnect();
        // cleanup 반환값이 있으면 호출할 수 있도록 리턴 (선택사항)
        return cleanup;
      };
    }

    return () => {
      // 컴포넌트 언마운트 시 onConnect 콜백 제거
      stompClient.onConnect = null;
    };
  }, [stompClient, groupId, accessToken]);

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

  // 모임 로켓 컨텐츠 저장
  const handleSubmit = async () => {
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

      showAlert('모임 로켓 메시지를 성공적으로 저장했습니다!');
      console.log(response.data);

      // 저장 후 초기화
      setFormData(prev => ({
        ...prev,
        content: '',
      }));
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
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCancelReady = async () => {
    try {
      // 백엔드 API에 맞춰서 수정
      await api.patch(`/groups/${groupId}/readyStatus`, {
        isReady: false,
        currentRound: currentRound
      });

      setIsReady(false);

      // 준비 취소 pub 메시지 전송
      stompClient.publish({
        destination: `/app/group/${groupId}/readyStatus`,
        body: JSON.stringify({
          groupId: groupId,
          currentRound: currentRound,
          isReady: false,
        }),
      });

      showAlert(`컨텐츠 준비를 취소했습니다.`);
    } catch (err) {
      handleApiError(err);
    }
  };

  // 참여자 강퇴(리더전용)
  const handleKick = (targetUserId) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/group/${groupId}/kick`,
        body: JSON.stringify({ userId: targetUserId }),
      });
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
            {Array.isArray(members) && members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const isNotMe = member.userId !== currentUserId;

              return (
                <div
                  key={member.userId}
                  className={styles.nicknameBox}
                  style={{
                    border: '2px solid',
                    borderColor: member.isReady ? 'green' : 'red'
                  }}
                >
                  <div>{member.nickname}</div>
                  <div
                    style={{
                      marginTop: '14px',
                      fontSize: '0.85rem',
                      color: member.isReady ? 'green' : 'red',
                      fontWeight: 'normal',
                    }}
                  >
                    {member.isReady ? '준비 완료' : '대기 중'}
                  </div>

                  <div style={{ marginTop: 'auto', minHeight: '28px' }}>
                    {isCurrentUser && member.isReady ? (
                      <button
                        onClick={handleCancelReady}
                        style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        준비 취소
                      </button>
                    ) : (
                      <div style={{ height: '18px' }} />
                    )}
                  </div>

                  {/* 리더이고 자기 자신이 아닌 경우만 강퇴 버튼 표시 */}
                  {isOwner && isNotMe && (
                    <button
                      onClick={() => handleKick(member.userId)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        backgroundColor: '#ff4d4f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      강퇴
                    </button>
                  )}
                </div>
              );
            })}
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
                        onClick={() => {
                          const updated = { ...formData, design: design.value };
                          setFormData(updated);

                          if (isOwner) {
                            broadcastRocketConfig(updated);
                          }
                        }}
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
                <div className={styles.formField}>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleConfigSave}
                  >
                    설정 확정
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* 로켓 미리보기 (일반 멤버용) */}
          {/* 로켓 미리보기 (일반 멤버용) */}
          {!isOwner && (
            <div className={styles.previewCard}>
              <div className={styles.cardHeader}>
                <h3>🚀 로켓 미리보기</h3>
                <p>모임장이 설정 중인 로켓 정보예요</p>
              </div>

              <div className={styles.rocketPreview}>
                <div className={styles.previewInfo}>
                  <h4 style={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #9333ea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
                  }}>
                    {formData.rocketName || '로켓 이름 설정 중...'}
                  </h4>
                  <p style={{ color: '#a0aec0', fontSize: '13px' }}>
                    잠금 해제: {formData.lockExpiredAt
                      ? new Date(formData.lockExpiredAt).toLocaleString('ko-KR')
                      : '시간 설정 중...'}
                  </p>
                </div>

                {formData.design ? (
                  <div className={styles.previewDesign}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                      borderRadius: '15px',
                      padding: '20px',
                      border: '2px solid rgba(79, 172, 254, 0.3)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <img
                        src={formData.design}
                        alt="실시간 로켓 디자인"
                        className={styles.previewImage}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 0 15px rgba(79, 172, 254, 0.6))',
                          animation: 'rocketFloat 2s ease-in-out infinite'
                        }}
                        onError={(e) => { e.target.src = '/src/assets/rocket.png' }}
                      />
                      <span style={{
                        fontSize: '12px',
                        color: '#00d4ff',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: '600',
                        textShadow: '0 0 8px rgba(0, 212, 255, 0.4)'
                      }}>
                        {DESIGN_OPTIONS.find(option => option.value === formData.design)?.label || '선택됨'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#a0aec0',
                    fontStyle: 'italic',
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(79, 172, 254, 0.05) 100%)',
                    borderRadius: '15px',
                    border: '2px dashed rgba(79, 172, 254, 0.3)'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛠️</div>
                    <p>모임장이 로켓 디자인을 선택하면<br />여기에 실시간으로 표시됩니다</p>
                  </div>
                )}
              </div>

              {/* 실시간 업데이트 인디케이터 (원하면 생략 가능) */}
              <div style={{
                marginTop: '15px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, rgba(46, 213, 115, 0.1) 0%, rgba(0, 206, 201, 0.1) 100%)',
                border: '1px solid rgba(46, 213, 115, 0.3)',
                borderRadius: '20px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#2ed573',
                fontFamily: "'Space Grotesk', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  background: '#2ed573',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></span>
                실시간 동기화 중
              </div>
            </div>
          )}

          {/* 실시간 채팅 카드 */}
          <div style={sstyles.container}>
            <h2 style={sstyles.h2}>실시간 채팅</h2>
            <div style={sstyles.chatBox}>
              <div
                style={sstyles.messages}
                onScroll={handleScroll}
                ref={messageContainerRef}
              >
                {messages.map((msg, index) => {
                  const isMine = msg.nickname === myNickname;
                  const isEnterOrExitMessage = !msg.message?.trim();
                  const isEnterMessage = msg.message?.includes('참여했습니다') || msg.message?.includes('입장하셨습니다');
                  const isExitMessage = msg.message?.includes('나갔습니다') || msg.message?.includes('퇴장하셨습니다');

                  // 스타일 결정
                  let messageStyle = { ...sstyles.message };

                  if (isEnterOrExitMessage || isEnterMessage || isExitMessage) {
                    // 시스템 메시지 (입장/퇴장)
                    messageStyle = {
                      ...messageStyle,
                      alignSelf: 'center',
                      background: isEnterMessage
                        ? 'linear-gradient(135deg, rgba(46, 213, 115, 0.15) 0%, rgba(0, 206, 201, 0.15) 100%)'
                        : isExitMessage
                          ? 'linear-gradient(135deg, rgba(255, 71, 87, 0.15) 0%, rgba(255, 99, 71, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 50%, rgba(255, 69, 0, 0.15) 100%)',
                      border: isEnterMessage
                        ? '2px solid rgba(46, 213, 115, 0.5)'
                        : isExitMessage
                          ? '2px solid rgba(255, 71, 87, 0.5)'
                          : '2px solid rgba(255, 215, 0, 0.4)',
                      color: isEnterMessage
                        ? '#2ed573'
                        : isExitMessage
                          ? '#ff4757'
                          : '#ffd700',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontFamily: "'Space Grotesk', sans-serif",
                      borderRadius: '25px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      textShadow: isEnterMessage
                        ? '0 0 10px rgba(46, 213, 115, 0.5)'
                        : isExitMessage
                          ? '0 0 10px rgba(255, 71, 87, 0.5)'
                          : '0 0 10px rgba(255, 215, 0, 0.5)',
                      boxShadow: isEnterMessage
                        ? '0 4px 20px rgba(46, 213, 115, 0.2)'
                        : isExitMessage
                          ? '0 4px 20px rgba(255, 71, 87, 0.2)'
                          : '0 4px 20px rgba(255, 215, 0, 0.2)',
                      maxWidth: '90%',
                      fontStyle: 'italic',
                    };
                  } else if (isMine) {
                    // 내 메시지
                    messageStyle = {
                      ...messageStyle,
                      alignSelf: 'flex-end',
                      background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                      borderColor: 'rgba(79, 172, 254, 0.4)',
                      color: '#e2e8f0',
                      textAlign: 'right',
                      borderRadius: '15px 15px 5px 15px',
                      boxShadow: '0 4px 15px rgba(79, 172, 254, 0.2)',
                    };
                  } else {
                    // 다른 사람 메시지
                    messageStyle = {
                      ...messageStyle,
                      alignSelf: 'flex-start',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#e2e8f0',
                      textAlign: 'left',
                      borderRadius: '15px 15px 15px 5px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    };
                  }

                  return (
                    <div
                      key={index}
                      style={messageStyle}
                      onMouseEnter={(e) => {
                        if (!isEnterOrExitMessage && !isEnterMessage && !isExitMessage) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = isMine
                            ? '0 6px 25px rgba(79, 172, 254, 0.3)'
                            : '0 6px 20px rgba(0, 0, 0, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isEnterOrExitMessage && !isEnterMessage && !isExitMessage) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = isMine
                            ? '0 4px 15px rgba(79, 172, 254, 0.2)'
                            : '0 4px 15px rgba(0, 0, 0, 0.2)';
                        }
                      }}
                    >
                      {isEnterOrExitMessage || isEnterMessage || isExitMessage ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>
                            {isEnterMessage ? '🚀' : isExitMessage ? '👋' : '📢'}
                          </span>
                          <span style={{ fontWeight: '600' }}>
                            {isEnterOrExitMessage
                              ? `${msg.nickname}님이 입장하셨습니다.`
                              : msg.message
                            }
                          </span>
                        </div>
                      ) : (
                        <>
                          <div style={sstyles.header}>
                            <strong style={{
                              color: isMine ? '#00d4ff' : '#a0aec0',
                              textShadow: isMine ? '0 0 8px rgba(0, 212, 255, 0.4)' : 'none',
                              fontFamily: "'Space Grotesk', sans-serif",
                              fontWeight: '600'
                            }}>
                              {msg.nickname}
                              {isMine && ' (나)'}
                            </strong>
                            {msg.sentAt && (
                              <span style={sstyles.timestamp}>
                                {formatTimestamp(msg.sentAt)}
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            lineHeight: '1.4',
                            wordWrap: 'break-word',
                            fontFamily: "'Inter', sans-serif"
                          }}>
                            {msg.message}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                style={sstyles.inputForm}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(79, 172, 254, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(79, 172, 254, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  style={{
                    ...sstyles.input,
                    '::placeholder': {
                      color: '#718096',
                      fontStyle: 'italic'
                    }
                  }}
                />
                <button
                  type="submit"
                  style={{
                    ...sstyles.button,
                    ...(newMessage.trim() ? {} : {
                      opacity: '0.5',
                      cursor: 'not-allowed',
                      background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                      transform: 'none',
                      boxShadow: 'none'
                    })
                  }}
                  disabled={!newMessage.trim()}
                  onMouseEnter={(e) => {
                    if (newMessage.trim()) {
                      e.target.style.background = 'linear-gradient(135deg, #00d4ff 0%, #9333ea 100%)';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newMessage.trim()) {
                      e.target.style.background = 'linear-gradient(135deg, #4facfe 0%, #9333ea 100%)';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.3)';
                    }
                  }}
                >
                  전송
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* 발사 버튼 */}
      <div className={styles.launchSection}>
        {isOwner ? (
          <button
            onClick={handleRocketSubmit}
            className={`${styles.launchButton} ${!isAllMembersComplete() ? styles.disabled : ''}`}
            disabled={isLoading || !isAllMembersComplete()}
          >
            <span className={styles.launchIcon}>🚀</span>
            <span className={styles.launchText}>
              {isLoading
                ? '발사 준비 중...'
                : !isAllMembersComplete()
                  ? '모든 참가자 완료 대기 중...'
                  : '로켓 발사하기'}
            </span>
          </button>
        ) : (
          <div className={styles.waitingMessage}>
            <span>방장이 로켓을 발사할 때까지 기다려주세요 ⏳</span>
          </div>
        )}
      </div>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleCloseAlert}
        message={alertModal.message}
        title={alertModal.title}
        type={alertModal.type}
      />
    </div>
  );
};

const sstyles = {
  container: {
    maxWidth: '500px',
    margin: '0 auto',
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    backdropFilter: 'blur(20px)',
    border: '2px solid rgba(79, 172, 254, 0.3)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },

  chatBox: {
    border: '2px solid rgba(79, 172, 254, 0.4)',
    borderRadius: '15px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(79, 172, 254, 0.05) 100%)',
    backdropFilter: 'blur(15px)',
    boxShadow: 'inset 0 0 30px rgba(79, 172, 254, 0.1)',
  },

  messages: {
    height: '300px',
    overflowY: 'auto',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '8px',
    // 스크롤바 스타일
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(79, 172, 254, 0.6) rgba(0, 0, 0, 0.2)',
  },

  message: {
    padding: '12px 16px',
    borderRadius: '15px',
    margin: '3px 0',
    position: 'relative',
    maxWidth: '85%',
    wordWrap: 'break-word',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    lineHeight: '1.4',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },

  inputForm: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(79, 172, 254, 0.05) 100%)',
    border: '2px solid rgba(79, 172, 254, 0.3)',
    borderRadius: '20px',
    padding: '8px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },

  input: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    fontWeight: '400',
    letterSpacing: '-0.01em',
  },

  button: {
    padding: '10px 16px',
    borderRadius: '15px',
    border: 'none',
    background: 'linear-gradient(135deg, #4facfe 0%, #9333ea 100%)',
    color: 'white',
    cursor: 'pointer',
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
    letterSpacing: '-0.02em',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
    fontSize: '12px',
  },

  timestamp: {
    color: 'rgba(160, 174, 192, 0.8)',
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.02em',
  },

  // 제목 스타일
  h2: {
    fontSize: '1.3rem',
    fontWeight: '600',
    fontFamily: "'Space Grotesk', sans-serif",
    background: 'linear-gradient(135deg, #00d4ff 0%, #9333ea 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 20px 0',
    textShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
    letterSpacing: '-0.025em',
    textAlign: 'center',
  }
};

export default GroupRocketCreate;