import React, { useEffect, useState } from 'react';
import axios from 'axios'
import Landing from '../Landing'
import { FileText } from "lucide-react";

import {useAuth} from '../../../AuthContext'

function MyCreatedCourses(){

    const [data, setData] = useState([]);
    const { token, role, email} = useAuth();

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/faculty/createdcourses/${email}`);
            setData(response.data);
        } catch (err) {
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    return (
  <div className='pt-10'>
    <Landing />

    <div className="max-w-6xl mx-auto mt-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-0">My Created Courses</h1>
          <p className="text-muted-foreground text-sm">
            View courses you have created
            </p>
          </div>
        </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
            <tr>
              <th className="px-4 py-2">Course Code</th>
              <th className="px-4 py-2">Course Name</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">L-T-P-S-C</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-gray-400"
                >
                  No courses found.
                </td>
              </tr>
            ) : (
              data.map((d, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-2 font-medium">
                    {d.courseCode}
                  </td>
                  <td className="px-4 py-2">
                    {d.courseName}
                  </td>
                  <td className="px-4 py-2">
                    {d.departmentName?.departmentName || "N/A"}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm">
                    {d.ltpsc}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                        d.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {d.status === "approved"
                        ? "Approved by Admin"
                        : "Pending Approval"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Total courses created: {data.length}
      </div>
    </div>
  </div>
);
}

export default MyCreatedCourses;
