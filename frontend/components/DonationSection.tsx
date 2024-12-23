import Image from "next/image";
import { CurrencyDollarIcon, UserIcon } from "@heroicons/react/24/outline";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSocket } from "./SocketProvider";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type DonationProps = {
  title: string,
  beneficiary: string
}

export default function DonationSection({title, beneficiary} : DonationProps) {
  const [tipButton, setTipButton] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(5);

  const toast_id = "warning1";

  const [donationInput, setDonationInput] = useState("5");
  const [name, setName] = useState("Anonymous");
  const [comment, setComment] = useState("");
  //const [fundData, setFundData] = useState<FundData>()

  const s = useSocket();
  const params = useParams();
  const router = useRouter();

  const handleTipChange = (percent : number) => {
    const amt = (Number(donationInput) * percent) / 100;

    setTipAmount(amt);
    setTipButton(percent);
    setTotalAmount(Math.ceil(amt + Number(donationInput)));
  };

  const handleActiveTip = (percent : number) => {
    let tipCss =
      "rounded-xl px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-500 hover:bg-green-300 hover:text-blue-700 ";

    if (tipButton == percent) {
      tipCss += "bg-green-400 text-blue-800";
    }

    return tipCss;
  };

  const handleDonationInput = (e : ChangeEvent<HTMLInputElement>) => {
    const re = /^[0-9\b]+$/;

    // if value is not blank, then test the regex
    if (e.target.value === "" || re.test(e.target.value)) {
      setDonationInput(e.target.value);

      if (e.target.value === "") {
        setTipAmount(0);
        setTotalAmount(0);
      } else {
        setTipAmount((Number(e.target.value) * tipButton) / 100);
        setTotalAmount(
          Math.ceil((Number(e.target.value) * tipButton) / 100) + Number(e.target.value)
        );
      }
    }
  };

  const createCheckoutSession = async (data : any) => {
    //const stripe = await stripePromise;

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_SERVER_URL + "/createCheckoutSession",
        {
          method: "POST",
          // headers: {
          //   // "Content-Type": "application/json",
          //   // Accept: "application/json",
          // },
          body: JSON.stringify(data),
          cache: "no-store",
          credentials: "include"
        }
      );

      if (
        res.status == 400 ||
        res.status == 401 ||
        res.status == 404 ||
        res.status == 500
      ) {
        console.error("Error before json");
        return;
      }else if(res.status == 403){
          s?.logout()
          return
      }

      res
        .text()
        .then((url) => {
          router.push(url)
        })
        .catch((ex) => console.warn(ex));
    } catch (ex) {
      console.warn(ex);
    }
  };

  const handleDonationClick = async () => {
    if (Number(donationInput) < 5) {
      toast.error("Donation amount must be at least $5.00", {
        toastId: toast_id,
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      toast.clearWaitingQueue();
    } else {

      if(!s?.fundIdMap.current.has(Number(params.fundId))){
        router.replace("/")
      }

      const index = s?.fundIdMap.current.get(Number(params.fundId));
      const fundData = s?.fundsData[index]
       
      
      const data = {
        fundId: params.fundId,
        amount: totalAmount,
        donator: name,
        comment: comment,
        userId: s?.userId,
        organizer: fundData?.name,
        beneficiary: fundData?.beneficiary_name,
        //socketId: socket.id,
      };


      await createCheckoutSession(data);

    }
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
            <span className=" font-bold"> {title} </span>{" "}
          </p>
          <p className=" text-gray-400 font-normal">
            Your donation will benefit{" "}
            <span className="font-bold text-gray-600">
              {beneficiary}
            </span>
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
        generosity is always appreciated! (for website maintenance)
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

      <label
        htmlFor="message"
        className="block mt-5 mb-2 ml-0.5 text-sm font-medium text-gray-900 dark:text-white"
      >
        Show some words of support
      </label>
      <textarea id="message" rows={4} 
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none"
        placeholder="Write your thoughts here..."
        value={comment}
        onChange={(e) => setComment(e.currentTarget.value)}
      ></textarea>

      <button
        className="mt-10 p-3 bg-yellow-400 rounded-xl font-bold w-1/2 mx-auto hover:bg-yellow-300"
        onClick={() => handleDonationClick()}
      >
        Donate
      </button>
    </div>
  );
}
