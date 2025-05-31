import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import * as XLSX from "xlsx";
import { FormData } from "../interfaces/form";

const Admin: React.FC = () => {
  const [applications, setApplications] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmittedOnly, setShowSubmittedOnly] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const stats = {
    total: applications.length,
    submitted: applications.filter((app) => app.submitted).length,
    secondYear: applications.filter((app) => app.year === "2").length,
    thirdYear: applications.filter((app) => app.year === "3").length,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      const isAdmin = user.email === "minav.karia@somaiya.edu" || true;
      if (!isAdmin) {
        showToast("Unauthorized access", "error");
        navigate("/");
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "applications"));
        const apps: FormData[] = [];
        querySnapshot.forEach((doc) => {
          apps.push(doc.data() as FormData);
        });
        setApplications(apps);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch applications";
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, showToast]);

  const downloadExcel = () => {
    try {

      const columnOrder = [
        "fullName",
        "email",
        "rollNumber",
        "branch",
        "year",
        "cgpa",
        "phoneNumber",
        "githubProfile",
        "linkedinProfile",
        "codechefProfile",
        "resume",
        "membershipNumber",
        "role",
        "role2",
        "whyACM",
        "submitted",
        "submittedAt",
      ];

      const orderedApplications = applications.map((app) => {
        const ordered: any = {};
        columnOrder.forEach((key) => {
          ordered[key] = app[key as keyof typeof app] ?? "";
        });
        return ordered;
      });
      const worksheet = XLSX.utils.json_to_sheet(orderedApplications);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
      XLSX.writeFile(workbook, "acm_applications.xlsx");
      showToast("Excel file downloaded successfully", "success");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to download Excel file";
      showToast(errorMessage, "error");
    }
  };

  const displayedApplications = (showSubmittedOnly
    ? applications.filter((app) => app.submitted)
    : applications
  ).sort((a, b) => {
    if (!a.submittedAt) return 1;
    if (!b.submittedAt) return -1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  console.log(displayedApplications)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ACM Applications</h1>
          <div className="flex gap-4">
            <button
              onClick={downloadExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Download Excel
            </button>
            <button
              onClick={() => setShowSubmittedOnly((prev) => !prev)}
              className={`px-4 py-2 rounded-lg transition-colors border border-blue-600 ${
                showSubmittedOnly
                  ? "bg-blue-700 text-white"
                  : "bg-gray-800 text-blue-400 hover:bg-blue-900/30"
              }`}
            >
              {showSubmittedOnly ? "Show All" : "Show Submitted Only"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">Total Applications</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">Submitted</h3>
            <p className="text-2xl font-bold text-green-500">
              {stats.submitted}
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">Second Year</h3>
            <p className="text-2xl font-bold">{stats.secondYear}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm">Third Year</h3>
            <p className="text-2xl font-bold">{stats.thirdYear}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                {/* <th className="p-4 text-left">Roll Number</th> */}
                <th className="p-4 text-left">Branch</th>
                <th className="p-4 text-left">Year</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Role 2</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {displayedApplications.map((app, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-800/50"
                >
                  <td className="p-4">{app.fullName}</td>
                  <td className="p-4">{app.email}</td>
                  {/* <td className="p-4">{app.rollNumber}</td> */}
                  <td className="p-4">{app.branch}</td>
                  <td className="p-4">{app.year}</td>
                  <td className="p-4">{app.phoneNumber}</td>
                  <td className="p-4">{app.role}</td>
                  <td className="p-4">{app.role2}</td>
                  <td className="p-4">
                    {app.submitted ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        Submitted
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
