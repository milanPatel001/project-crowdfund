"use client";

import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket.isAuthenticated) {
      router.replace("/login");
    }
  }, []);

  if (!socket.isAuthenticated) return <div></div>;
  return (
    <div className="flex flex-col">
      <Navbar />
      <Main />
    </div>
  );
}
