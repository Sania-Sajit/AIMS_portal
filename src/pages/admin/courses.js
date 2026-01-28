import React, { useEffect, useState } from 'react';
import Header from './admin';
import axios from 'axios';
const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;
function Courses() {
  const [courses, setCourses] = useState([]); // All courses
  const [filteredCourses, setFilteredCourses] = useState([]); // Courses filtered by status
  const [filter, setFilter] = useState('approved'); // Current filter ('approved' or 'not approved')

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${ADMIN_URL}/courses`);

        console.log("🟢 RAW API RESPONSE:", response.data);

        setCourses(response.data);


        console.log("🟢 FILTERED approved COURSES:", response.data.filter(course => course.status === 'approved'));
        console.log("🟢 FILTERED not approved COURSES:", response.data.filter(course => course.status !== 'approved'))  ;
        setFilteredCourses(response.data.filter(course => course.status === 'approved'));
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilter(status);
    setFilteredCourses(courses.filter(course => (status === 'approved' ? course.status === 'approved' : course.status !== 'approved')));
  };

  // Handle course approval
  const handleApprove = async (courseId) => {
    try {
      await axios.put(`${ADMIN_URL}/approve-courses/${courseId}`, { status: 'approved' });

      // Update the course list locally after approval
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId ? { ...course, status: 'approved' } : course
        )
      );

      // Update the filtered list based on the current filter
      handleFilterChange(filter);

    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  return (
    <div>
      <Header />

      <div className="container mx-auto p-4">
        <div className="flex space-x-4 mb-6 mt-[4rem]">
          <button
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => handleFilterChange('approved')}
          >
            Approved Courses
          </button>
          <button
            className={`px-4 py-2 rounded ${filter === 'notapproved' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => handleFilterChange('notapproved')}
          >
            Not Approved Courses
          </button>
        </div>

        <div>
          {filteredCourses.length === 0 ? (
            <p className="text-gray-500">No courses to display.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Course Code</th>
                  <th className="border border-gray-300 px-4 py-2">Course Name</th>
                  <th className="border border-gray-300 px-4 py-2">Department</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  {filter === 'notapproved' && <th className="border border-gray-300 px-4 py-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(course => (
                  <tr key={course._id}>
                    <td className="border border-gray-300 px-4 py-2">{course.courseCode}</td>
                    <td className="border border-gray-300 px-4 py-2">{course.courseName}</td>
                    <td className="border border-gray-300 px-4 py-2">{course.departmentName?.departmentName || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">
  {course.status === 'approved' ? 'Approved' : 'Pending Admin Approval'}
</td>

                    {filter === 'notapproved' && (
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded"
                          onClick={() => handleApprove(course._id)}
                        >
                          Approve
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courses;