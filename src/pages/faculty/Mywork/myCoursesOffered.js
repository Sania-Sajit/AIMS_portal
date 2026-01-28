import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Landing from "../Landing";
import { useAuth } from "../../../AuthContext";

function MyCoursesOffered() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const { email } = useAuth();

  const handleViewStudents = (id) => {
    navigate(`/enrolledstudents/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/faculty/offeredcourses/${email}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching offered courses:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Landing />

      <div className="mt-[4rem] flex justify-center">
        <div className="w-full max-w-6xl">

          {/* Header */}
          <div className="mb-6 border-b pb-2">
            <h1 className="text-xl font-semibold text-blue-700">
              My Courses Offered
            </h1>
            <p className="text-sm text-gray-600">
              View your offered courses and enrolled students
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border rounded-lg bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Academic Session</th>
                  <th className="px-4 py-3">Course Code</th>
                  <th className="px-4 py-3">Eligible Batches</th>
                  <th className="px-4 py-3">Max Seats</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {data.map((d, index) => (
                  <tr
                    key={d._id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-3">
                      {d.sessionId?.academicYear} {d.sessionId?.phase}
                    </td>

                    <td className="px-4 py-3">
                      {d.courseCode}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {d.eligibleBatches?.map((batch, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-200 rounded text-xs"
                          >
                            {batch}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">{d.maxSeats}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          d.status === "approved"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {d.status === "approved"
                          ? "Approved by Admin"
                          : "Pending Admin Approval"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {d.status === "approved" && (
                        <button
                          onClick={() => handleViewStudents(d._id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Enrolled Students
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-4 text-sm text-gray-600">
            Total courses: {data.length}
          </div>

        </div>
      </div>
    </div>
  );
}

export default MyCoursesOffered;
