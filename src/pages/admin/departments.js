import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "./admin";
import { useAuth } from "../../AuthContext";

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [facultyAdvisor, setFacultyAdvisor] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { token } = useAuth();
  const dropdownRef = useRef(null);

  /* ---------------- FETCH DEPARTMENTS ---------------- */
  const fetchDepartments = async () => {
    const res = await axios.get(`${ADMIN_URL}/departments`);
    setDepartments(res.data);
  };

  /* ---------------- FETCH FACULTY ---------------- */
  const fetchFaculty = async () => {
    const res = await axios.get(`${ADMIN_URL}/faculty`);
    setFacultyList(res.data);
  };

  /* ---------------- ADD / UPDATE DEPARTMENT ---------------- */
  const saveDepartment = async () => {
    if (!newDepartmentName.trim()) {
      alert("Department name required");
      return;
    }

    const payload = {
      departmentName: newDepartmentName,
      facultyAdvisor: facultyAdvisor || undefined,
    };

    try {
      if (editDepartmentId) {
        // UPDATE
        await axios.put(
          `${ADMIN_URL}/departments/${editDepartmentId}`,
          payload
        );
      } else {
        // CREATE
        await axios.post(`${ADMIN_URL}/departments`, payload);
      }

      resetForm();
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  /* ---------------- EDIT HANDLER ---------------- */
  const handleEdit = (dept) => {
    setEditDepartmentId(dept._id);
    setNewDepartmentName(dept.departmentName);
    setFacultyAdvisor(dept.facultyAdvisor?._id || "");
    setSearchText(
  dept.facultyAdvisor
    ? `${dept.facultyAdvisor.userId?.name} (${dept.facultyAdvisor.department?.departmentName || "CSE"})`
    : ""
);

  };
   
  const handleDeleteDepartment = async (departmentId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this department?\nThis action cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    await axios.delete(
      `http://localhost:8000/admin/departments/${departmentId}`
    );

    // Remove deleted department from UI
    setDepartments((prev) =>
      prev.filter((dept) => dept._id !== departmentId)
    );

    alert("Department deleted successfully!");
  } catch (error) {
    console.error("Error deleting department:", error);

    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert("Failed to delete department");
    }
  }
};

  /* ---------------- RESET FORM ---------------- */
  const resetForm = () => {
    setNewDepartmentName("");
    setFacultyAdvisor("");
    setSearchText("");
    setEditDepartmentId(null);
  };

  /* ---------------- FILTER FACULTY ---------------- */
  const notAssignedOption = { _id: null, userId: { name: "Not Assigned" } };
  const facultyWithNotAssigned = [notAssignedOption, ...facultyList];
  
  const filteredFaculty = searchText.trim() === ""
    ? facultyWithNotAssigned
    : facultyWithNotAssigned.filter((fac) =>
        fac.userId?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase())
      );

  /* ---------------- HANDLE SELECT ---------------- */
  const handleSelectFaculty = (fac) => {
    setFacultyAdvisor(fac._id);
    if (fac._id === null) {
      setSearchText("Not Assigned");
    } else {
      setSearchText(`${fac.userId?.name} (${fac.department?.departmentName || "CSE"})`);
    }
    setDropdownOpen(false);
  };

  /* ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- FETCH DATA ON LOAD ---------------- */
  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  useEffect(() => {
  console.log("Faculty list:", facultyList);
}, [facultyList]);


  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="pt-10">
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Departments</h1>

        {/* ---------- DEPARTMENT LIST ---------- */}
        <ul className="bg-white shadow rounded-md p-4 mb-6">
          {departments.map((dept) => (
            <li
              key={dept._id}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <p className="font-semibold">{dept.departmentName}</p>
                <p className="text-sm text-gray-600">
                  Advisor: {dept.facultyAdvisor?.userId?.name || "Not Assigned"}
                </p>
              </div>
              <div className="flex gap-4">
  <button
    onClick={() => handleEdit(dept)}
    className="text-blue-500 hover:underline"
  >
    Edit
  </button>

  <button
    onClick={() => handleDeleteDepartment(dept._id)}
    className="text-red-500 hover:underline"
  >
    Delete
  </button>
</div>

            </li>
          ))}
        </ul>

        {/* ---------- ADD / EDIT FORM ---------- */}
        <div className="bg-white shadow rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editDepartmentId ? "Edit Department" : "Add Department"}
          </h2>

          <input
            type="text"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder="Department Name"
            className="w-full border px-4 py-2 rounded mb-4"
          />

          {/* ---------- SEARCHABLE DROPDOWN ---------- */}
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              placeholder="Select Faculty Advisor"
              value={searchText}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchText(e.target.value);
                setDropdownOpen(true);
              }}
              className="w-full border px-4 py-2 rounded mb-4 text-black"
            />

            {dropdownOpen && filteredFaculty.length > 0 && (
              <ul className="absolute z-50 w-full max-h-60 overflow-y-auto bg-white border rounded shadow-lg">
                {filteredFaculty.map((fac) => (
                  <li
                    key={fac._id || "not-assigned"}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleSelectFaculty(fac)}
                  >
                    {fac._id === null ? "Not Assigned" : `${fac.userId?.name} (${fac.department?.departmentName || "CSE"})`}
                  </li>
                ))}
              </ul>
            )}

            {dropdownOpen && filteredFaculty.length === 0 && (
              <div className="absolute z-50 w-full bg-white border rounded px-4 py-2 text-gray-500">
                No results found
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveDepartment}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              {editDepartmentId ? "Update" : "Add"}
            </button>

            {editDepartmentId && (
              <button
                onClick={resetForm}
                className="bg-gray-400 text-white px-6 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default DepartmentsPage;