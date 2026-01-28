import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import Navbar from './navbar';
const STUDENT_URL = process.env.REACT_APP_STUDENT_URL;

const RunningEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { email } = useAuth();

  const handleDrop = async (enrollmentId) => {
    console.log("STUDENT_URL =", STUDENT_URL);
    const confirmDrop = window.confirm(
      "Are you sure you want to drop this course?"
    );
    console.log('abc')

    if (!confirmDrop) return;

    try {
      await axios.delete(
        `${STUDENT_URL}/drop-enrollment/${enrollmentId}`,

      );

      // Remove dropped enrollment from UI
      setEnrollments((prev) =>
        prev.filter((e) => e._id !== enrollmentId)
      );

      alert("Course dropped successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }

  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/student/enrollmentsrunning/${email}`
        );
        setEnrollments(response.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                ▶️
              </span>
              Running Enrollments
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Active courses you are currently enrolled in
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-gray-600 text-sm border-b">
                  <th className="py-3 text-left">Student Name</th>
                  <th className="py-3 text-left">Student ID</th>
                  <th className="py-3 text-left">Department</th>
                  <th className="py-3 text-left">Program</th>
                  <th className="py-3 text-left">Course</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Enrollment Date</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {enrollments.map((enrollment) => (
                  <tr
                    key={enrollment._id}
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="py-4">
                      {enrollment.studentId?.userId?.name}
                    </td>
                    <td className="py-4 text-gray-600">
                      {enrollment.studentId?.studentId}
                    </td>
                    <td className="py-4 text-gray-600">
                      {enrollment.studentId?.department?.departmentName}
                    </td>
                    <td className="py-4 text-gray-600">
                      {enrollment.studentId?.program}
                    </td>

                    {/* Course badge */}
                    <td className="py-4">
                      <span className="px-3 py-1 text-sm rounded-full bg-indigo-100 text-indigo-600 font-medium">
                        {enrollment.offeringId?.courseCode}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-4">
                      <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600 font-medium flex items-center gap-2 w-fit">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {enrollment.status}
                      </span>
                    </td>

                    <td className="py-4 text-gray-600">
                      {new Date(
                        enrollment.enrollmentDate
                      ).toLocaleDateString()}
                    </td>
                    <td className=" p-2">
                      {enrollment.status !== "dropped" && (
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleDrop(enrollment._id)}
                        >
                          Drop
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <p className="text-center py-6 text-gray-500">Loading...</p>
            )}

            {error && (
              <p className="text-center py-6 text-red-500">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunningEnrollments;