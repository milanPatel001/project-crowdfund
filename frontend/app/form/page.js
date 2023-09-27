"use client";

import { useState } from "react";

export default function Form() {
  const [zipCode, setZipCode] = useState("");

  return (
    <div className="">
      <form>
        <div>
          <input type="text" />
          <input type="text" />
        </div>
      </form>
    </div>
  );
}
