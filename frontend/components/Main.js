"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "./Card";
import { useSocket } from "./SocketProvider";

export default function Main() {
  const [fundsData, setFundsData] = useState([]);

  const { socket, isAuthenticated, userId } = useSocket();
  const toast_id = "success1";

  useEffect(() => {
    console.log("Inside Main: " + isAuthenticated);
    if (isAuthenticated && socket) {
      console.log("In socket lisnteners block");
      socket?.emit("fundsData request");
      socket?.on("fundsData response", (fundsData) => {
        setFundsData(fundsData);
      });

      socket?.on("paymentCompleted", (data) => {
        console.log("Inside payment completed");
        socket.emit("donate", data);
      });

      socket?.on("donationByAnotherUser", (data) => {
        if (userId == data.ID) {
          toast.success("Donated Successfully", {
            toastId: toast_id,
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });

          toast.clearWaitingQueue();
        } else {
          setFundsData(data.fundsData);
        }
      });
    }
  }, [socket]);

  return (
    <div className="flex flex-col p-2 items-center bg-gray-200 h-screen">
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-center lg:w-2/3 xl:grid-cols-3 xl:gap-10 xl:items-center xl:w-2/3">
        {fundsData?.map((fund) => (
          <Card key={fund.id} fund={fund} />
        ))}
      </div>
    </div>
  );
}
