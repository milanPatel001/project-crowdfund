"use client";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";

export default function FundPage() {
  const params = useParams();

  return (
    <div>
      <p>{params.fundId}</p>

      <div className="flex flex-row min-h-screen mx-48">
        {/* Left side of fund page */}
        <div className="border border-black w-2/3">
          <LeftSection />
        </div>

        {/* Right side of fund page */}
        <div className="w-1/3">
          <RightSection />
        </div>
      </div>
    </div>
  );
}
