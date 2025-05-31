import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { db } from "../configs/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Submitting from "../components/Submitting";
import { FormData } from "../interfaces/form";
import useCheck from "./../hooks/useCheck";
import Loader from "../components/Loader";

function Form() {
  const navigate = useNavigate();
  const auth = getAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {validateField,validateForm } = useCheck();
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
    membershipNumber: "",
    cgpa: "",
  });
  const [fetching, setFetching] = useState(true);
  const [hasMembership, setHasMembership] = useState<boolean>(!!formData.membershipNumber);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const roleSY: string[] = [
    "Technical Team",
    "Creative Team",
    "Marketing Team",
    "Operations Team",
  ];

  const roleTY: string[] = [
    "Chairperson",
    "Vice Chairperson",
    "Secretary",
    "Treasurer",
    "Technical Head",
    "Creative Head",
    "Marketing Head",
    "Operations Head",
  ];

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: "",
      role2: "",
    }));

    setValidationErrors((prev) => ({
      ...prev,
      role: false,
      role2: false,
    }));
  },[formData.year]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        showToast("Please login to access the form", "error");
        navigate("/");
        setFetching(false);
        return;
      }

      try {
        const formRef = doc(db, "applications", user.uid);
        const docSnap = await getDoc(formRef);

        if (docSnap.exists()) {
          if (docSnap.data().submitted) {
            localStorage.setItem("ViewForm", "true");
            navigate("/success");
            setFetching(false);
            return;
          }
          setFormData(docSnap.data() as FormData);
        } else {
          setFormData((prev) => ({
            ...prev,
            fullName: user.displayName || "",
            email: user.email || "",
          }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error checking submission status";
        showToast(errorMessage, "error");
      } finally {
        setFetching(false);
      }
    });

    return () => unsubscribe();
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
    if (localStorage.getItem("ViewForm") === "true") {
      return;
    }
    
    const { name, value, type } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      if (name === "membercheck") {
        setHasMembership(checked);
        setFormData((prev) => ({
          ...prev,
          membershipNumber: checked ? prev.membershipNumber : "",
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      validateField(name, value, setValidationErrors, hasMembership);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    validateField(name, value, setValidationErrors, hasMembership);
  };

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const formRef = doc(db, "applications", user.uid);
        await setDoc(formRef, formData, { merge: true });
      }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!validateForm(formData, setTouched, hasMembership, setValidationErrors)) {
        showToast("Please correct all errors before submitting.", "error");
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
      localStorage.setItem("ViewForm", "true");
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
  
  const getInputClasses = (fieldName: string) => {
    const isViewOnly = localStorage.getItem("ViewForm") === "true";
    const isInvalid = touched[fieldName] && validationErrors[fieldName];
    const isEmpty = touched[fieldName] && !formData[fieldName as keyof FormData];
    
    let baseClasses = "p-2 mt-1 block w-full rounded-lg shadow-sm transition-colors ";
    
    if (isViewOnly) {
      return baseClasses + "bg-gray-800/50 border-gray-700 text-gray-400 cursor-not-allowed";
    } else if (isInvalid) {
      return baseClasses + "bg-gray-800/50 border-2 border-red-500 text-white focus:ring-red-400";
    } else if (isEmpty) {
      return baseClasses + "bg-gray-800/50 border-2 border-yellow-500 text-white focus:border-blue-500 focus:ring-blue-500";
    } else {
      return baseClasses + "bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-blue-500";
    }
  };

  if (fetching) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
                  Full Name<text className="text-red-600">*</text>
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
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
                  Email<text className="text-red-600">*</text>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="p-2 mt-1 block w-full rounded-lg bg-gray-800/50 border-gray-700 text-gray-400 shadow-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="rollNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Roll Number<text className="text-red-600">*</text>
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  id="rollNumber"
                  value={formData.rollNumber}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={11}
                  placeholder="Enter your roll number"
                  className={getInputClasses("rollNumber")}
                />
                {touched.rollNumber && validationErrors.rollNumber && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid roll number</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-gray-300"
                >
                  Branch<text className="text-red-600">*</text>
                </label>
                <select
                  name="branch"
                  id="branch"
                  value={formData.branch}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses("branch")}
                >
                  <option value="">Select Branch</option>
                  <option>Computer Engineering</option>
                  <option>Information Technology</option>
                  <option>Electronics & Computer Engineering</option>
                  <option>Computer & Communication Engineering</option>
                  <option>Computer Science & Business Systems</option>
                  <option>Electronics & Telecommunication Engineering</option>
                  <option>
                    Electronics Engineering (VLSI Design & Technology)
                  </option>
                  <option>Mechanical Engineering</option>
                  <option>Robotics & Artificial Intelligence</option>
                  <option>Artificial Intelligence & Data Science</option>
                </select>
                {touched.branch && validationErrors.branch && (
                  <p className="mt-1 text-sm text-red-500">Please select a branch</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-300"
                >
                  Year (as of 25-26)<text className="text-red-600">*</text>
                </label>
                <select
                  name="year"
                  id="year"
                  value={formData.year}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses("year")}
                >
                  <option value="">Select Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                </select>
                {touched.year && validationErrors.year && (
                  <p className="mt-1 text-sm text-red-500">Please select your year</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cgpa"
                  className="block text-sm font-medium text-gray-300"
                >
                  CGPA<text className="text-red-600">*</text>
                </label>
                <input
                  type="tel"
                  name="cgpa"
                  id="cgpa"
                  placeholder="8.79"
                  value={formData.cgpa}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className={getInputClasses("cgpa")}
                />
                {touched.cgpa && validationErrors.cgpa && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid CGPA</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Phone Number<text className="text-red-600">*</text>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className={getInputClasses("phoneNumber")}
                />
                {touched.phoneNumber && validationErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid 10-digit phone number</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="githubProfile"
                  className="block text-sm font-medium text-gray-300"
                >
                  GitHub Profile<text className="text-red-600">*</text>
                </label>
                <input
                  type="url"
                  name="githubProfile"
                  id="githubProfile"
                  value={formData.githubProfile}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://github.com/yourusername"
                  className={getInputClasses("githubProfile")}
                />
                {touched.githubProfile && validationErrors.githubProfile && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid GitHub URL</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="linkedinProfile"
                  className="block text-sm font-medium text-gray-300"
                >
                  LinkedIn Profile<text className="text-red-600">*</text>
                </label>
                <input
                  type="url"
                  name="linkedinProfile"
                  id="linkedinProfile"
                  placeholder="https://www.linkedin.com/in/yourusername"
                  value={formData.linkedinProfile}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getInputClasses("linkedinProfile")}
                />
                {touched.linkedinProfile && validationErrors.linkedinProfile && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid LinkedIn URL</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="codechefProfile"
                  className="block text-sm font-medium text-gray-300"
                >
                  Codechef Profile<text className="text-red-600">*</text>
                </label>
                <input
                  type="url"
                  name="codechefProfile"
                  id="codechefProfile"
                  value={formData.codechefProfile}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://www.codechef.com/users/yourusername"
                  className={getInputClasses("codechefProfile")}
                />
                {touched.codechefProfile && validationErrors.codechefProfile && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid Codechef URL</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-gray-300"
              >
                Resume Link (Anyone with the link) <text className="text-red-600">*</text>
              </label>
              <input
                type="url"
                name="resume"
                id="resume"
                value={formData.resume}
                disabled={localStorage.getItem("ViewForm") === "true"}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="https://drive.google.com/file/d/yourfileid/view"
                className={getInputClasses("resume")}
              />
              {touched.resume && validationErrors.resume && (
                <p className="mt-1 text-sm text-red-500">Please enter a valid resume URL</p>
              )}
            </div>

            <div className="pt-2 flex items-center">
              <input
                type="checkbox"
                name="membercheck"
                id="memberCheck"
                checked={hasMembership}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 bg-gray-800/50 border-gray-700 rounded focus:ring-blue-500 transition-colors"
              />
              <label
                htmlFor="memberCheck"
                className="text-sm font-medium text-gray-300 pl-3"
              >
                Do you have an ACM membership?
              </label>
            </div>

            {hasMembership && (
              <div className="mt-4">
                <label
                  htmlFor="membershipNumber"
                  className="block text-sm font-medium text-gray-300"
                >
                  Membership Number<span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  name="membershipNumber"
                  id="membershipNumber"
                  value={formData.membershipNumber}
                  disabled={localStorage.getItem("ViewForm") === "true"}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={7}
                  placeholder="1234567"
                  className={getInputClasses("membershipNumber")}
                />
                {touched.membershipNumber && validationErrors.membershipNumber && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid membership number</p>
                )}
              </div>
            )}

            <hr className="border-white/50" />

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300"
              >
                Role Choice 1<text className="text-red-600">*</text>
              </label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={
                  !formData.year || localStorage.getItem("ViewForm") === "true"
                }
                aria-label="Select your first role preference"
                className={`disabled:opacity-50 disabled:cursor-not-allowed ${getInputClasses("role")}`}
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
              {touched.role && validationErrors.role && (
                <p className="mt-1 text-sm text-red-500">
                  {formData.role === formData.role2 && formData.role ? 
                    "First and second choices must be different" : 
                    "Please select a role"}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role2"
                className="block text-sm font-medium text-gray-300"
              >
                Role Choice 2<text className="text-red-600">*</text>
              </label>
              <select
                name="role2"
                id="role2"
                value={formData.role2}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={
                  !formData.year || localStorage.getItem("ViewForm") === "true"
                }
                aria-label="Select your second role preference"
                className={`disabled:opacity-50 disabled:cursor-not-allowed ${getInputClasses("role2")}`}
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
              {touched.role2 && validationErrors.role2 && (
                <p className="mt-1 text-sm text-red-500">
                  {formData.role === formData.role2 && formData.role2 ? 
                    "First and second choices must be different" : 
                    "Please select a second role"}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="whyACM"
                className="block text-sm font-medium text-gray-300"
              >
                Why do you want to join ACM? (Answer in minimum 30 words)
                <text className="text-red-600">*</text>
              </label>
              <textarea
                name="whyACM"
                id="whyACM"
                rows={3}
                value={formData.whyACM}
                disabled={localStorage.getItem("ViewForm") === "true"}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClasses("whyACM")}
              />
              {touched.whyACM && validationErrors.whyACM && (
                <p className="mt-1 text-sm text-red-500">Please write at least 30 words</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-red-500 hover:scale-105 cursor-pointer transition-all"
              >
                Logout
              </button>
              {!localStorage.getItem("ViewForm") && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Submitting />
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Form;
