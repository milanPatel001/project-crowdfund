export default function SeeAllModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background blur */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="bg-white rounded-lg p-4 z-10">
        {/* Your modal content */}
        <p>This is your modal content.</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-4"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
