import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./config/Routes";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <Toaster />
    <ChatProvider>
      <AppRoutes></AppRoutes>
    </ChatProvider>
  </BrowserRouter>
  // </StrictMode>
);
