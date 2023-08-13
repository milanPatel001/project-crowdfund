"use client";
import { createContext, useContext, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const SocketContext = createContext();
const SERVER_URL_LOCAL = "http://localhost:3000";
const SERVER_URL = "http://98.113.25.59:65535"; // Replace with the server's IP address and port

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = socketIOClient(SERVER_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
