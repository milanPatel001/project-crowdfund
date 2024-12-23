"use client";
import { History as Hist } from "@/backend";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function History() {
  const auth = useSocket();
  const router = useRouter();

  const [history, setHistory] = useState<Hist[]>([]);

  const fetchHistory = async ()=>{
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/history?id=" + auth?.userId,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if(res.ok){
      const result : Hist[] = await res.json();

      setHistory(result)

    }else{
      if(res.status==403){
        auth?.logout()
        return
      }
      
      console.warn("Couldn't load!!")
    }
  }

  useEffect(() => {
    if (!auth?.isAuthenticated) router.push("/");
    else {
      fetchHistory()
    }
  }, [auth?.isAuthenticated]);

  return (
    <div className="flex flex-col gap-2 h-screen bg-white">
      <Navbar />

      {history.length > 0 ? (
        <div className="md:w-2/3 lg:w-1/2 md:mx-auto md:rounded-lg shadow-lg border border-gray-400 bg-white mt-10 md:px-10 md:py-5">
        <div className="flex gap-3 mb-2 font-medium text-lg">
          <p className="w-1/12"></p>
          <p className="w-3/12 text-center">Organizer</p>
          <p className="w-3/12 text-center">Beneficiary</p>
          <p className="w-1/12 text-center">Amount</p>
          <p className="text-center w-3/12">Donated At</p>
        </div>
        {history.map((row, i) => (
          <div
            className="flex gap-3 w-full border-b border-gray-400 p-2"
            key={i}
          >
            
            <p className="w-1/12 text-center">{i + 1}.</p>
            <p className="w-3/12 text-center">{row.organizer}</p>
            <p className="w-3/12 text-center">{row.beneficiary}</p>
            <p className="w-1/12 text-center">${row.amount}</p>
            <p className="text-center w-3/12">{row.donated_at}</p>
          </div>
        ))}
      </div>
      ) : (
        <div className="h-screen flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-3 mb-12">
            <img
              width={100}
              height={100}
              src="https://api.dicebear.com/9.x/avataaars/svg?seed=mi&eyes=cry&mouth=sad"
              alt="avt"
              loading="lazy"
            />
            <p className="text-2xl font-serif">You don't have any donation history!!!</p>
        </div>
        </div>
      )}


      
    </div>
  );
}
