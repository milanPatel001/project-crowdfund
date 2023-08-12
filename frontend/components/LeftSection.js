
import React, { useEffect, useState } from "react";

export default function LeftSection() {
  const title = "CrowdFunding";
  const imageUrl = "https://www.sec.gov/files/crowdfunding-v5b-2016.jpg";
  const story = "The Trust and Safety team inside CrowdFunding works with key stakeholders, including government officials, 
    to ensure that funds raised on the platform are verified and that they go to the cause for which the money is being raised.";

  return (
    <div>
      <h1>{title}</h1>
      <img src={imageUrl} alt="Crowdfunding Campaign" />
      <p>{story}</p>
    </div>
  );
}
