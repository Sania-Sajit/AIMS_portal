import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios'
import Landing from '../Landing'

import {useAuth} from '../../../AuthContext'

import { useParams, useNavigate } from 'react-router-dom';

function Enrolledstudents(){
    
    const { id } = useParams();
    const [data, setData] = useState([]);
    const { token, role, email} = useAuth();
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/faculty/enrolledstudents/${id}`);
            setData(response.data);
        } catch (err) {
            console.error("Failed to fetch enrolled students", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);
    
    return (
  <div>
    <Landing />
    
    <button onClick={() => navigate(-1)} className="mt-6 mb-4 ml-4 px-3 py-1 border rounded hover:bg-gray-100">&larr; Back to Courses</button>

    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Offered Courses Detail</h1>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Academic Session
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Student Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Enrollment Year
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                Course Code
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                  No students enrolled yet.
                </td>
              </tr>
            ) : (
              data.map((d, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-2">
                    {d.offeringId.sessionId.academicYear}{" "}
                    {d.offeringId.sessionId.phase}
                  </td>
                  <td className="px-4 py-2">
                    {d.studentId.userId.name}
                  </td>
                  <td className="px-4 py-2">
                    {d.studentId.enrollmentYear}
                  </td>
                  <td className="px-4 py-2">
                    {d.offeringId.courseCode}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-gray-500">
        Total enrolled: {data.length} students
      </p>
    </div>
  </div>
);
}
    
export default Enrolledstudents;
