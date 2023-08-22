"use client";

import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCookie } from "cookies-next";

export default function Home() {
  const { socket, isAuthenticated, login, setId } = useSocket();
  const router = useRouter();

  const sendCookie = async (token) => {
    const res = await fetch("http://localhost:3000/verifyToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    });

    const result = await res.json();

    if (result.passed && result.decoded.email) {
      console.log("Got data");
      setId(result.decoded.id);
      login();
    } else router.replace("/login");
  };

  useEffect(() => {
    console.log("Inside Page: " + isAuthenticated);
    if (!isAuthenticated) {
      const token = getCookie("token");

      if (!token) router.replace("/login");
      else sendCookie(token);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <div></div>;
  return (
    <div className="flex flex-col">
      <Navbar />
      <Main />
    </div>
  );
}
