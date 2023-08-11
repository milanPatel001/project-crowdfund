import Image from "next/image";
import { useRouter } from "next/router";

export default function Card() {
  return (
    <div className="flex flex-col gap-1 w-72 h-96 rounded-xl bg-white">
      <div className="h-2/5 rounded-t-xl relative">
        <Image objectFit="contain" layout="fill" src="/ancestors.png" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        {/* Place */}
        <p className="font-semibold text-green-600">BUFFALO, NY</p>

        {/* Title */}
        <p className="font-bold truncate">
          HELLlo wellington hahahxc sisiisi siuuuuuuuu ok lagauu
        </p>

        {/* Story Details (First two lines) */}
        <p className="line-clamp-2 font-light">
          I tried to do this severa ltime asiuuuuuuuuuu ok dsfsdfsdfss!!!!!!
          okokokokokokokoko
        </p>

        {/* Last Donation */}
        <p className="text-gray-500 font-light text-sm mt-3">
          Last donation 41m ago
        </p>

        {/* Progress Bar */}

        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 dark:bg-gray-700">
          <div className="bg-green-600 h-1.5 rounded-full w-1/2" />
        </div>

        {/* Current Donation out of goal */}
        <p className="">
          <span className="font-bold ml-0.5">$58,796 raised </span>
          of $90,000
        </p>
      </div>
    </div>
  );
}
