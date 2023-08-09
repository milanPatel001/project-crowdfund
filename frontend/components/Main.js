"use client";

import { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import Display from "./Display";

export default function Main() {
  return (
    <div>
      <h1>HELLLO</h1>
      <Display totalAmount={34} />
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
