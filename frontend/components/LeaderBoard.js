import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import DonationSection from "./DonationSection";
import { useParams, useRouter } from "next/navigation";

export default function LeaderBoard({isOpen, onClose}) {
  const router = useRouter();
  const params = useParams();

  if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Background blur */}
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>
  
        {/* Modal content */}
        <div className="bg-white rounded-lg p-4 z-10">
          {/* Your modal content */}
          <p>Here are the top Donators.</p>

          <div className="flex flex-col gap-2 m-4 shadow-xl border border-t-1 border-gray-300 rounded-2xl p-4">
    {/* Recent Donations - max 3 on display*/}
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-2">
        <UserCircleIcon className="h-12 w-10 text-gray-400" />
        <div className="flex flex-col">
          <p className="text-gray-700 font-serif font-light">James White</p>
          <p className="ml-0.5 text-sm font-semibold">$200</p>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <UserCircleIcon className="h-12 w-10 text-gray-400" />
        <div className="flex flex-col">
          <p className="text-gray-700 font-mono font-light">James White</p>
          <p className="ml-0.5 text-sm font-semibold">$200</p>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <UserCircleIcon className="h-12 w-10 text-gray-400" />
        <div className="flex flex-col">
          <p className="text-gray-700 font-mono font-light">James White</p>
          <p className="ml-0.5 text-sm font-semibold">$200</p>
        </div>
      </div>
    </div>
    </div>
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-4"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      
);
}


  
  