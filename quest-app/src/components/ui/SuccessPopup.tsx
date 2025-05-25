import React from "react";

interface SuccessPopupProps {
  message: string;
  onOk: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onOk }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center animate-fade-in">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-green-500 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#d1fae5" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12l3 3 5-5"
              stroke="#22c55e"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>
        </div>
        <div className="text-lg font-semibold text-gray-800 mb-6 text-center">{message}</div>
        <button
          onClick={onOk}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          OK
        </button>
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SuccessPopup;
