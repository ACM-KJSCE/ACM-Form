import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { db } from "../configs/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Submitting from "../components/Submitting";
import { FormData } from "../interfaces/form";
import useCheck from "./../hooks/useCheck";

function Form() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { allFilled, regexProper } = useCheck();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    rollNumber: "",
    branch: "",
    year: "",
    phoneNumber: "",
    githubProfile: "",
    linkedinProfile: "",
    codechefProfile: "",
    resume: "",
    whyACM: "",
    role: "",
    role2: "",
  });

  const roleSY: string[] = [
    "Technical Team",
    "Creative Team",
    "Marketing Team",
    "Public Relations Team",
    "Operations Team",
  ];

  const roleTY: string[] = [
    "Technical Head",
    "Creative Head",
    "Marketing Head",
    "Public Relations Head",
    "Operations Head",
  ];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      showToast("Please login to access the form", "error");
      navigate("/");
      return;
    }
    const checkSubmission = async () => {
      try {
        const formRef = doc(db, "applications", user.uid);
        const docSnap = await getDoc(formRef);

        if (docSnap.exists() && docSnap.data().submitted) {
          navigate("/success");
          return;
        }

        setFormData((prev) => ({
          ...prev,
          fullName: user.displayName || "",
          email: user.email || "",
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error checking submission status";
        showToast(errorMessage, "error");
      }
    };

    checkSubmission();
  }, [auth, navigate, showToast]);

  const autoSave = async (data: FormData) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const formRef = doc(db, "applications", user.uid);
      await setDoc(formRef, data, { merge: true });
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        autoSave(formData);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const formRef = doc(db, "applications", user.uid);
        await setDoc(formRef, formData, { merge: true });
      }

      await signOut(auth);
      showToast("Logged out successfully", "success");
      navigate("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout";
      showToast(errorMessage, "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!allFilled(formData)) {
        showToast("Please fill all the fields", "error");
        setLoading(false);
        return;
      }

      if (regexProper(formData.phoneNumber, "phone") === false) {
        showToast("Please enter a valid phone number", "error");
        setLoading(false);
        return;
      }
      if (regexProper(formData.githubProfile, "github") === false) {
        showToast("Please enter a valid GitHub profile link", "error");
        setLoading(false);
        return;
      }
      if (regexProper(formData.linkedinProfile, "linkedin") === false) {
        showToast("Please enter a valid LinkedIn profile link", "error");
        setLoading(false);
        return;
      }
      if (regexProper(formData.codechefProfile, "codechef") === false) {
        showToast("Please enter a valid Codechef profile link", "error");
        setLoading(false);
        return;
      }
      if (regexProper(formData.resume, "resume") === false) {
        showToast("Please enter a valid Resume link", "error");
        setLoading(false);
        return;
      }
      if (!formData.role && !formData.role2) {
        showToast("Please select at least one role", "error");
        setLoading(false);
        return;
      }
      if (formData.role === formData.role2) {
        showToast("Please select different roles", "error");
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const formRef = doc(db, "applications", user.uid);
      await setDoc(formRef, {
        ...formData,
        submitted: true,
        submittedAt: new Date().toISOString(),
      });

      showToast("Application submitted successfully!", "success");
      navigate("/success");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              KJSCE ACM Application
            </h1>
            <p className="text-gray-400 text-lg">
              Fill in your details to apply for KJSCE ACM
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  required
                  value={formData.fullName}
                  disabled
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-gray-400 shadow-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  disabled
                  className=" p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-gray-400 shadow-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  id="rollNumber"
                  required
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder="Enter your roll number"
                  className=" p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-gray-300"
                >
                  Branch
                </label>
                <select
                  name="branch"
                  id="branch"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="AIDS">AI & Data Science</option>
                  <option value="EXTC">Electronics & Telecommunication</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-300"
                >
                  Year
                </label>
                <select
                  name="year"
                  id="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="githubProfile"
                  className="block text-sm font-medium text-gray-300"
                >
                  GitHub Profile
                </label>
                <input
                  type="url"
                  name="githubProfile"
                  id="githubProfile"
                  required
                  value={formData.githubProfile}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  pattern="^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$"
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="linkedinProfile"
                  className="block text-sm font-medium text-gray-300"
                >
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedinProfile"
                  id="linkedinProfile"
                  required
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  pattern="^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$"
                  placeholder="https://linkedin.com/in/yourusername"
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="codechefProfile"
                  className="block text-sm font-medium text-gray-300"
                >
                  Codechef Profile
                </label>
                <input
                  type="url"
                  name="codechefProfile"
                  id="codechefProfile"
                  required
                  value={formData.codechefProfile}
                  onChange={handleChange}
                  placeholder="https://www.codechef.com/users/yourusername"
                  pattern="^https?:\/\/(www\.)?codechef\.com\/users\/[a-zA-Z0-9_-]+\/?$"
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-gray-300"
                >
                  Resume Link
                </label>
                <input
                  type="url"
                  name="resume"
                  id="resume"
                  required
                  value={formData.resume}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/file/d/yourfileid/view"
                  pattern="^https?:\/\/(drive\.google\.com)\/.*$"
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300"
              >
                Role Choice 1
              </label>
              <select
                name="role"
                id="role"
                required
                value={formData.role}
                onChange={handleChange}
                disabled={!formData.year}
                aria-label="Select your first role preference"
                className="p-2 mt-1 block disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              >
                <option value="">Select Role </option>
                {formData.year === "2"
                  ? roleSY.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))
                  : roleTY.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="role2"
                className="block text-sm font-medium text-gray-300"
              >
                Role Choice 2
              </label>
              <select
                name="role2"
                id="role2"
                required
                value={formData.role2}
                onChange={handleChange}
                disabled={!formData.year}
                aria-label="Select your second role preference"
                className="p-2 mt-1 block disabled:opacity-50 disabled:cursor-not-allowed w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              >
                <option value="">Select Role </option>
                {formData.year === "2"
                  ? roleSY.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))
                  : roleTY.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="whyACM"
                className="block text-sm font-medium text-gray-300"
              >
                Why do you want to join ACM?
              </label>
              <textarea
                name="whyACM"
                id="whyACM"
                rows={3}
                required
                value={formData.whyACM}
                onChange={handleChange}
                className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Submitting />
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Form;
