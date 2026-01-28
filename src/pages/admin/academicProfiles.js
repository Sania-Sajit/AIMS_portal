import { useState, useEffect } from "react";
import Header from "./admin";
import { Users, UserPlus, GraduationCap, Search, Mail, Edit, Trash2 } from "lucide-react";
import { SiNamecheap } from "react-icons/si";

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;

const AcademicProfiles = () => {
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
    fetchFaculty();
    fetchStudents();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${ADMIN_URL}/users`);
    setUsers(await res.json());
  };

 const getDepartmentName = (dept) => {
  if (!dept) return "N/A";

  // populated object
  if (typeof dept === "object") {
    return dept.departmentName || "N/A";
  }

  // fallback: ID lookup
  return departments.find((d) => d._id === dept)?.departmentName || "N/A";
};


  const fetchDepartments = async () => {
  const res = await fetch(`${ADMIN_URL}/departments`);
  const data = await res.json();
  setDepartments(data); // store full objects
};


  const fetchFaculty = async () => {
    const res = await fetch(`${ADMIN_URL}/faculty`);
    setFaculty(await res.json());
  };

  const fetchStudents = async () => {
    const res = await fetch(`${ADMIN_URL}/students`);
    setStudents(await res.json());
  };

  const getUser = (id) => users.find((u) => u._id === id) || {};

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const userRes = await fetch(`${ADMIN_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        role: activeTab === "students" ? "student" : "faculty",
      }),
    });

    const user = await userRes.json();

    const endpoint = activeTab === "students"
      ? `${ADMIN_URL}/students`
      : `${ADMIN_URL}/faculty`;

    const body = activeTab === "students"
      ? {
          userId: user.user.id,
          studentId: formData.studentId,
          program: formData.program,
          enrollmentYear: formData.enrollmentYear,
          department: formData.department,
        }
      : {
          userId: user.user.id,
          designation: formData.designation,
          joiningYear: formData.joiningYear,
          department: formData.department,
        };

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    fetchUsers();
    activeTab === "students" ? fetchStudents() : fetchFaculty();
    setShowAddDialog(false);
    setFormData({});
  };

  const handleEditClick = (item, type) => {
    setEditingId(item._id);
    setEditingType(type);
    setFormData(item);
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingType === "student" 
        ? `${ADMIN_URL}/students/${editingId}`
        : `${ADMIN_URL}/faculty/${editingId}`;

      const body = editingType === "student"
        ? {
            studentId: formData.studentId,
            program: formData.program,
            enrollmentYear: formData.enrollmentYear,
            department: formData.department,
          }
        : {
            designation: formData.designation,
            joiningYear: parseInt(formData.joiningYear),
            department: formData.department,
          };

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to update');
      }

      activeTab === "students" ? fetchStudents() : fetchFaculty();
      setShowEditDialog(false);
      setFormData({});
      setEditingId(null);
      setEditingType(null);
      alert(`${editingType === "student" ? "Student" : "Faculty"} updated successfully!`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const endpoint = type === "student" 
          ? `${ADMIN_URL}/students/${id}`
          : `${ADMIN_URL}/faculty/${id}`;

        const res = await fetch(endpoint, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error('Failed to delete');
        }

        type === "student" ? fetchStudents() : fetchFaculty();
        alert(`${type === "student" ? "Student" : "Faculty"} deleted successfully!`);
      } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const filteredStudents = students.filter(
    (s) => {
      const user = getUser(s.userId);
      return (
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  );

  const filteredFaculty = faculty.filter((f) => {
  const user = f.userId;

  if (!user) return false; // ⛑ safety check

  const query = searchQuery.toLowerCase();

  return (
    user.name?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query)
  );
});


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 px-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academic Profiles</h1>
              <p className="text-gray-600 mt-1">
                Manage students and faculty members
              </p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add {activeTab === "students" ? "Student" : "Faculty"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Faculty</p>
                  <p className="text-2xl font-bold text-gray-900">{faculty.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("students")}
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === "students"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Students
              </button>
              <button
                onClick={() => setActiveTab("faculty")}
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === "faculty"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Faculty
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {activeTab === "students" ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === "students" ? filteredStudents : filteredFaculty).map((item) => {
                    const user = item.userId || {};


                    return (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              activeTab === "students"
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : "bg-gradient-to-br from-green-500 to-emerald-600"
                            }`}>
                              {user.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || "N/A"}</p>
                              {activeTab === "students" && (
                                <p className="text-sm text-gray-500">{item.studentId}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {user.email || "N/A"}
                          </div>
                        </td>
                        {activeTab === "students" ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.program}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {getDepartmentName(item.department)}

                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.enrollmentYear}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditClick(item, "student")}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id, "student")}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.designation}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {getDepartmentName(item.department)}

                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.joiningYear}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditClick(item, "faculty")}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id, "faculty")}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(activeTab === "students" ? filteredStudents : filteredFaculty).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No {activeTab} found
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Add New {activeTab === "students" ? "Student" : "Faculty"}
              </h3>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  placeholder="Enter full name"
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select name="department" onChange={handleInputChange} required                  
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
>
  <option value="">Select department</option>
  {departments.map((dept) => (
    <option key={dept._id} value={dept._id}>
      {dept.departmentName}
    </option>
  ))}
</select>

                
              </div>
              {activeTab === "students" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      name="studentId"
                      placeholder="Enter student ID"
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      name="program"
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select program</option>
                      <option>BTech</option>
                      <option>BSc</option>
                      <option>MSc</option>
                      <option>MTech</option>
                      <option>PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year</label>
                    <input
                      name="enrollmentYear"
                      placeholder="Enter enrollment year"
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <select
                      name="designation"
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select designation</option>
                      <option>Professor</option>
                      <option>Associate Professor</option>
                      <option>Assistant Professor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Year</label>
                    <input
                      name="joiningYear"
                      placeholder="Enter joining year"
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDialog(false);
                    setFormData({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  Add {activeTab === "students" ? "Student" : "Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Edit {editingType === "student" ? "Student" : "Faculty"}
              </h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editingType === "student" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                    <input
                      name="studentId"
                      placeholder="Enter student ID"
                      value={formData.studentId || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      name="program"
                      value={formData.program || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select program</option>
                      <option>BTech</option>
                      <option>BSc</option>
                      <option>MSc</option>
                      <option>MTech</option>
                      <option>PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                   <select
  name="department"
  value={formData.department?._id || formData.department || ""}
  onChange={handleInputChange}
  required
  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
>
  <option value="">Select department</option>
  {departments.map((dept) => (
    <option key={dept._id} value={dept._id}>
      {dept.departmentName}
    </option>
  ))}
</select>


                    
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year</label>
                    <input
                      name="enrollmentYear"
                      placeholder="Enter enrollment year"
                      value={formData.enrollmentYear || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <select
                      name="designation"
                      value={formData.designation || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select designation</option>
                      <option>Professor</option>
                      <option>Associate Professor</option>
                      <option>Assistant Professor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Joining Year</label>
                    <input
                      name="joiningYear"
                      placeholder="Enter joining year"
                      value={formData.joiningYear || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      name="department"
                      value={formData.department?._id || formData.department || ""}

                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
  <option key={dept._id} value={dept._id}>
    {dept.departmentName}
  </option>
))}

                    </select>
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDialog(false);
                    setFormData({});
                    setEditingId(null);
                    setEditingType(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicProfiles;