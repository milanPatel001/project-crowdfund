"use client";

import DonationSection from "@/components/DonationSection";

export default function Donation() {
  return (
    <div className="bg-gray-100 w-full h-full">
      <div className="bg-gray-100 lg:mb-11 border"></div>
      <div className="sm:w-2/3 sm:mx-auto lg:w-1/2 xl:w-1/3">
        <DonationSection />
      </div>
    </div>
  );
}
