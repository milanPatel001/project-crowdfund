"use client";
import { createContext, useContext, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const SocketContext = createContext();

//provides socket connection only to authenticated clients
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const [userId, setUserId] = useState("");

  const setId = (id) => {
    setUserId(id);
  };

  const login = () => {
    setisAuthenticated(true);
  };

  const logout = () => {
    setisAuthenticated(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      const s = socketIOClient(process.env.NEXT_PUBLIC_SERVER_URL);
      s.emit("storeClientInfo", userId);
      setSocket(s);

      console.log("Provider: Connected");

      return () => {
        s.disconnect();
      };
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        login,
        logout,
        isAuthenticated,
        setId,
        userId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
