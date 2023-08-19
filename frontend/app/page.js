"use client";

import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCookie } from "cookies-next";

export default function Home() {
  const { socket, isAuthenticated, login } = useSocket();
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

  /*
  useEffect(() => {
    if (isAuthenticated && socket) {
      console.log("In socket lisnteners block");
      socket?.emit("fundsData request");
      socket?.on("fundsData response", (fundsData) => {
        setFundsData(fundsData);
      });

      socket?.on("donation", (data) => {
        if (socket?.id !== data.socketId) {
          toast.info(
            `${data.donator} contributed $ ${data.amount} to ${data.fundOrganizer}`,
            {
              toastId: toast_id,
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            }
          );
        }

        toast.clearWaitingQueue();
        setFundsData(data.fundsData);
      });
    }
  }, [socket]);
*/
  if (!isAuthenticated) return <div></div>;
  return (
    <div className="flex flex-col">
      <Navbar />
      <Main />
    </div>
  );
}
