import axios from 'axios';
import React, { useEffect, useState } from 'react';

const STUDENT_URL = process.env.REACT_APP_STUDENT_URL; // Ensure this is properly set in your .env file
const email = "sahusneha031@gmail.com"; // Hardcoded email for now

function EligibleCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [errorMessage, setErrorMessage] = useState(''); // State to store error message

  useEffect(() => {
    async function fetchCourses() {
      try {
        console.log("Fetching eligible courses..."); // Debug log
        const response = await axios.get(`${STUDENT_URL}/eligible-courses`, {
          params: { email },
        });

        console.log("Response data:", response.data); // Debug log
        if (response.data && response.data.courses) {
          setCourses(response.data.courses); // Update courses state
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching eligible courses:", error);
      }
    }

    if (STUDENT_URL) {
      fetchCourses();
    } else {
      console.error("STUDENT_URL is not defined");
    }
  }, []); // Dependencies: Runs only once on component mount

  // Function to handle enrollment
  const handleEnroll = async (courseId) => {
    try {
      console.log(`Enrolling in course: ${courseId}`);
      const response = await axios.post(`${STUDENT_URL}/create-enrollment`, {
        email,
        offeringId: courseId,
      });

      if (response.data && response.data.message === "Enrollment created successfully") {
        setEnrollmentStatus((prevStatus) => ({
          ...prevStatus,
          [courseId]: 'enrolled',
        }));
        alert('Enrollment successful');
        setErrorMessage(''); // Clear any previous error message
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Handle already enrolled case
        setErrorMessage('You are already enrolled in this course.');
      } else {
        console.error('Error enrolling in course:', error);
        alert('Error enrolling in course');
        setErrorMessage('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Eligible Courses</h1>

      {/* Show error message if any */}
      {errorMessage && (
        <div className="mb-4 p-2 bg-red-300 text-red-800 rounded border border-red-500">
          {errorMessage}
        </div>
      )}

      <ul className="space-y-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <li key={course._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg shadow-sm">
              <div>
                <div className="text-lg font-semibold">{course.courseCode}</div>
                <div className="text-gray-600">{course.courseName}</div>
              </div>
              <button
                onClick={() => handleEnroll(course._id)}
                disabled={enrollmentStatus[course._id] === 'enrolled'}
                className={`ml-4 px-4 py-2 rounded text-white ${enrollmentStatus[course._id] === 'enrolled' ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
              >z
                {enrollmentStatus[course._id] === 'enrolled' ? 'Enrolled' : 'Enroll'}
              </button>
            </li>
          ))
        ) : (
          <p>No eligible courses found.</p>
        )}
      </ul>
    </div>
  );
}

export default EligibleCourses;
