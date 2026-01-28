import React, { useEffect, useState } from "react";
import axios from "axios";
import Landing from "../Landing";
import { useAuth } from "../../../AuthContext";

function Available() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { email } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/faculty/availablecourse/${email}`
        );
        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Landing />
      <main className="pt-10">  

      <div style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 1rem" }}>
        <div style={{ borderBottom: "2px solid #e5e7eb", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "600" }}>
            Courses Available for Offerings
          </h1>
        </div>

        {loading ? (
          <p style={{ fontSize: "1rem", color: "#6b7280" }}>Loading courses...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {courses.map((course) => (
              <div
                key={course._id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <p style={{ fontSize: "0.9rem", color: "#2563eb", fontWeight: "600" }}>
                  {course.departmentName?.departmentName || "N/A"}
                </p>

                <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginTop: "0.5rem" }}>
                  {course.courseCode}
                </h2>

                <p style={{ color: "#374151", marginTop: "0.25rem" }}>
                  {course.courseName}
                </p>

                <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.5rem" }}>
                  L-T-P-S-C: {course.ltpsc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>
    </div>
  );
}

export default Available;
