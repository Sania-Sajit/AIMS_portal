import React, { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./Landing.css";

function Landing() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(null);

  function HandleLogout() {
    logout();
    navigate("/");
  }

  function toggleMenu(menu) {
    setActiveMenu(activeMenu === menu ? null : menu);
  }

  return (
    <div className="navbar">
      {/* LEFT SIDE */}
      <div className="navbar-left">
        <div className="admin-link" onClick={() => navigate("/home")}>
          AIMS
        </div>

        {/* COURSES */}
        <div className="admin-dropdown">
          <span onClick={() => toggleMenu("courses")}>
            Courses ▾
          </span>
          {activeMenu === "courses" && (
            <div className="dropdown-menu">
              <div onClick={() => navigate("/coursesoffered")}>
                Courses Offered For Enrolment
              </div>
              <div onClick={() => navigate("/offercourse")}>
                Offer a Course For Enrolment
              </div>
              <div onClick={() => navigate("/available")}>
                Courses Available For Offering
              </div>
              <div onClick={() => navigate("/create")}>
                Create New Course
              </div>
              <div onClick={() => navigate("/uploadgrade")}>
                Upload Grades
              </div>
            </div>
          )}
        </div>

        {/* MY WORK */}
        <div className="admin-dropdown">
          <span onClick={() => toggleMenu("mywork")}>
            My Work ▾
          </span>
          {activeMenu === "mywork" && (
            <div className="dropdown-menu">
              <div onClick={() => navigate("/mycoursesoffered")}>
                Courses Offered
              </div>
              <div onClick={() => navigate("/mycreatedcourses")}>
                Courses Created
              </div>
              <div onClick={() => navigate("/actionpending")}>
                Action Pending
              </div>
            </div>
          )}
        </div>

        {/* HELP */}
        <div className="admin-link" onClick={() => navigate("/help")}>
          Help
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        <button className="logout-button" onClick={HandleLogout}>
          <FaSignOutAlt size={18} />
        </button>
      </div>
    </div>
  );
}

export default Landing;