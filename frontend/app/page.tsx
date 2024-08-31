"use client";

import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Home() {
  const s = useSocket();
  const router = useRouter();

  const sendCookie = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/verifyToken",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.ok) {
      const id = await res.text()
      console.log(id);
      
      s?.setId(id);
      s?.login();
    } else router.replace("/login");
  };

  useEffect(() => {
    console.log("Inside Page: " + s?.isAuthenticated);
    if (!s?.isAuthenticated) {
      sendCookie();
    }
  }, []);

  if (!s?.isAuthenticated) return <div></div>;
  return (
    <div className="flex flex-col">
      <Navbar />
      <Main />
    </div>
  );
}
