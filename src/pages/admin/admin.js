import React, { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import "./admin.css";
import axios from "axios";
import { useEffect } from "react";

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;

function Home() {
    const [activeMenu, setActiveMenu] = useState(null); // Track active menu
    const navigate = useNavigate();
    const { logout } = useAuth(); // Get logout function from AuthContext
    const { token, role, email } = useAuth();
    const [allowEnroll, setAllowEnroll] = useState(true);
    const [allowDrop, setAllowDrop] = useState(true);

    useEffect(() => {
        const fetchControls = async () => {
            try {
                const res = await axios.get(`${ADMIN_URL}/controls`);
                setAllowEnroll(res.data.allowEnrollment);
                setAllowDrop(res.data.allowDrop);
            } catch (err) {
                console.error("Failed to load admin controls");
            }
        };

        fetchControls();
    }, []);

    console.log(role);
    console.log(email);
    function HandleLogout() {
        logout(); // Perform logout
        navigate('/'); // Redirect to login page
    }

    function handleMenuClick(menu) {
        setActiveMenu(activeMenu === menu ? null : menu); // Toggle menu state
    }
    const updateControls = async (data) => {
        try {
            await axios.put(`${ADMIN_URL}/controls`, data);
        } catch (err) {
            console.error("Failed to update admin controls");
        }
    };

    return (
        <div>
            <div className="navbar">
                <div className="navbar-left">
                    <div className="admin-dropdown">
                        <h4 onClick={() => handleMenuClick('academicInfo')}>
                            Academic Info ▾
                        </h4>
                        {activeMenu === 'academicInfo' && (
                            <div className="dropdown-menu">
                                <div onClick={() => navigate('/admin/academic-profiles')}>Academic Profiles</div>
                            </div>
                        )}
                    </div>

                    <div className="admin-dropdown">
                        <h4 onClick={() => handleMenuClick('courses')}>
                            Courses ▾
                        </h4>
                        {activeMenu === 'courses' && (
                            <div className="dropdown-menu">
                                <div onClick={() => navigate('/admin/courses')}>Courses</div>
                                <div onClick={() => navigate('/admin/offerings')}>Offerings</div>
                            </div>
                        )}
                    </div>

                    <div className="admin-dropdown">
                        <h4 onClick={() => navigate('/admin/departments')}>
                            Departments
                        </h4>
                    </div>

                    <div className="admin-dropdown">
                        <h4 onClick={() => handleMenuClick('sessions')}>
                            Sessions ▾
                        </h4>
                        {activeMenu === 'sessions' && (
                            <div className="dropdown-menu">
                                <div onClick={() => navigate('/admin/sessions')}>Manage Sessions</div>
                            </div>
                        )}
                    </div>
                    <div className="admin-dropdown">
                        <h4 onClick={() => handleMenuClick('enrollmentControl')}>
                            Enrollment Control ▾
                        </h4>

                        {activeMenu === 'enrollmentControl' && (
                            <div className="dropdown-menu">

                                <div className="control-item">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={allowEnroll}
                                            onChange={(e) => {
                                                setAllowEnroll(e.target.checked);
                                                updateControls({
                                                    allowEnrollment: e.target.checked,
                                                    allowDrop,
                                                });
                                            }}
                                        />
                                        Enable Enrollment
                                    </label>
                                </div>

                                <div className="control-item">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={allowDrop}
                                            onChange={(e) => {
                                                setAllowDrop(e.target.checked);
                                                updateControls({
                                                    allowEnrollment: allowEnroll,
                                                    allowDrop: e.target.checked,
                                                });
                                            }}
                                        />
                                        Enable Drop Course
                                    </label>
                                </div>

                            </div>
                        )}
                    </div>
                </div>


                <button className="logout-button" onClick={HandleLogout}>
                    <FaSignOutAlt size={20} />
                </button>
            </div>
        </div>
    );
}

export default Home;