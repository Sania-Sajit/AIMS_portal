import React from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    function HandleLogout() {
        logout(); // Perform logout
        navigate('/'); // Redirect to login page
    }
    return (
        <nav className="bg-gray-800 p-4 text-white">
            <div className="flex items-center">
                <div className="space-x-4">
                <Link
                        to="/student/enroll"
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                        Enroll for Courses
                    </Link>
                    <Link
                        to="/student/enrollmentspending"
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                        Pending Enrollments
                    </Link>
                    <Link
                        to="/student/enrollmentsrunning"
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                        Running Enrollments
                    </Link>
                    
                </div>
                <button className="logout-button ml-14 " onClick={HandleLogout}>
                                                        <FaSignOutAlt size={20} />
                </button>
            </div>
            
        </nav>
    );
};

export default Navbar;
