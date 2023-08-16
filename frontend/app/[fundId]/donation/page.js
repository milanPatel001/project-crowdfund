"use client";

import DonationSection from "@/components/DonationSection";
import Navbar from "@/components/Navbar";
import { useSocket } from "@/components/SocketProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Donation() {
  const auth = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.replace("/login");
    }
  }, []);

  if (!auth.isAuthenticated) return <div></div>;

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 w-full h-full">
        <div className="bg-gray-100 lg:mb-11 border"></div>
        <div className="sm:w-2/3 sm:mx-auto lg:w-1/2 xl:w-1/3">
          <DonationSection />
        </div>
      </div>
    </>
  );
}
