import React, { useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";

import Landing from "../Landing";
import { useAuth } from "../../../AuthContext";

function CoursesOffered() {
  const { email } = useAuth();

  const [formData, setFormData] = useState({
    academicyear: "",
    phase: "",
  });

  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:8000/faculty/allofferedcourses/${email}`,
        formData
      );
      setData(response.data);
      setShow(true);
    } catch (error) {
      console.error("Error fetching offered courses:", error);
    } finally {
      setLoading(false);
      setFormData({ academicyear: "", phase: "" });
    }
  };

  return (
    <div>
      <Landing />

      <div className="ml-[6rem] mt-[4rem] w-[70rem]">
        {/* Header */}
        <div className="mb-6 border-b pb-2">
          <h1 className="text-xl font-semibold">Courses Offered</h1>
          <p className="text-sm text-gray-500">
            View all courses offered for a specific academic session
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex gap-6 items-end mb-8"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm">Academic Year</label>
            <input
              type="text"
              name="academicyear"
              value={formData.academicyear}
              onChange={handleChange}
              className="border px-2 py-1 w-72"
              placeholder="e.g. 2025"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm">Phase</label>
            <input
              type="text"
              name="phase"
              value={formData.phase}
              onChange={handleChange}
              className="border px-2 py-1 w-48"
              placeholder="e.g. I"
              required
            />
          </div>

         <button
  type="submit"
  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md
             hover:bg-blue-700 transition border border-blue-700"
  disabled={loading}
>
  <Search size={16} />
  {loading ? "Loading..." : "Search"}
</button>

        </form>

        {/* Table */}
        {show && (
          <table className="w-full border border-gray-300 border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Academic Session</th>
                <th className="border px-2 py-1">Course Code</th>
                <th className="border px-2 py-1">Faculty</th>
                <th className="border px-2 py-1">Eligible Batches</th>
                <th className="border px-2 py-1">Max Seats</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d, index) => (
                <tr
                  key={d._id}
                  className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
                >
                  <td className="border px-2 py-1">
                    {d.sessionId?.academicYear} {d.sessionId?.phase}
                  </td>
                  <td className="border px-2 py-1">{d.courseCode}</td>
                  <td className="border px-2 py-1">
                    {d.facultyId?.userId?.name || "N/A"}
                  </td>
                  <td className="border px-2 py-1">
                    {d.eligibleBatches?.map((b, i) => (
                      <span key={i} className="mr-2">{b}</span>
                    ))}
                  </td>
                  <td className="border px-2 py-1">{d.maxSeats}</td>
                  <td className="border px-2 py-1 font-semibold">Offered</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!show && (
          <div className="text-center text-gray-400 mt-16">
            <Search size={40} className="mx-auto mb-2 opacity-40" />
            <p>Enter academic year and phase to view offered courses</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesOffered;
