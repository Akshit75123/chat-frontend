import React, { useEffect, useState, useRef } from "react";
import { MdSend } from "react-icons/md";
import { FaSun, FaMoon } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import useChatContext from "../context/ChatContext";
import { baseURL } from "../config/AxiosHelper";
import { clearChat, getMessages } from "../service/RoomService";
import toast, { Toaster } from "react-hot-toast";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const {
    roomId,
    currentUser,
    connected,
    setConnected,
    setRoomId,
    setCurrentUser,
  } = useChatContext();

  const navigate = useNavigate();
  const chatBoxRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply theme on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  // Redirect if not connected
  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, navigate]);

  // Load messages when the user joins a room
  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getMessages(roomId);
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
    if (connected) {
      loadMessages();
    }
  }, [connected, roomId]);

  // Auto-scroll when messages update
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!connected) return;

    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock);

    client.connect({}, () => {
      setStompClient(client);
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });
    });

    return () => {
      if (client) client.disconnect();
    };
  }, [roomId, connected]);

  // Send a message
  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
      };

      stompClient.send(
        `/app/sendMessage/${roomId}`,
        {},
        JSON.stringify(message)
      );
      setInput(""); // Clear input field
    }
  };

  // Handle user logout
  const handleLogout = () => {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  // Clear chat messages
  const handleClearChat = async () => {
    try {
      await clearChat(roomId);
      setMessages([]);
      toast.success("Chat cleared");
    } catch (error) {
      toast.error("Error clearing chat");
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <Toaster />

      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-50 dark:bg-gray-900 py-4 shadow flex flex-col md:flex-row md:justify-between items-center px-4 md:px-10">
        <h1 className="dark:text-white font-semibold text-sm md:text-lg">
          {roomId}
        </h1>
        <h1 className="dark:text-white font-semibold text-sm md:text-lg">
          Welcome {currentUser} :)
        </h1>

        {/* Theme Toggle Button */}

        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded-lg text-white"
          >
            Leave
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-lg text-white"
            >
              Clear Chat
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {isDarkMode ? (
              <FaSun size={20} className="text-yellow-400" />
            ) : (
              <FaMoon size={20} className="text-gray-800" />
            )}
          </button>
        </div>
      </header>

      {/* Chat Window */}
      <main
        ref={chatBoxRef}
        className="flex-1 overflow-auto mt-16 p-4 md:p-10 bg-gray-300 dark:bg-gray-800 pb-20"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`my-2 p-3 rounded-lg max-w-sm md:max-w-md lg:max-w-lg ${
                message.sender === currentUser ? "bg-yellow-400" : "bg-cyan-400"
              } break-words whitespace-pre-wrap overflow-hidden`}
              style={{ wordBreak: "break-word" }}
            >
              <div className="flex gap-2 items-center">
                {/* <img
                  className="h-8 w-8 rounded-full"
                  src="https://avatar.iran.liara.run/public"
                  alt="Avatar"
                /> */}
                <div>
                  <p className="text-sm font-bold">{message.sender}</p>
                  <p className="text-xl">{message.content}</p>
                  <p className="text-xs font-bold text-gray-700">
                    {timeAgo(message.timeStamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Chat Input */}
      <div className="fixed bottom-4 w-full flex justify-center px-4">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-full w-full max-w-2xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent focus:outline-none dark:text-white"
          />
          <button
            className="bg-green-500 hover:bg-green-700 p-2 rounded-full"
            onClick={sendMessage}
          >
            <MdSend size={20} className="dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
