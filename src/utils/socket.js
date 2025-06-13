import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import useAuthStore from '../authStore';

export const connectSocket = (token) => {
  const socket = new SockJS("http://localhost:8081/ws");
  const stompClient = new Client({
    webSocketFactory: () => socket,
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: (str) => console.log(str),
    onConnect: () => console.log("STOMP 연결됨"),
    onDisconnect: () => console.log("STOMP 연결 해제됨"),
  });

  stompClient.activate();
  useAuthStore.getState().setStompClient(stompClient);

  return stompClient;
};