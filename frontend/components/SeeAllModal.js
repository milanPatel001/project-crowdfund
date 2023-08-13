import { UserCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function SeeAllModal({ isOpen, onClose, fundData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-xl">
      {/* Background blur */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-xl z-10 flex flex-col h-2/3 w-1/4">
        {/* Your modal content */}

        <div className="flex items-center w-full sticky top-0 bg-white rounded-xl shadow-lg p-4">
          <div className="font-semibold text-3xl w-2/3">Recent Donations</div>
          <div className="w-1/3 flex justify-end">
            <XCircleIcon
              className="w-10 h-10 font-light hover:text-red-500 cursor-pointer"
              onClick={onClose}
            />
          </div>
        </div>

        <div className="p-4 overflow-auto flex flex-col gap-3">
          {fundData?.recentDonators.map((d) => (
            <div className="flex flex-row gap-2">
              <UserCircleIcon className="h-14 w-12 text-gray-700" />
              <div className="flex flex-col">
                <p className="text-gray-700 font-mono font-light text-xl">
                  {d.donator}
                </p>
                <p className="ml-0.5 font-semibold text-base">${d.amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
