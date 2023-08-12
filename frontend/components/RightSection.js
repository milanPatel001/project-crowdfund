import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import DonationSection from "./DonationSection";
import { useParams, useRouter } from "next/navigation";

export default function RightSection({ openSeeAllModal, closeSeeAllModal }) {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex flex-col gap-2 m-4 shadow-xl border border-t-1 border-gray-300 rounded-2xl p-4">
      <div>
        <span className="font-serif text-3xl">$110,941 </span>
        <span className="text-gray-500 font-serif">
          raised of $100,000 goal
        </span>

        <div className="w-full bg-gray-200 rounded-full h-1.5 my-2 dark:bg-gray-700">
          <div className="bg-green-600 h-1.5 rounded-full w-1/2"></div>
        </div>
      </div>
      <p className=" text-sm text-gray-400 mb-2">1K donations</p>
      <button
        className="py-3 mx-6 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-300"
        onClick={() => router.push(`/${params.fundId}/donation`)}
      >
        Donate Now
      </button>

      <button className="py-3 mx-6 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-300">
        Share
      </button>

      <div className="border border-gray-200 mt-4 "></div>

      <p className="text-xl mt-1 mb-1 font-serif font-thin text-gray-500 underline underline-offset-4">
        Recent Donations
      </p>

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

      {/* Bottom buttons */}
      <div className="flex flex-row w-full mt-3 px-1">
        <button
          className="text-red-600 border border-red-500 font-semibold rounded-xl px-3 py-2 hover:bg-red-200"
          onClick={() => openSeeAllModal()}
        >
          See all
        </button>
        <button className="border border-green-500 text-green-700 font-semibold rounded-xl px-3 py-2 ml-3 hover:bg-green-100">
          $ See Top Donations $
        </button>
      </div>
    </div>
  );
}
