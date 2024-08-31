"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "./Card";
import { useSocket } from "./SocketProvider";
import { FundsData } from "@/backend";

export default function Main() {
  const [fundsData, setFundsData] = useState<FundsData>();

  const s = useSocket();
   
  useEffect(() => {
    console.log("Inside Main: " + s?.isAuthenticated);
    if (s?.isAuthenticated && s?.socket) {
        setFundsData(s.fundsData)
    }
  }, [s?.socket, s?.fundsData]);

  return (
    <div className="flex flex-col p-2 items-center bg-gray-50">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-center lg:w-2/3 xl:grid-cols-3 xl:gap-10 xl:items-center xl:w-2/3">
        {fundsData?.map((fund) => (
          <Card key={fund.id} fund={fund} />
        ))}
      </div>
    </div>
  );
}
