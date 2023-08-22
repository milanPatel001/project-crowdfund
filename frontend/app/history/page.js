"use client";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function History() {
  const { socket, isAuthenticated, userId } = useSocket();
  const router = useRouter();

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
    else {
      socket?.emit("history", userId);
      socket?.on("historyClient", (hist) => {
        console.log(hist);
        setHistory(hist);
      });
    }
  }, [isAuthenticated]);

  return (
    <div className="flex flex-col gap-2">
      {history.map((row, i) => (
        <div className="flex gap-3" key={i}>
          <p className="">{row.organizer}</p>
          <p className="">{row.beneficiary}</p>
          <p className="">{row.amount}</p>
          <p className="">{row.donated_at}</p>
        </div>
      ))}
    </div>
  );
}
