import { httpClient } from "../config/AxiosHelper"
import { baseURL } from "../config/AxiosHelper"

export const createRoom=async(roomDetails)=>{
    const response = await httpClient.post(`/api/v1/rooms`,roomDetails,
        {
            headers:{
                "Content-Type":"text/plain",
            },
        }
    )
    return response.data
}

export const joinChatApi=async(roomId)=>{
    const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
    return response.data
}
export const getMessages = async (roomId) => {
    const response = await httpClient.get(
      `/api/v1/rooms/${roomId}/messages`
    );
    return response.data;
  };

  

export const clearChat = async (roomId) => {
  try {
    const response = await fetch(`${baseURL}/clear/${roomId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to clear chat");
    }

    return "Chat cleared successfully!";
  } catch (error) {
    console.error("Error clearing chat:", error);
    throw error;
  }
};

