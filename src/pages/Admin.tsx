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
  const auth = getAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const isAdmin = user.email === "minav.karia@somaiya.edu"; 
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
      } catch (err) {
        setError("Failed to fetch applications");
        showToast("Failed to fetch applications", "error");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, showToast]);

  const downloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(applications);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
      XLSX.writeFile(workbook, "acm_applications.xlsx");
      showToast("Excel file downloaded successfully", "success");
    } catch (err) {
      showToast("Failed to download Excel file", "error");
    }
  };

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
          <button
            onClick={downloadExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Download Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Roll Number</th>
                <th className="p-4 text-left">Branch</th>
                <th className="p-4 text-left">Year</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Role 2</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-800/50"
                >
                  <td className="p-4">{app.fullName}</td>
                  <td className="p-4">{app.email}</td>
                  <td className="p-4">{app.rollNumber}</td>
                  <td className="p-4">{app.branch}</td>
                  <td className="p-4">{app.year}</td>
                  <td className="p-4">{app.phoneNumber}</td>
                  <td className="p-4">{app.role}</td>
                  <td className="p-4">{app.role2}</td>
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
