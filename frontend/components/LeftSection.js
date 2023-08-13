import React, { useState } from "react";

export default function LeftSection() {
  const title = "CrowdFunding";
  const imageUrl = "https://www.sec.gov/files/crowdfunding-v5b-2016.jpg";
  const story = "The Trust and Safety team inside CrowdFunding works with key stakeholders, including government officials, to ensure that funds raised on the platform are verified and that they go to the cause for which the money is being raised.";

  const [comments, setComments] = useState([
    { id: 1, user: "DummyUser1", text: "Great initiative!" },
    { id: 2, user: "DummyUser2", text: "I'm excited to contribute." },
    { id: 3, user: "DummyUser3", text: "This is a fantastic cause." },
    { id: 4, user: "DummyUser4", text: "Keep up the good work!" },
  ]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      <img src={imageUrl} alt="Crowdfunding Campaign" className="mb-4" />
      <p className="text-gray-700 mb-6">{story}</p>

      <div>
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        {comments.map((comment) => (
          <div key={comment.id} className="mb-2">
            <p className="text-gray-900">
              <strong>{comment.user}:</strong> {comment.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
