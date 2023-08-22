"use client";

import { HomeIcon, CloudIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSocket } from "./SocketProvider";
import { deleteCookie } from "cookies-next";

export default function Navbar() {
  const router = useRouter();
  const { logout } = useSocket();

  const handleLogout = () => {
    deleteCookie("token");
    logout();
    router.replace("/login");
  };

  return (
    <div className="bg-white p-4 sticky top-0 shadow-2xl z-50">
      <div className="flex items-center">
        <h1 className="text-green-600 ml-2 lg:ml-10 font-serif font-bold text-4xl cursor-default select-none w-2/5">
          FundX
        </h1>

        <div
          className="flex items-center gap-2 lg:ml-8 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-green-600 hover:font-bold hover:text-white cursor-pointer"
          onClick={() => router.push("/")}
        >
          <HomeIcon className="w-7 h-7" />
          HOME
        </div>

        <div
          className="flex items-center gap-2 lg:ml-8 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-green-600 hover:font-bold hover:text-white cursor-pointer"
          onClick={() => router.push("/history")}
        >
          <CloudIcon className="w-7 h-7" />
          History
        </div>

        <div
          className="ml-8 sm:ml-48 lg:ml-96 p-1 px-2 rounded-xl text-black text-xl select-none hover:bg-red-600 hover:font-bold hover:text-white cursor-pointer"
          onClick={handleLogout}
        >
          Log Out
        </div>
      </div>
    </div>
  );
}
