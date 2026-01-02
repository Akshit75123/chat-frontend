import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export const connectSocket = (roomId, onMessage) => {
  stompClient = new Client({
    webSocketFactory: () =>
      new SockJS("https://chatapp-backend-ykvk.onrender.com/chat"),

    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WebSocket connected");

      stompClient.subscribe(`/topic/room/${roomId}`, (msg) => {
        onMessage(JSON.parse(msg.body));
      });
    },
  });

  stompClient.activate();
};

export const sendMessage = (roomId, message) => {
  if (!stompClient) return;

  stompClient.publish({
    destination: `/app/sendMessage/${roomId}`,
    body: JSON.stringify(message),
  });
};
