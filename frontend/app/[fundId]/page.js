"use client";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SeeAllModal from "@/components/SeeAllModal";
import LeaderBoard from "@/components/LeaderBoard";
import { useSocket } from "@/components/SocketProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShareModal from "@/components/ShareModal";
import Navbar from "@/components/Navbar";

export default function FundPage() {
  const params = useParams();
  const { socket, isAuthenticated } = useSocket();

  const router = useRouter();

  const toast_id1 = "success2";
  const toast_id2 = "info1";

  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const [isleaderBoardOpen, setisleaderBoardOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fundData, setFundData] = useState({});

  const openSeeAllModal = () => {
    setIsSeeAllModalOpen(true);
  };

  const closeSeeAllModal = () => {
    setIsSeeAllModalOpen(false);
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const openisleaderBoard = () => {
    setisleaderBoardOpen(true);
  };

  const closeisleaderBoard = () => {
    setisleaderBoardOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      socket?.emit("specific fund request", params.fundId - 1);
      socket?.on("specific fund response", (fund) => {
        setFundData(fund);
      });

      socket?.on("donation", (data) => {
        if (socket) {
          if (socket?.id !== data.socketId) {
            toast.info(
              `${data.donator} contributed ${data.amount} to ${data.fundOrganizer}`,
              {
                toastId: toast_id2,
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
          } else {
            toast.success("Donated Successfully", {
              toastId: toast_id1,
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

          toast.clearWaitingQueue();
        }

        setFundData(data.fundsData[params.fundId - 1]);
      });
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <div></div>;

  return (
    <div>
      <Navbar />
      <div className="lg:flex lg:flex-row min-h-screen relative lg:mx-12 xl:mx-48">
        <SeeAllModal
          isOpen={isSeeAllModalOpen}
          onClose={closeSeeAllModal}
          fundData={fundData}
        />
        <LeaderBoard
          isOpen={isleaderBoardOpen}
          onClose={closeisleaderBoard}
          fundData={fundData}
        />

        <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />

        {/* Left side of fund page */}
        <div className="lg:w-3/5 xl:w-2/3">
          <LeftSection fundData={fundData} />
        </div>

        {/* Right side of fund page */}
        <div className="lg:w-2/5 xl:w-1/3 xl:ml-5">
          <RightSection
            fundData={fundData}
            openSeeAllModal={openSeeAllModal}
            openisleaderBoard={openisleaderBoard}
            openShareModal={openShareModal}
          />
        </div>
      </div>
    </div>
  );
}
