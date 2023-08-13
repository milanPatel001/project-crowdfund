"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "./Card";

export default function Main({ socket }) {
  const [fundsData, setFundsData] = useState([]);

  useEffect(() => {
    socket?.emit("fundsData request");
    socket?.on("fundsData response", (fundsData) => {
      setFundsData(fundsData);
    });

    socket?.on("donation", (data) => {
      if (socket?.id !== data.socketId) {
        toast.info("Wow so easy!!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      setFundsData(data.fundsData);
    });
  }, [socket]);

  return (
    <div className="flex flex-col p-2 items-center bg-gray-200">
      <div className="grid grid-cols-3 gap-4 items-center w-2/3 p-2">
        {fundsData?.map((fund) => (
          <Card key={fund.id} fund={fund} />
        ))}
      </div>
    </div>
  );
}
