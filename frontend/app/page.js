"use client";
import Main from "@/components/Main";
import socketIOClient from "socket.io-client";
import { useEffect, useState } from "react";
import { useSocket } from "@/components/SocketProvider";
import Navbar from "@/components/Navbar";

const SERVER_URL = "http://98.113.25.59:65535"; // Replace with the server's IP address and port
const SERVER_URL_LOCAL = "http://localhost:3000";

export default function Home() {
  //const [socket, setSocket] = useState(null);
  const socket = useSocket();
  /*
  useEffect(() => {
    const s = socketIOClient(SERVER_URL_LOCAL);
    setSocket(s);
  }, []);
*/
  return (
    <div className="flex flex-col">
      <Main socket={socket} />
    </div>
  );
}
