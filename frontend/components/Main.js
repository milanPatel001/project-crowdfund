"use client";

import { useEffect, useState } from "react";

import Display from "./Display";
import Card from "./Card";

export default function Main({ socket }) {
  const [fundsData, setFundsData] = useState(null);

  useEffect(() => {
    socket?.emit("fundsData request");
    socket?.on("fundsData response", (fundsData) => {
      setFundsData(fundsData);
      console.log(fundsData[0]);
    });
  }, [socket]);

  return (
    <div className="flex flex-col border border-pink-600 p-2 items-center bg-gray-200">
      <div className="grid grid-cols-3 gap-4 items-center border border-green-400 w-2/3 p-2">
        {fundsData?.map((fund) => (
          <Card key={fund.id} fund={fund} />
        ))}
      </div>
    </div>
  );
}

/*
export default function Main({ socket }) {
  const [donation, setDonation] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    console.log("inside main useeffect");
    socket?.emit("donation amount request", { index: 0 });

    socket?.on("donation amount value", ({ value }) => {
      console.log("Current amount: $", value);
      setTotalAmount(value);
    });

    socket?.on("donation", ({ socketId, amount, fundIndex }) => {
      console.log(
        "\nBroadcasted by Server: Client",
        socketId,
        "donated $",
        amount,
        "to ABC CORP."
      );

      socket.emit("donation amount request", { index: 0 });
    });
  }, [socket]);

  const handleDonation = (e) => {
    e.preventDefault();
    socket.emit("donate", { amount: Number(donation), index: 0 });
    socket.emit("donation amount request", { index: 0 });
  };

  return (
    <div className="flex flex-col">
      <p>Enter an amount to donate to: </p>

      <input
        placeholder="in $"
        name="donation"
        className="border-2 w-1/6 border-black p-2"
        onChange={(e) => setDonation(e.currentTarget.value)}
      />

      <button
        type="submit"
        onClick={(e) => handleDonation(e)}
        className="border border-black rounded-xl w-1/12 py-2 ml-14 mt-2 hover:bg-black hover:text-white"
      >
        Donate
      </button>

      <Display totalAmount={totalAmount} />
    </div>
  );
}
*/
