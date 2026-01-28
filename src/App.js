import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; // Import the OAuth provider
import Login from "./pages/login";
import LoginOptions from "./pages/loginOptions";
import AdminLogin from "./pages/admin/admin";
import Courses from "./pages/admin/courses";
import Departments from "./pages/admin/departments";
import Offerings from "./pages/admin/offerings";
import AcademicProfiles from "./pages/admin/academicProfiles";
import { AuthProvider} from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Landing from '../src/pages/faculty/Landing'
import Home from '../src/pages/faculty/Home';
import Help from '../src/pages/faculty/Help'
import Coursesoffered from '../src/pages/faculty/Courses/coursesOffered'
import Create from '../src/pages/faculty/Courses/Create'
import Offercourse from '../src/pages/faculty/Courses/offerCourse';
import Uploadgrade from '../src/pages/faculty/Courses/uploadGrades';
import Available from '../src/pages/faculty/Courses/Available';
import Sessions from './pages/admin/sessions';
import Actionpending from '../src/pages/faculty/Mywork/actionPending'
import Mycoursesoffered from '../src/pages/faculty/Mywork/myCoursesOffered';
import Mycreatedcourses from '../src/pages/faculty/Mywork/myCreatedCourses';
import Enrolledstudents from '../src/pages/faculty/Mywork/enrolledStudents'


import PendingEnrollments from "../src/pages/student/pending";
import RunningEnrollments from '../src/pages/student/running';
import Navbar from '../src/pages/student/navbar';
import EligibleCourses from '../src/pages/student/enroll'

function App() {
  return (
    <GoogleOAuthProvider clientId="356670906449-op3cr5hkdf4j3ppil0l7bhsbjvanecfg.apps.googleusercontent.com">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />
      
            <Route path="/login-options" element={<LoginOptions />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLogin />
                </ProtectedRoute>
              }
            />
          
            <Route
              path="admin/courses"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Courses/>
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/offerings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Offerings/>
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/departments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/academic-profiles"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AcademicProfiles />
                </ProtectedRoute>
              }
            />
           <Route 
  path="/admin/sessions" 
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Sessions />
    </ProtectedRoute>
  } 
/>
            <Route path="/landing" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Landing />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/home" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Home />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/help" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Help />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/coursesoffered" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Coursesoffered />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/create" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Create />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/offercourse" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Offercourse />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/uploadgrade" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Uploadgrade />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/available" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Available />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/actionpending" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Actionpending />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/mycoursesoffered" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Mycoursesoffered />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/mycreatedcourses" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Mycreatedcourses />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="/enrolledstudents/:id" 
                      element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                          <Enrolledstudents />
                        </ProtectedRoute>
                      }
                    />

            
                    <Route path='/student/enrollmentspending' 
                      element={
                        <ProtectedRoute allowedRoles={["student"]}>
                          <PendingEnrollments />
                        </ProtectedRoute>
                      }
                    />

                    <Route path='/student/enrollmentsrunning' 
                      element={
                        <ProtectedRoute allowedRoles={["student"]}>
                          <RunningEnrollments />
                        </ProtectedRoute>
                      }
                    />

                    <Route path='/student/home' 
                      element={
                        <ProtectedRoute allowedRoles={["student"]}>
                          <Navbar />
                        </ProtectedRoute>
                      }
                    />

                    <Route path='/student/enroll' 
                      element={
                        <ProtectedRoute allowedRoles={["student"]}>
                          <EligibleCourses />
                        </ProtectedRoute>
                      }
                    />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;