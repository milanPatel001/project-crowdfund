import { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useParams, useRouter } from "next/navigation";

export default function RightSection({
  openisleaderBoard,
  openSeeAllModal,
  openShareModal,
  fundData,
}) {
  const router = useRouter();
  const params = useParams();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let percent = (fundData.total_donation * 100) / fundData.goal;
    if (percent > 100) percent = 100;
    setProgress(percent);
  }, [fundData.total_donation]);

  return (
    <div className="flex flex-col gap-2 m-4 mt-16 shadow-xl border border-t-1 border-gray-300 rounded-2xl p-4 sticky top-24">
      <div>
        <span className="font-serif text-3xl">${fundData.total_donation} </span>
        <span className="text-gray-500 font-serif">
          raised of ${fundData.goal} goal
        </span>

        <div className="w-full bg-gray-200 rounded-full h-1.5 my-2">
          <div
            className="bg-green-600 h-1.5 rounded-full"
            style={{ width: progress + "%" }}
          />
        </div>
      </div>
      <p className=" text-sm text-gray-400 mb-2">
        {fundData.donation_num} donations
      </p>
      <button
        className="py-3 mx-6 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-300"
        onClick={() => router.push(`/${params.fundId}/donation`)}
      >
        Donate Now
      </button>

      <button
        className="py-3 mx-6 bg-yellow-400 rounded-xl font-semibold hover:bg-yellow-300"
        onClick={() => openShareModal()}
      >
        Share
      </button>

      <div className="border border-gray-200 mt-4 "></div>

      <p className="text-xl mt-1 mb-1 font-light text-gray-500 underline underline-offset-4">
        Recent Donations
      </p>

      {/* Recent Donations - max 3 on display*/}
      <div className="flex flex-col gap-5">
        {fundData?.recentDonators?.slice(0, 4).map((p) => (
          <div key={p.amount} className="flex flex-row gap-2">
            <img
              width={40}
              height={40}
              src={"https://api.dicebear.com/6.x/bottts/svg?seed=" + p.donator}
              alt="avt"
            />
            <div className="flex flex-col">
              <p className="text-gray-700 font-mono font-light">{p.donator}</p>
              <p className="text-sm font-semibold">${p.amount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-row w-full mt-3 px-1">
        <button
          className="text-white bg-red-500 font-semibold rounded-xl px-3 py-2 hover:bg-red-600"
          onClick={() => openSeeAllModal()}
        >
          See all
        </button>
        <button
          onClick={() => openisleaderBoard()}
          className="bg-green-700 text-white font-semibold rounded-xl px-3 py-2 ml-3 hover:bg-green-600"
        >
          $ See Top Donations $
        </button>
      </div>
    </div>
  );
}
