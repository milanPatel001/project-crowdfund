"use client";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import { useParams } from "next/navigation";
import DonationSection from "@/components/DonationSection";
import { useState } from "react";
import SeeAllModal from "@/components/SeeAllModal";
import LeaderBoard from "@/components/LeaderBoard";

export default function FundPage() {
  const params = useParams();

  const [isSeeAllModalOpen, setIsSeeAllModalOpen] = useState(false);
  const [isleaderBoardOpen, setisleaderBoardOpen] = useState(false);

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

  return (
    <div>
      <p>{params.fundId}</p>

      <div className="flex flex-row min-h-screen mx-48 relative">
        <SeeAllModal isOpen={isSeeAllModalOpen} onClose={closeSeeAllModal} />
        <LeaderBoard isOpen={isleaderBoardOpen} onClose={closeisleaderBoard}/>
        {/* Left side of fund page */}
        <div className="border border-black w-2/3">
          {/*<LeftSection />*/}
        </div>

        {/* Right side of fund page */}
        <div className="w-1/3">
          <RightSection
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
