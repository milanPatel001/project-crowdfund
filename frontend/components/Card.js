import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";

export default function Card({ fund }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let percent = (fund.total_donation * 100) / fund.goal;
    if (percent > 100) percent = 100;
    setProgress(percent);
  }, [fund.total_donation]);

  return (
    <div
      className="flex flex-col gap-1 w-72 h-96 rounded-xl bg-white hover:scale-105 transition ease-in-out duration-300 shadow-lg cursor-pointer"
      onClick={() => router.push(`/${fund.id}`)}
    >
      <div className="h-2/5 rounded-t-xl relative">
        <Image
          objectFit="contain"
          layout="fill"
          src="/ancestors.png"
          alt="ok"
        />
      </div>
      <div className="flex flex-col gap-1 p-3">
        {/* Place */}
        <p className="font-semibold text-green-600">{fund.place}</p>

        {/* Title */}
        <p className="font-bold truncate">{fund.title}</p>

        {/* Story Details (First two lines) */}
        <p className="line-clamp-2 font-light">{fund.story}</p>

        {/* Last Donation */}
        <p className="text-gray-500 font-light text-sm mt-3">
          Last donation {fund.created_at}
        </p>

        {/* Progress Bar */}

        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 dark:bg-gray-700 relative">
          <div
            className="bg-green-600 h-1.5 rounded-full"
            style={{ width: progress + "%" }}
          />
        </div>

        {/* Current Donation out of goal */}
        <p className="">
          <span className="font-bold ml-0.5">
            ${fund.total_donation} raised{" "}
          </span>
          of ${fund.goal}
        </p>
      </div>
    </div>
  );
}
