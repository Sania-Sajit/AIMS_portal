import React from "react";
import Landing from "../Landing";

function UploadGrades() {
  return (
    <div>
      <Landing />
      <main className="pt-10"> 

      <div className="mt-[4rem] justify-center max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6 border-b pb-2">
          <h1 className="text-xl font-semibold text-blue-700">
            Upload Grades
          </h1>
          <p className="text-sm text-gray-600">
            Upload student grades for your courses
          </p>
        </div>

        {/* Upload Card */}
        <div className="border rounded-lg p-8 bg-white">
          <div className="text-center">
            {/* Icon replacement */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-2xl">⬆</span>
            </div>

            <h3 className="text-lg font-semibold mb-2">
              Upload Grade Sheet
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Upload your Excel or CSV file containing student grades
            </p>

            {/* File Upload */}
            <label className="block border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer hover:bg-blue-50">
              <input type="file" className="hidden" />
              <p className="text-sm text-blue-600 font-medium">
                Click to upload file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .xlsx, .csv
              </p>
            </label>

            {/* Info Box */}
            <div className="mt-6 border-l-4 border-blue-500 bg-blue-50 p-4 text-left">
              <p className="text-sm font-semibold text-blue-700 mb-1">
                File Format Guidelines
              </p>
              <p className="text-sm text-gray-700">
                The file should include columns for <b>Student ID</b>,{" "}
                <b>Student Name</b>, and <b>Grade</b>.  
                Ensure the course code is correct.
              </p>
            </div>

            {/* Upload Button */}
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Upload Grades
              </button>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
    
  );
}

export default UploadGrades;
