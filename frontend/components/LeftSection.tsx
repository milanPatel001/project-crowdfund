import Image from "next/image";
import React, { useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

import { HeartIcon } from "@heroicons/react/24/solid";
import { FundData } from "@/backend";


type FundProps = {fundData: FundData}

export default function LeftSection({ fundData } : FundProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-3">
      <h1 className="text-3xl font-semibold mb-4">{fundData.title}</h1>
      <Image
        src={fundData.img}
        alt="Crowdfunding Campaign"
        className="mb-4 rounded-xl"
        width={800}
        height={800}
      />

      <div className="flex gap-2 items-center">
        <img
          width={40}
          height={40}
          src={"https://api.dicebear.com/6.x/bottts/svg?seed=" + fundData.name}
          alt="avt"
          loading="lazy"
        />
        <p className="text-xl font-serif">
          {fundData.name} is organizing this fundraise
        </p>
      </div>

      <div className="border border-gray-200 mt-4 "></div>

      <div className="flex gap-2 items-center mt-5">
        <ClockIcon className="w-6 h-6" />
        <p className="text-sm text-gray-500">
          {fundData.created_at
            ? "Created at: " + fundData.created_at.slice(0, 10)
            : "Created at: -"}
        </p>
      </div>

      <div className="border border-gray-200 mt-5 "></div>

      <p className="text-gray-700 my-6 mb-8 break-all">{fundData.story}</p>

      <p className="font-semibold mb-5 text-2xl">Organizer</p>

      <div className="flex gap-24">
        <div className="flex items-start gap-2">
          <img
            width={40}
            height={40}
            src={
              "https://api.dicebear.com/6.x/bottts/svg?seed=" + fundData.name
            }
            alt="avt"
            loading="lazy"
          />
          <div className="flex flex-col">
            <p className="font-semibold">{fundData.name}</p>
            <p className="font-light text-sm">Organzier</p>
            <p className="font-light text-sm">Lahania, CL</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <img
            width={40}
            height={40}
            src={
              "https://api.dicebear.com/6.x/bottts/svg?seed=" +
              fundData.beneficiary_name
            }
            alt="avt"
            loading="lazy"
          />
          <div className="flex flex-col">
            <p className="font-semibold">{fundData.beneficiary_name}</p>
            <p className="font-light text-sm">Beneficiary</p>
            <p className="font-light text-sm">{fundData.place}</p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 my-10"></div>

      <p className="text-3xl font-semibold font-sans">Words of Support</p>
      <p className="mt-2 ml-0.5 font-light">
        Kindly contribute to help share the love.
      </p>

      <div className="mt-5 flex flex-col gap-2">
        {fundData?.comments?.map((c, i) => (
          <div key={c.id}>
            <div className="mb-2 flex gap-3 p-2">
              <HeartIcon className="w-8 h-8 text-red-500" />
              <div className="flex flex-col">
                <p className="font-semibold">{c.donator}</p>
                <p className="text-sm text-gray-600">${c.amount}</p>
                <p className="mt-1 break-all">{c.comment}</p>
              </div>
            </div>
            <div className="border border-gray-100 mx-2 mb-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
