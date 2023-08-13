import Image from "next/image";
import { CurrencyDollarIcon, UserIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";
import { useParams, useRouter } from "next/navigation";

export default function DonationSection() {
  const [donationInput, setDonationInput] = useState("5");
  const [tipButton, setTipButton] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(5);
  const [name, setName] = useState("Anonymous");

  const socket = useSocket();
  const params = useParams();
  const router = useRouter();

  const handleTipChange = (percent) => {
    const amt = (Number(donationInput) * percent) / 100;

    setTipAmount(amt);
    setTipButton(percent);
    setTotalAmount(Math.ceil(amt + Number(donationInput)));
  };

  const handleActiveTip = (percent) => {
    let tipCss =
      "rounded-xl px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-500 hover:bg-green-300 hover:text-blue-700";

    if (tipButton === percent) {
      tipCss += " active: bg-green-400 active: text-blue-800";
    }

    return tipCss;
  };

  const handleDonationInput = (e) => {
    const re = /^[0-9\b]+$/;

    // if value is not blank, then test the regex
    if (e.target.value === "" || re.test(e.target.value)) {
      setDonationInput(e.target.value);

      if (e.target.value === "") {
        setTipAmount(0);
        setTotalAmount(0);
      } else {
        setTipAmount((e.target.value * tipButton) / 100);
        setTotalAmount(
          Math.ceil((e.target.value * tipButton) / 100) + Number(e.target.value)
        );
      }
    }
  };

  const handleDonationClick = () => {
    const data = {
      index: params.fundId,
      amount: totalAmount,
      donator: name,
    };

    console.log(totalAmount);
    console.log(name);
    console.log(data.index);

    socket.emit("donate", data);

    router.push(`/${params.fundId}`);
  };

  return (
    <div className="flex flex-col z-40 bg-white p-7 rounded-xl border border-gray-200 shadow-xl">
      <div className="flex flex-row items-center">
        <div className="relative">
          <Image src="/ancestors.png" width={80} height={80} alt="ok" />
        </div>
        <div className="flex flex-col ml-4">
          <p>
            You're supporting{" "}
            <span className=" font-bold"> HELPP ASYA ALIE </span>{" "}
          </p>
          <p className=" text-gray-400 font-light">
            Your donation will benefit <span className="font-bold">ALICE</span>
          </p>
        </div>
      </div>

      <div className="border border-gray-100 w-full mx-auto mt-5 mb-3"></div>

      <p className="mb-2 font-semibold font-serif">
        Enter your donation amount
      </p>

      <div className="w-full p-2 flex items-center border-2 border-gray-600 rounded-xl">
        <CurrencyDollarIcon className="w-12 h-12" />
        <input
          value={donationInput}
          className=" w-full ml-2 focus:outline-none font-extrabold font-serif text-xl"
          onChange={(e) => handleDonationInput(e)}
        ></input>
      </div>

      {/* Tip section */}

      <p className=" font-serif text-gray-500 mt-5">
        Show your appreciation for great service by leaving a tip. Your
        generosity is always appreciated!
      </p>
      <div className="flex gap-2 mt-3 justify-center" role="group">
        <button
          type="button"
          className={handleActiveTip(0)}
          onClick={() => handleTipChange(0)}
        >
          0 %
        </button>
        <button
          type="button"
          className={handleActiveTip(5)}
          onClick={() => handleTipChange(5)}
        >
          5 %
        </button>
        <button
          type="button"
          className={handleActiveTip(10)}
          onClick={() => handleTipChange(10)}
        >
          10 %
        </button>
        <button
          type="button"
          className={handleActiveTip(15)}
          onClick={() => handleTipChange(15)}
        >
          15 %
        </button>
        <button
          type="button"
          className={handleActiveTip(20)}
          onClick={() => handleTipChange(20)}
        >
          20 %
        </button>
      </div>

      {/* Receipt section */}
      <div className="border border-gray-500 my-5 w-full mx-auto"></div>
      <p className="font-bold mb-2">Total amount</p>

      <div className="flex">
        <div className="w-2/3 font-light">Donation amount</div>
        <div className="flex justify-end items-end w-1/3">${donationInput}</div>
      </div>

      <div className="flex">
        <div className="w-2/3 font-light">Tip</div>
        <div className="flex justify-end items-end w-1/3">${tipAmount}</div>
      </div>

      <div className="border border-gray-200 my-5 w-full mx-auto"></div>
      <div className="flex">
        <div className="w-2/3 font-light">Total Due (Rounded up)</div>
        <div className="flex justify-end items-end w-1/3">${totalAmount}</div>
      </div>

      {/* Name Section */}

      <div className="border border-gray-200 my-5 w-full mx-auto"></div>

      <p>Enter your display name</p>
      <div className="border-2 border-black rounded-xl mt-2 flex items-center p-2">
        <UserIcon className="w-10 h-10" />
        <input
          value={name}
          className="focus:outline-none ml-2 font-extrabold font-serif text-xl"
          onChange={(e) => setName(e.currentTarget.value)}
        ></input>
      </div>

      <button
        className="mt-10 p-3 bg-yellow-400 rounded-xl font-bold w-1/2 mx-auto hover:bg-yellow-300"
        onClick={() => handleDonationClick()}
      >
        Donate
      </button>
    </div>
  );
}
