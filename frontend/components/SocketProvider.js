"use client";
import { createContext, useContext, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const SocketContext = createContext();

const SERVER_URL = "http://localhost:3000"; // Replace with the server's IP address and port

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
      const s = socketIOClient(SERVER_URL);
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
