import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import api from '../utils/api';
import useAuthStore from '../authStore';

const GroupRocketCreate = () => {
  const { groupId } = useParams();
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const stompClientRef = useRef(null); // 선언 필수!
  const messageEndRef = useRef(null);
  const myNickname = useAuthStore((state) => state.nickname);
  const messageContainerRef = useRef(null);
  // 히스토리 불러오기 함수
  const fetchChatHistory = async (beforeMessageId = Number.MAX_SAFE_INTEGER) => {
    try {
      const res = await api.get(`/groups/${groupId}/chats/history`, {
        params: { beforeMessageId, size: 5 }
      });
      // res.data.data 가 GroupChatHistoryResponse { messages: [], hasNext: bool } 라고 가정
      const { messages: historyMessages } = res.data.data;

      // 과거 메시지를 앞쪽에 붙임 (오래된 메시지 -> 배열 앞쪽)
      setMessages(prev => [...historyMessages.reverse(), ...prev]);
    } catch (error) {
      console.error('히스토리 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    // 초기 히스토리 조회 (가장 최신 메시지부터)
    fetchChatHistory();

    const socket = new SockJS('http://localhost:8081/ws');
    console.log("소켓 연결 완료");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('STOMP 연결됨');
        stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
          const payload = JSON.parse(message.body);
          console.log('받은 메시지:', payload);
          setMessages((prev) => [...prev, payload]);
        });
        console.log(`Subscribed to /topic/group/${groupId}`);

        stompClient.publish({
          destination: `/app/group/${groupId}/enter`,
          body: '',
        });
        console.log('Enter 메시지 발송');
      },
      onDisconnect: () => console.log('STOMP 연결 해제됨'),
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        // 퇴장 메시지 전송
        stompClientRef.current.publish({
          destination: `/app/group/${groupId}/exit`,
          body: '',
        });
        console.log('Exit 메시지 발송');

        // 연결 해제
        stompClientRef.current.deactivate();
      }
    };
  }, [accessToken, groupId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    stompClientRef.current?.publish({
      destination: `/app/group/${groupId}/chat`,
      body: JSON.stringify({ message: newMessage }),
    });

    setNewMessage('');
  };

  const handleExitGroup = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: `/app/group/${groupId}/exit`,
        body: '',
      });
      console.log('Exit 메시지 수동 발송');

      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    navigate(`/groups/` + groupId); // 나간 뒤 그룹 목록이나 홈으로 이동
  };

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && messages.length > 0) {
      const firstMessageId = messages[0]?.id || Number.MAX_SAFE_INTEGER;

      const prevScrollHeight = container.scrollHeight;

      fetchChatHistory(firstMessageId).then(() => {
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - prevScrollHeight;
        }, 0);
      });
    }
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
  return (
    <div style={styles.container}>
      <h2>실시간 채팅</h2>
      <button onClick={handleExitGroup} style={styles.exitButton}>나가기</button>
      <div style={styles.chatBox}>
        <div
          style={styles.messages}
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
                  ...styles.message,
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
                    <div style={styles.header}>
                      <strong>
                        {msg.nickname}
                        {isMine && ' (나)'}
                      </strong>{' '}
                      {msg.sentAt && (
                        <span style={styles.timestamp}>
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

        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={!newMessage.trim()}>
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
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