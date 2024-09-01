"use client";

import {
  HomeIcon,
  ClockIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSocket } from "./SocketProvider";

export default function Navbar() {
  const router = useRouter();
  const s = useSocket();

  const handleLogout = async () => {
 
    const res = await fetch(
      process.env.NEXT_PUBLIC_SERVER_URL + "/logout",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if(res.ok) {
      s?.socket?.close()
      router.replace("/login");
    }
    else {
      s?.socket?.close()
      router.replace("/login");
    }

    s?.logout();
  };

  return (
    <div className="bg-white p-4 sticky top-0 shadow-2xl z-50">
      <div className="flex flex-col md:flex-row items-center justify-center md:justify-normal md:gap-8 lg:gap-4">
        <h1
          onClick={() => router.push("/")}
          className="cursor-pointer mr-2 sm:mr-0 md:w-1/12 text-green-600 font-serif font-bold text-3xl sm:text-4xl select-none w-1/5"
        >
          FundX
        </h1>
        <div className="md:flex hidden gap-2 md:w-8/12 md:pl-10">
          <div
            className="hidden md:flex items-center gap-2 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-green-600 hover:font-bold hover:text-white cursor-pointer"
            onClick={() => router.push("/")}
          >
            <HomeIcon className="w-7 h-7" />
            HOME
          </div>

          <div
            className="flex items-center gap-2 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-blue-400 hover:font-bold hover:text-white cursor-pointer"
            onClick={() => router.push("/history")}
          >
            <ClockIcon className="w-7 h-7" />
            History
          </div>

          <div
            className="flex items-center gap-2 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-pink-500 hover:font-bold hover:text-white cursor-pointer"
            //onClick={() => router.push("/form")}
          >
            <PlusCircleIcon className="w-7 h-7" />
            Start a fundraiser
          </div>
        </div>

        <div className="md:w-4/12 hidden md:flex md:justify-end md:items-end ">
          <div
            className="p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-red-600 hover:font-bold hover:text-white cursor-pointer"
            onClick={handleLogout}
          >
            Log Out
          </div>
        </div>
      </div>
    </div>
  );
}
