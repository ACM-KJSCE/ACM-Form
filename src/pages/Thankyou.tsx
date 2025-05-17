import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useToast } from "../context/ToastContext";

const ThankYou: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const { showToast } = useToast();
  localStorage.setItem("ViewForm", "true");

  const handleLogout = async () => {
    try {
      localStorage.removeItem("ViewForm");
      await signOut(auth);
      showToast("Logged out successfully", "success");
      navigate("/");
    } catch (error) {
      showToast("Failed to logout", "error");
    }
  };

  const handleViewForm = () => {
    const ViewForm = localStorage.getItem("ViewForm");
    if (ViewForm === "true") {
      navigate("/preview");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8 text-center">
        <div className="mb-6 flex items-center justify-center">
          <img src="logo_withoutbg.png" alt="" className="w-48"/>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Thank You for Applying!
        </h1>

        <p className="text-gray-300 mb-8">
          Your application has been successfully submitted. We will review your
          application and get back to you soon.
        </p>

        <button
          onClick={handleViewForm}
          className="bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-lg font-medium cursor-pointer mb-6 sm:mr-6"
        >
          View Submitted Form
        </button>

        <button
          onClick={handleLogout}
          className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-lg font-medium cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );  
};

export default ThankYou;
