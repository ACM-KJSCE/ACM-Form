import  { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { db } from "../configs/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FormData } from "../interfaces/form";
import { onAuthStateChanged } from "firebase/auth";
import Loader from "../components/Loader";

function Preview() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData | null>(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      showToast("Please login to access the form", "error");
      navigate("/");
      return;
    }
    try {
      const formRef = doc(db, "applications", user.uid);
      const docSnap = await getDoc(formRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as FormData & { submitted?: boolean };
        if (data.submitted) {
          setFormData(data);
        } else {
          showToast("You have not submitted the form yet.", "error");
          navigate("/");
        }
      } else {
        showToast("No application found.", "error");
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error fetching submission";
      showToast(errorMessage, "error");
    }
  });

  return () => unsubscribe();
}, [auth, navigate, showToast]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("ViewForm");
      showToast("Logged out successfully", "success");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout";
      showToast(errorMessage, "error");
    }
  };

  if (!formData) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              KJSCE ACM Application Preview
            </h1>
            <p className="text-gray-400 text-lg">
              Here is your submitted application.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Full Name
                </span>
                <span className="block mt-1 text-white">{formData.fullName}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Email
                </span>
                <span className="block mt-1 text-white">{formData.email}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Roll Number
                </span>
                <span className="block mt-1 text-white">{formData.rollNumber}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Branch
                </span>
                <span className="block mt-1 text-white">{formData.branch}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Year
                </span>
                <span className="block mt-1 text-white">
                  {formData.year === "2" ? "Second Year" : formData.year === "3" ? "Third Year" : formData.year}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Phone Number
                </span>
                <span className="block mt-1 text-white">{formData.phoneNumber}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  GitHub Profile
                </span>
                <a
                  href={formData.githubProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-400 underline break-all"
                >
                  {formData.githubProfile}
                </a>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  LinkedIn Profile
                </span>
                <a
                  href={formData.linkedinProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-400 underline break-all"
                >
                  {formData.linkedinProfile}
                </a>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Codechef Profile
                </span>
                <a
                  href={formData.codechefProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-400 underline break-all"
                >
                  {formData.codechefProfile}
                </a>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300">
                  Resume Link
                </span>
                <a
                  href={formData.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-400 underline break-all"
                >
                  {formData.resume}
                </a>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-300">
                Role Choice 1
              </span>
              <span className="block mt-1 text-white">{formData.role}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-300">
                Role Choice 2
              </span>
              <span className="block mt-1 text-white">{formData.role2}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-300">
                Why do you want to join ACM?
              </span>
              <span className="block mt-1 text-white whitespace-pre-line">{formData.whyACM}</span>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-red-500 hover:scale-105 cursor-pointer transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;