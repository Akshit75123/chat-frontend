import React, { useState, useEffect } from "react";
import chatIcon from "../assets/chat.png";
import { toast, Toaster } from "react-hot-toast";
import { FaSun, FaMoon } from "react-icons/fa";
import {
  createRoom as createRoomApi,
  joinChatApi,
} from "../service/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  function toggleTheme() {
    setIsDarkMode((prevMode) => !prevMode);
  }

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (!detail.roomId.trim() || !detail.userName.trim()) {
      toast.error("Invalid Input!");
      return false;
    }
    return true;
  }

  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
        toast.success(`Joined Room ${detail.roomId} as ${detail.userName} :)`);
      } catch (error) {
        toast.error(
          error.status === 400 ? "Room not found :( " : "Error joining the room"
        );
        console.log(error);
      }
    }
  }

  async function createRoom() {
    if (validateForm()) {
      try {
        const response = await createRoomApi(detail.roomId);
        toast.success("Room Created Successfully!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.error(
          error.response?.status === 400
            ? "Room Already Exists!"
            : "Error in creating room"
        );
        console.log(error);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
      <Toaster />

      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 dark:text-gray-200 bg-gray-300 dark:bg-gray-700 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          {isDarkMode ? (
            <FaSun className="text-yellow-400" />
          ) : (
            <FaMoon className="text-gray-800" />
          )}
          {isDarkMode ? "Light" : "Dark"}
        </button>
      </div>

      <div className="p-6 sm:p-10 w-full max-w-sm sm:max-w-md rounded-lg bg-gray-100 dark:bg-gray-800 shadow-lg">
        <div className="flex justify-center">
          <img src={chatIcon} className="w-20 sm:w-24" alt="Chat Icon" />
        </div>

        <h1 className="text-xl sm:text-2xl font-semibold text-center dark:text-white mt-4">
          Chat Without Limits.
        </h1>

        {/* Name Input */}
        <div className="mt-4">
          <label
            htmlFor="name"
            className="block dark:text-white font-medium mb-1"
          >
            Name
          </label>
          <input
            onChange={handleFormInputChange}
            value={detail.userName}
            type="text"
            id="name"
            name="userName"
            placeholder="Taylor"
            className="w-full dark:bg-gray-700 px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm sm:text-base"
          />
        </div>

        {/* Room ID Input */}
        <div className="mt-4">
          <label
            htmlFor="roomid"
            className="block dark:text-white font-medium mb-1"
          >
            Room ID
          </label>
          <input
            type="text"
            name="roomId"
            onChange={handleFormInputChange}
            value={detail.roomId}
            id="roomid"
            placeholder="Swift's Family"
            className="w-full dark:bg-gray-700 px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm sm:text-base"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={joinChat}
            className="w-full sm:w-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base"
          >
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="w-full sm:w-1/2 px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-lg text-sm sm:text-base"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
