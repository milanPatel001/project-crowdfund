"use client";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import { useParams } from "next/navigation";

export default function FundPage() {
  const params = useParams();

  return (
    <div>
      <div className="">
        <div className="">
          <p className="">SET HELLO</p>
        </div>
      </div>
      <p>{params.fundId}</p>

      <div className="flex flex-row min-h-screen border border-black mx-48">
        {/* Left side of fund page */}
        <div className="border border-black w-2/3">
          <LeftSection />
        </div>

        {/* Right side of fund page */}
        <div className="border border-black w-1/3">
          <RightSection />
        </div>
      </div>
    </div>
  );
}
