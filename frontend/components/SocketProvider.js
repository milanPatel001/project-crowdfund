"use client";
import { createContext, useContext, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const SocketContext = createContext();
const SERVER_URL_LOCAL = "http://localhost:3000";
const SERVER_URL = "http://98.113.25.59:65535"; // Replace with the server's IP address and port

//provides socket connection only to authenticated clients
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setisAuthenticated] = useState(false);

  const login = () => {
    setisAuthenticated(true);
  };

  const logout = () => {
    setisAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const s = socketIOClient(SERVER_URL_LOCAL);
      setSocket(s);

      return () => {
        s.disconnect();
      };
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, login, logout, isAuthenticated }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
