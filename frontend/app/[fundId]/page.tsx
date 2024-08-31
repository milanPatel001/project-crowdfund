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
import { FundData } from "@/backend";


export default function FundPage() {
  const params = useParams();
  const s = useSocket();

  const router = useRouter();

  const toast_id1 = "success2";

  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const [isleaderBoardOpen, setLeaderBoardOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fundData, setFundData] = useState<FundData>({
    id: 1,
    name: "",
    story: "",
    beneficiary_name: "",
    place: "",
    title: "",
    img: "",
    created_at: "",
    goal: 0,
    donation_num: 0,
    total_donation: 0,
    comments :[],
    recentdonators: [] 
  });

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

  const openLeaderBoard = () => {
    setLeaderBoardOpen(true);
  };

  const closeLeaderBoard = () => {
    setLeaderBoardOpen(false);
  };

  const sendCookie = async () => {
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/verifyToken",
      {
        method: "POST",
        credentials: "include"
      }
    );

    if (res.ok) {
      const id = await res.text()

      s?.setId(id);
      s?.login();
    } else router.replace("/login");
  };

  useEffect(() => {
    if (s?.isAuthenticated) {

      if(!s.fundIdMap.current.has(Number(params.fundId))){
        router.replace("/")
      }
  
      const index = s.fundIdMap.current.get(Number(params.fundId));
      
      if(index>=0) {
        setFundData(s.fundsData[index])
      }
    } else {
        sendCookie();
    }
  }, [s?.isAuthenticated, s?.fundsData]);

  if (!s || !s?.isAuthenticated) return <div></div>;

  return (
    <div>
      <Navbar />
      <div className="lg:flex lg:flex-row min-h-screen relative lg:mx-12 md:mx-8 xl:mx-48">
        <SeeAllModal
          isOpen={isSeeAllModalOpen}
          onClose={closeSeeAllModal}
          fundData={fundData}
        />
        <LeaderBoard
          isOpen={isleaderBoardOpen}
          onClose={closeLeaderBoard}
          fundData={fundData}
        />

        <ShareModal isOpen={isShareModalOpen} onClose={closeShareModal} />

        {/* Left side of fund page */}
        <div className="lg:w-3/5 xl:w-2/3">
          <LeftSection fundData={fundData} />
        </div>

        {/* Right side of fund page */}
        <div className="md:w-3/5 md:mx-auto lg:w-2/5 xl:w-2/5 xl:ml-5">
          <RightSection
            fundData={fundData}
            openSeeAllModal={openSeeAllModal}
            openLeaderBoard={openLeaderBoard}
            openShareModal={openShareModal}
          />
        </div>
      </div>
    </div>
  );
}
