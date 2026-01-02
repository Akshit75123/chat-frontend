import React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../App";
import ChatPage from "../components/ChatPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App></App>}></Route>
      <Route path="/chat" element={<ChatPage />}></Route>
    </Routes>
  );
};

export default AppRoutes;
