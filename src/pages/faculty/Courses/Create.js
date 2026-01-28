import React, { useEffect, useState } from "react";
import axios from "axios";
import Landing from "../Landing";
import { useAuth } from "../../../AuthContext";

function Create() {
  const { email } = useAuth();

  const [formData, setFormData] = useState({
    coursecode: "",
    coursename: "",
    department: "",
    ltpsc: "",
  });

  const [preq, setPreq] = useState("");
  const [message, setMessage] = useState("");
  const [departments, setDepartments] = useState([]);

  // 🔹 Fetch departments (same logic)
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/admin/departments"
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreq = (e) => {
    setPreq(e.target.value);
  };

  // 🔹 Submit form (same logic)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const prerequisites = preq.split(/[\s,]+/).filter(Boolean);
    const updatedFormData = { ...formData, prerequisites };

    try {
      await axios.post(
        `http://localhost:8000/faculty/createcourse/${email}`,
        updatedFormData
      );

      setMessage("Course added successfully!");
      setFormData({
        coursecode: "",
        coursename: "",
        department: "",
        ltpsc: "",
      });
      setPreq("");
    } catch (error) {
      console.error("Error adding course:", error);
      setMessage("Error adding course");
    }
  };

  return (
    <>
      <Landing />
    <main className="pt-10"> 
      <div className="max-w-4xl mx-auto mt-16 px-6">
        {/* Header */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Course
          </h1>
          <p className="text-gray-500 mt-1">
            Add a new course with all required details
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Code
              </label>
              <input
                type="text"
                name="coursecode"
                value={formData.coursecode}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="CS101"
                required
              />
            </div>

            {/* Course Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Course Name
              </label>
              <input
                type="text"
                name="coursename"
                value={formData.coursename}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Introduction to Programming"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* LTPSC */}
            <div>
              <label className="block text-sm font-medium mb-1">
                L-T-P-S-C
              </label>
              <input
                type="text"
                name="ltpsc"
                value={formData.ltpsc}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="3-1-0-0-4"
                required
              />
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Prerequisites (comma separated)
            </label>
            <input
              type="text"
              value={preq}
              onChange={handlePreq}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="CS101, MA101"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Course
            </button>
          </div>
        </form>

        {/* Success / Error Message */}
        {message && (
          <div className="mt-6 flex items-center justify-between bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded"
            >
              OK
            </button>
          </div>
        )}
      </div>
      </main>
    </>
  );
}

export default Create;
