"use client";
import LeftSection from "@/components/LeftSection";
import RightSection from "@/components/RightSection";
import { useParams } from "next/navigation";

export default function FundPage() {
  const params = useParams();

  return (
    <div>
      <div className="flex flex-col gap-1">
        <div className="">
          <p className="">SET HELLO</p>
        </div>
      </div>
      <p>{params.fundId}</p>

      <div className="flex flex-row">
        {/* Left side of fund page */}
        <LeftSection />

        {/* Right side of fund page */}
        <RightSection />
      </div>
    </div>
  );
}
