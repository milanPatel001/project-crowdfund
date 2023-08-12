
import React, { useEffect, useState } from "react";

export default function LeftSection() {
  const title = "CrowdFunding";
  const imageUrl = "https://www.google.com/imgres?imgurl=https%3A%2F%2Fwww.sec.gov%2Ffiles%2Fcrowdfunding-v5b-2016.jpg&tbnid=RffF91uwOv3gTM&vet=12ahUKEwi0vNXg1deAAxVPO1kFHSHeA4YQMygGegUIARD7AQ..i&imgrefurl=https%3A%2F%2Fwww.sec.gov%2Fsecurities-topics%2Fcrowdfunding&docid=QyoXbzaWah8JzM&w=1024&h=512&q=crowdfunding&ved=2ahUKEwi0vNXg1deAAxVPO1kFHSHeA4YQMygGegUIARD7AQ";
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
