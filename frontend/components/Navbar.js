"use client";

import { useEffect, useState } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <div className="bg-white p-4 sticky top-0 shadow-2xl z-50">
      <div className="flex items-center">
        <h1 className="text-green-600 ml-10 font-serif font-bold text-4xl cursor-default select-none w-2/5">
          FundX
        </h1>

        <div
          className="flex items-center gap-2 ml-8 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-green-600 hover:font-bold hover:text-white cursor-pointer"
          onClick={() => router.push("/")}
        >
          <HomeIcon className="w-7 h-7" />
          HOME
        </div>
      </div>
    </div>
  );
}
