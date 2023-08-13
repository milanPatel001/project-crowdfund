"use client";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SeeAllModal from "@/components/SeeAllModal";
import LeaderBoard from "@/components/LeaderBoard";
import { useSocket } from "@/components/SocketProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FundPage() {
  const params = useParams();
  const socket = useSocket();

  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const [isleaderBoardOpen, setisleaderBoardOpen] = useState(false);
  const [fundData, setFundData] = useState({});

  const openSeeAllModal = () => {
    setIsSeeAllModalOpen(true);
  };

  const closeSeeAllModal = () => {
    setIsSeeAllModalOpen(false);
  };

  const openisleaderBoard = () => {
    setisleaderBoardOpen(true);
  };

  const closeisleaderBoard = () => {
    setisleaderBoardOpen(false);
  };

  useEffect(() => {
    socket?.emit("specific fund request", params.fundId);
    socket?.on("specific fund response", (fund) => {
      console.log(fund);
      setFundData(fund);
    });

    socket?.on("donation", (data) => {
      console.log(socket.id);
      console.log(data.socketId);

      if (socket) {
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
        } else {
          toast.success("Donated Successfully", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      }

      setFundData(data.fundsData[params.fundId]);
    });
  }, [socket]);

  return (
    <div>
      <div className="flex flex-row min-h-screen mx-48 relative">
        <SeeAllModal
          isOpen={isSeeAllModalOpen}
          onClose={closeSeeAllModal}
          fundData={fundData}
        />
        <LeaderBoard isOpen={isleaderBoardOpen} onClose={closeisleaderBoard} />
        {/* Left side of fund page */}
        <div className="border border-black w-2/3">
          <LeftSection fundData={fundData} />
        </div>

        {/* Right side of fund page */}
        <div className="w-1/3">
          <RightSection
            fundData={fundData}
            openSeeAllModal={openSeeAllModal}
            closeSeeAllModal={closeSeeAllModal}
            openisleaderBoard={openisleaderBoard}
            closeisleaderBoard={closeisleaderBoard}
          />
        </div>
      </div>
    </div>
  );
}
