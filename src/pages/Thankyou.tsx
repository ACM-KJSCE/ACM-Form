import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useToast } from "../context/ToastContext";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Logged out successfully", "success");
      navigate("/");
    } catch (error) {
      showToast("Failed to logout", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Thank You for Applying!
        </h1>

        <p className="text-gray-300 mb-8">
          Your application has been successfully submitted. We will review your
          application and get back to you soon.
        </p>

        <button
          onClick={handleLogout}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
