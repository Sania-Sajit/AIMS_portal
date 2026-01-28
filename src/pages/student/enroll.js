import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import Navbar from "./navbar";

const STUDENT_URL = process.env.REACT_APP_STUDENT_URL;

function EligibleCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  const { email } = useAuth();

  useEffect(() => {
    async function fetchData() {
      try {
        const coursesResp = await axios.get(
          `${STUDENT_URL}/eligible-courses`,
          { params: { email } }
        );
        const eligibleCourses = coursesResp.data.courses || [];

        const runningResp = await axios.get(
          `${STUDENT_URL}/enrollmentsrunning/${email}`
        );
        const pendingResp = await axios.get(
          `${STUDENT_URL}/enrollmentspending/${email}`
        );

        const blockedOfferings = [
          ...(runningResp.data || []).map(e => e.offeringId._id),
          ...(pendingResp.data || []).map(e => e.offeringId._id),
        ];

        const statusObj = {};
        blockedOfferings.forEach(id => (statusObj[id] = "blocked"));

        setCourses(eligibleCourses);
        setEnrollmentStatus(statusObj);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (STUDENT_URL && email) fetchData();
  }, [email]);

  const handleEnroll = async (courseId) => {
    try {
      const response = await axios.post(
        `${STUDENT_URL}/create-enrollment`,
        { email, offeringId: courseId }
      );

      if (response.data?.message === "Enrollment created successfully") {
        setEnrollmentStatus(prev => ({
          ...prev,
          [courseId]: "blocked",
        }));
        setErrorMessage("");
        alert("Enrollment successful");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Server error. Please try again.");
      }
    }

  };

  const filteredCourses = courses.filter(c => {
    const code = c.courseCode?.toLowerCase() || "";
    const name = c.courseName?.toLowerCase() || "";
    const q = search.toLowerCase();

    return code.includes(q) || name.includes(q);
  });

  const blockedCount = Object.values(enrollmentStatus).filter(
    v => v === "blocked"
  ).length;

  return (
    <>
      <Navbar />

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-1">Eligible Courses</h1>
        <p className="text-gray-600 mb-6">
          Browse and enroll in available courses for this semester
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search courses by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500">Total Available</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500">Already Enrolled / Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {blockedCount}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500">Showing</p>
            <p className="text-2xl font-bold text-teal-600">
              {filteredCourses.length}
            </p>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => {
              const blocked = enrollmentStatus[course._id] === "blocked";

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow border-t-4 border-blue-600 p-5 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold mb-1">
                      {course.courseCode || "N/A"}
                    </h2>

                  </div>

                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={blocked}
                    className={`mt-5 py-2 rounded-lg font-semibold text-white ${blocked
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-teal-500 hover:bg-teal-600"
                      }`}
                  >
                    {blocked ? "Enrolled / Pending" : "Enroll Now"}
                  </button>
                </div>
              );
            })
          ) : (
            <p>No eligible courses found.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default EligibleCourses;