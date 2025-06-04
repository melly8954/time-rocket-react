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
  const { userId, isLoggedIn } = useAuthStore();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // 상태 관리
  const [group, setGroup] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState([]); // 빈 배열로 초기화
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
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: '시스템',
      message: '모든 참가자가 메시지를 작성하면 로켓을 발사할 수 있습니다! 🚀',
      timestamp: new Date().toISOString(),
      isSystem: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

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

  // 참가자 상태 색상
  const STATUS_COLORS = {
    NONE: '#ff4757', // 빨간색 - 아무것도 안함
    MESSAGE: '#ffa502', // 주황색 - 메시지만 작성
    FILES: '#ffb347', // 노란색 - 메시지 + 파일
    COMPLETE: '#2ed573' // 초록색 - 모든 작업 완료
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
      fetchChatMessages();
    }
  }, [isLoggedIn, groupId]);

  // 채팅 스크롤 자동 이동
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
      if (response.data?.data && Array.isArray(response.data.data)) {
        // 멤버 데이터에 상태 정보 추가
        const membersWithStatus = response.data.data.map(member => ({
          ...member,
          status: member.userId === userId ? getMyStatus() : 'NONE'
        }));
        setMembers(membersWithStatus);
      } else {
        console.warn('멤버 데이터가 배열이 아닙니다:', response.data);
        setMembers([]);
      }
    } catch (err) {
      console.error('멤버 정보 조회 실패:', err);
      // 기본 멤버 추가 (현재 사용자)
      setMembers([
        {
          userId: userId,
          nickname: '나',
          status: getMyStatus(),
          isOwner: isOwner
        }
      ]);
    }
  };

  // 채팅 메시지 조회
  const fetchChatMessages = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/rocket-chat`);
      if (response.data?.data && Array.isArray(response.data.data)) {
        setChatMessages(response.data.data);
      }
    } catch (err) {
      console.error('채팅 메시지 조회 실패:', err);
      // 백엔드가 없어도 기본 메시지 유지
      setChatMessages([
        {
          id: 1,
          sender: '시스템',
          message: '모든 참가자가 메시지를 작성하면 로켓을 발사할 수 있습니다! 🚀',
          timestamp: new Date().toISOString(),
          isSystem: true
        }
      ]);
    }
  };

  // 내 상태 계산
  const getMyStatus = () => {
    if (!formData.content.trim()) {
      return 'NONE';
    }
    if (files.length === 0) {
      return 'MESSAGE';
    }
    return 'COMPLETE';
  };

  // 내 상태 업데이트 API 호출
  const updateMyStatus = async () => {
    try {
      const status = getMyStatus();
      await api.put(`/groups/${groupId}/rocket-status`, {
        userId: userId,
        status: status,
        hasMessage: !!formData.content.trim(),
        hasFiles: files.length > 0
      });
      
      // 로컬에서도 내 상태 업데이트
      setMembers(prev => prev.map(member => 
        member.userId === userId 
          ? { ...member, status: status }
          : member
      ));
    } catch (err) {
      console.error('상태 업데이트 실패:', err);
      // API 실패해도 로컬에서는 업데이트
      setMembers(prev => prev.map(member => 
        member.userId === userId 
          ? { ...member, status: getMyStatus() }
          : member
      ));
    }
  };

  // 상태 업데이트 (메시지나 파일 변경 시)
  useEffect(() => {
    if (members.length > 0) {
      const timer = setTimeout(() => {
        updateMyStatus();
      }, 500); // 0.5초 지연 후 업데이트

      return () => clearTimeout(timer);
    }
  }, [formData.content, files, members.length]);

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

  // 멤버 추방 (방장만 가능)
  const handleKickMember = async (memberId) => {
    if (!isOwner) return;
    
    if (window.confirm('정말로 이 멤버를 추방하시겠습니까?')) {
      try {
        await api.delete(`/groups/${groupId}/members/${memberId}`);
        
        // 로컬에서 멤버 제거
        setMembers(prev => prev.filter(member => member.userId !== memberId));
        
        // 채팅에 시스템 메시지 추가 (API 실패해도 로컬에 추가)
        const systemMessage = {
          id: Date.now(),
          sender: '시스템',
          message: '멤버가 추방되었습니다.',
          timestamp: new Date().toISOString(),
          isSystem: true
        };
        setChatMessages(prev => [...prev, systemMessage]);

        // API로 시스템 메시지 전송 시도
        try {
          await api.post(`/groups/${groupId}/rocket-chat`, {
            sender: '시스템',
            message: '멤버가 추방되었습니다.',
            isSystem: true
          });
        } catch (chatErr) {
          console.error('시스템 메시지 전송 실패:', chatErr);
        }
      } catch (err) {
        console.error('멤버 추방 실패:', err);
        alert('멤버 추방에 실패했습니다.');
      }
    }
  };

  // 채팅 메시지 전송
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: userId,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isSystem: false
    };

    // 로컬에 즉시 추가
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      // API로 메시지 전송
      await api.post(`/groups/${groupId}/rocket-chat`, {
        sender: userId,
        message: newMessage.trim(),
        isSystem: false
      });
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      // API 실패해도 로컬 메시지는 유지
      
      // 임시 자동 응답 (백엔드 없을 때)
      setTimeout(() => {
        const responses = [
          '메시지 확인했습니다! 💬',
          '모든 분들이 참여해주세요! 🙌',
          '로켓 발사까지 조금만 더! 🚀'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const autoReply = {
          id: Date.now() + 1,
          sender: '시스템',
          message: randomResponse,
          timestamp: new Date().toISOString(),
          isSystem: true
        };
        setChatMessages(prev => [...prev, autoReply]);
      }, 1000);
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'NONE': return '대기 중';
      case 'MESSAGE': return '메시지 작성';
      case 'FILES': return '파일 첨부';
      case 'COMPLETE': return '완료';
      default: return '대기 중';
    }
  };

  // 사용자 닉네임 조회 함수 (안전하게)
  const getUserNickname = (userId) => {
    if (!Array.isArray(members)) {
      return '알 수 없는 사용자';
    }
    const member = members.find(m => m.userId === userId);
    return member?.nickname || '알 수 없는 사용자';
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
          </div>

          {/* 참가자 현황 */}
          <div className={styles.participantsCard}>
            <div className={styles.cardHeader}>
              <h3>👥 참가자 현황 ({getCompleteCount()}/{members.length})</h3>
              <p>모든 참가자가 초록색이 되면 로켓을 발사할 수 있어요</p>
            </div>
            
            <div className={styles.participantsList}>
              {Array.isArray(members) && members.map((member) => (
                <div key={member.userId} className={styles.participantItem}>
                  <div 
                    className={styles.participantCircle}
                    style={{ backgroundColor: STATUS_COLORS[member.status || 'NONE'] }}
                  >
                    <UserIcon />
                  </div>
                  <div className={styles.participantInfo}>
                    <span className={styles.participantName}>
                      {member.nickname}
                      {member.userId === group.ownerId && <span className={styles.ownerIcon}>👑</span>}
                    </span>
                    <span className={styles.participantStatus}>
                      {getStatusText(member.status || 'NONE')}
                    </span>
                  </div>
                  {isOwner && member.userId !== group.ownerId && (
                    <button
                      onClick={() => handleKickMember(member.userId)}
                      className={styles.kickButton}
                      title="멤버 추방"
                    >
                      <KickIcon />
                    </button>
                  )}
                </div>
              ))}
              
              {/* 멤버가 없을 때 표시 */}
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

          {/* 실시간 채팅 카드 */}
          <div className={styles.chatCard}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <ChatIcon />
                <span>실시간 채팅</span>
              </div>
              <div className={styles.chatStatus}>
                <div className={styles.statusDot}></div>
                <span>온라인</span>
              </div>
            </div>
            
            <div className={styles.chatContent}>
              <div className={styles.chatMessages}>
                {Array.isArray(chatMessages) && chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.chatMessage} ${msg.isSystem ? styles.systemMessage : styles.userMessage}`}
                  >
                    <div className={styles.messageHeader}>
                      <span className={styles.sender}>
                        {msg.isSystem ? '시스템' : getUserNickname(msg.sender)}
                      </span>
                      <span className={styles.time}>{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className={styles.messageContent}>{msg.message}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                <div className={styles.chatInputGroup}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={styles.chatInput}
                    placeholder="메시지를 입력하세요..."
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </button>
                </div>
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