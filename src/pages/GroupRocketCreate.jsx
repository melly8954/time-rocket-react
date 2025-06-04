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
  ChatIcon
} from '../components/ui/Icons';

const GroupRocketCreate = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { userId, isLoggedIn } = useAuthStore();
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  
  // 상태 관리
  const [group, setGroup] = useState(null);
  const [formData, setFormData] = useState({
    rocketName: '',
    design: '',
    lockExpiredAt: '',
    receiverEmail: '',
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
      message: '모임 로켓 만들기를 시작합니다! 🚀',
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

  // 인증 및 그룹 정보 확인
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (groupId) {
      fetchGroupInfo();
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
        setGroup(response.data.data);
        
        setFormData(prev => ({
          ...prev,
          rocketName: `${response.data.data.groupName} 로켓`,
          design: DESIGN_OPTIONS[0].value
        }));

        setChatMessages(prev => [...prev, {
          id: Date.now(),
          sender: '시스템',
          message: `"${response.data.data.groupName}" 모임 로켓을 준비해보세요!`,
          timestamp: new Date().toISOString(),
          isSystem: true
        }]);
      }
    } catch (err) {
      console.error('그룹 정보 조회 실패:', err);
      alert('모임 정보를 불러올 수 없습니다.');
      navigate('/groups');
    } finally {
      setIsLoading(false);
    }
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

  // 채팅 메시지 전송
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: '나',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isSystem: false
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const autoReply = {
        id: Date.now() + 1,
        sender: '시스템',
        message: '메시지 확인했습니다! 💬',
        timestamp: new Date().toISOString(),
        isSystem: true
      };
      setChatMessages(prev => [...prev, autoReply]);
    }, 1000);
  };

  // 로켓 생성 및 전송
  const handleRocketSubmit = async (e) => {
    e.preventDefault();
    
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
    if (!formData.content.trim()) {
      newErrors.content = '메시지를 입력해주세요.';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const rocketData = {
        rocketName: formData.rocketName.trim(),
        design: formData.design,
        lockExpiredAt: formData.lockExpiredAt,
        receiverEmail: formData.receiverEmail.trim() || null
      };
      
      await api.post(`/groups/${groupId}/rockets`, rocketData);
      alert('모임 로켓이 성공적으로 전송되었습니다!');
      navigate(`/groups/${groupId}`);
      
    } catch (err) {
      console.error('로켓 전송 실패:', err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error;
      
      if (err.response?.status === 400) {
        alert(`요청 오류: ${backendMessage || '입력 정보를 확인해주세요.'}`);
      } else if (err.response?.status === 403) {
        alert(`권한 오류: ${backendMessage || '이 모임의 멤버만 로켓을 만들 수 있습니다.'}`);
      } else if (err.response?.status === 500) {
        alert(`서버 오류: ${backendMessage || '백엔드 서버에 문제가 있습니다.'}`);
      } else {
        alert(`로켓 전송 실패: ${backendMessage || '알 수 없는 오류'}`);
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
      {/* 깔끔한 헤더 */}
      <div className={styles.header}>
        <button 
          onClick={() => navigate(`/groups/${groupId}`)}
          className={styles.backButton}
        >
          <BackIcon /> 돌아가기
        </button>
        <div className={styles.headerInfo}>
          <h1><RocketIcon /> 모임 로켓 만들기</h1>
          <span><GroupIcon /> {group.groupName}</span>
        </div>
      </div>

      {/* 균형잡힌 레이아웃 */}
      <div className={styles.mainLayout}>
        {/* 왼쪽 영역 */}
        <div className={styles.leftSection}>
          {/* 메시지 작성 카드 */}
          <div className={styles.messageCard}>
            <div className={styles.cardHeader}>
              <h3>💬 메시지 작성</h3>
              <p>모임원들에게 전할 소중한 이야기를 작성해보세요</p>
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
                  placeholder="따뜻한 마음을 담아 메시지를 작성해보세요...&#10;&#10;예시:&#10;• 오늘 모임 정말 즐거웠어요!&#10;• 다음에도 함께 해요 😊&#10;• 소중한 추억 감사합니다"
                  rows={4}
                  maxLength={500}
                />
                <div className={styles.inputFooter}>
                  <span className={styles.charCount}>{formData.content.length}/500</span>
                </div>
              </div>
              {errors.content && (
                <div className={styles.errorText}>{errors.content}</div>
              )}
            </div>
          </div>

          {/* 로켓 디자인 선택 카드 */}
          <div className={styles.designCard}>
            <div className={styles.cardHeader}>
              <h3>🎨 로켓 디자인</h3>
              <p>마음에 드는 로켓 스타일을 선택해주세요</p>
            </div>
            
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

        {/* 오른쪽 영역 */}
        <div className={styles.rightSection}>
          {/* 로켓 설정 카드 */}
          <div className={styles.configCard}>
            <div className={styles.cardHeader}>
              <h3>⚙️ 로켓 설정</h3>
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
            </div>
          </div>

          {/* 실시간 채팅 카드 */}
          <div className={styles.chatCard}>
            <div className={styles.chatHeader}>
              <div className={styles.chatTitle}>
                <ChatIcon />
                <span>실시간 채팅</span>
              </div>
              <div className={styles.chatStatus}>
                <div className={styles.statusDot}></div>
                <span>준비 중</span>
              </div>
            </div>
            
            <div className={styles.chatContent}>
              <div className={styles.chatMessages}>
                {chatMessages.slice(-3).map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.chatMessage} ${msg.isSystem ? styles.systemMessage : styles.userMessage}`}
                  >
                    <div className={styles.messageHeader}>
                      <span className={styles.sender}>{msg.sender}</span>
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
        <button
          onClick={handleRocketSubmit}
          className={styles.launchButton}
          disabled={isLoading}
        >
          <span className={styles.launchIcon}>🚀</span>
          <span className={styles.launchText}>
            {isLoading ? '발사 준비 중...' : '로켓 발사하기'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default GroupRocketCreate;
