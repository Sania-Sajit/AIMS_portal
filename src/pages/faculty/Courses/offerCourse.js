import React, { useState } from "react";
import axios from "axios";
import Landing from "../Landing";
import { useAuth } from "../../../AuthContext";

function Offercourse() {
  const { email } = useAuth();

  const [formData, setFormData] = useState({
    academicyear: "",
    phase: "",
    coursecode: "",
  });

  const [batches, setBatches] = useState("");
  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBatch = (e) => {
    setBatches(e.target.value);
  };

  // Submit (LOGIC UNCHANGED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const numberArray = batches
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    const updatedFormData = { ...formData, batch: numberArray };

    try {
      await axios.post(
        `http://localhost:8000/faculty/offercourse/${email}`,
        updatedFormData
      );

      setMessage("Course offered successfully!");
      setFormData({ academicyear: "", phase: "", coursecode: "" });
      setBatches("");
    } catch (error) {
      console.error("Error offering course:", error);
      setMessage("Error offering course");
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
            Offer a Course
          </h1>
          <p className="text-gray-500 mt-1">
            Make a course available for student enrollment
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="academicyear"
                value={formData.academicyear}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2024-2025"
                required
              />
            </div>

            {/* Phase */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phase
              </label>
              <input
                type="text"
                name="phase"
                value={formData.phase}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="I/II"
                required
              />
            </div>

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

            {/* Eligible Batches */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Eligible Batches
              </label>
              <input
                type="text"
                value={batches}
                onChange={handleBatch}
                className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="2021, 2022, 2023"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Offer Course
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

export default Offercourse;
