import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


const GroupRocketCreate = () => {
  const { groupId } = useParams();
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const stompClientRef = useRef(null); // 선언 필수!
  const messageEndRef = useRef(null);


  useEffect(() => {
    if (!accessToken) return;

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // 메시지 서버로 전송
    stompClientRef.current?.publish({
      destination: `/app/group/${groupId}/chat`,
      body: JSON.stringify({
        message: newMessage
      }),
    });

    setNewMessage('');

    // 스크롤 맨 아래로 이동
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
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

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
    <div style={styles.container}>
      <h2>실시간 채팅</h2>
      <button onClick={handleExitGroup} style={styles.exitButton}>나가기</button>
      <div style={styles.chatBox}>
        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index} style={styles.message}>
              {!msg.message?.trim() ? (
                <em>{msg.nickname}님이 입장하셨습니다.</em>
              ) : (
                <>
                  <div style={styles.header}>
                    <strong>{msg.nickname}</strong>
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
          ))}
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
};
export default GroupRocketCreate;