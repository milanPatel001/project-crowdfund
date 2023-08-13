import { XCircleIcon } from "@heroicons/react/24/outline";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

export default function ShareModal({ isOpen, onClose, fundData }) {
  const url = "http://localhost:3000/1";
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-xl">
      {/* Background blur */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-xl z-10 flex flex-col h-2/3 lg:w-1/3">
        {/* Your modal content */}

        <div className="flex justify-end items-center w-full sticky top-0 bg-white rounded-xl p-4">
          <XCircleIcon
            className="w-10 h-10 font-light hover:text-red-500 cursor-pointer"
            onClick={onClose}
          />
        </div>

        <div className=" font-medium text-3xl w-2/3 px-8">Help by Sharing</div>

        <p className="px-8 my-3 font-light">
          Spread the word and share the magic – together, our story reaches new
          horizons on social media
        </p>

        <div className="border border-gray-200 mx-8"></div>

        {/* Icons */}
        <div className="flex flex-col gap-2 justify-center mt-8">
          <div className="flex gap-3 justify-center">
            <EmailShareButton url={url}>
              <EmailIcon round={true} />
            </EmailShareButton>

            <FacebookShareButton url={url}>
              <FacebookIcon round={true} />
            </FacebookShareButton>

            <FacebookMessengerShareButton url={url}>
              <FacebookMessengerIcon round={true} />
            </FacebookMessengerShareButton>

            <LinkedinShareButton url={url}>
              <LinkedinIcon round={true} />
            </LinkedinShareButton>
          </div>

          <div className="flex gap-3 justify-center">
            <RedditShareButton url={url}>
              <RedditIcon round={true} />
            </RedditShareButton>

            <WhatsappShareButton url={url}>
              <WhatsappIcon round={true} />
            </WhatsappShareButton>

            <PinterestShareButton url={url}>
              <PinterestIcon round={true} />
            </PinterestShareButton>
          </div>
        </div>

        <div className="flex gap-4 mx-auto my-auto">
          <input
            className="p-2 border border-gray-200 rounded-xl hover:ring-1 hover:ring-green-400"
            value="http://localhost:3000/1"
            disabled
          ></input>
          <button
            className="p-2 px-4 border border-black rounded-xl text-white bg-black hover:bg-gray-600"
            onClick={() =>
              navigator.clipboard.writeText("http://localhost:3000/1")
            }
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
