import React, { useEffect, useState } from 'react';
import axios from 'axios'
import Landing from '../Landing'

import {useAuth} from '../../../AuthContext'
function ActionPending(){
    
    const [isadvisor, setIsadvisor] = useState(false);
    const [create , setCreate] = useState(true)
    const [main, setMain] = useState(false)
    const [enrollment, setEnrollment] = useState(false)
    const [advisor, setAdvisor]  = useState(false);
    const [data, setData] = useState([]);
    const { token, role, email} = useAuth();
    
    
    // set this to true if your logged in faculty is an advisor
    //const isadvisor = false;
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);
    const [rows , setRows] = useState([]);
    const [show , setShow] = useState(false)
    const [s , setS] = useState(false)
    const [selectAll, setSelectAll] = useState(false);
const [selectAllAdvisor, setSelectAllAdvisor] = useState(false);

    



    const handleSelectAll = (checked) => {
  setSelectAll(checked);
  setSelectedRows(checked ? data.map(d => d._id) : []);
};

const handleSelectAllAdvisor = (checked) => {
  setSelectAllAdvisor(checked);
  setRows(checked ? data.map(d => d._id) : []);
};

useEffect(() => {
  setSelectAll(data.length > 0 && selectedRows.length === data.length);
}, [selectedRows, data]);

useEffect(() => {
  setSelectAllAdvisor(data.length > 0 && rows.length === data.length);
}, [rows, data]);


    
    const checkAdvisor = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/faculty/facultyadvisor/${email}`);
            console.log('Advisor check response:', response.data);
            setIsadvisor(response.data); // Update the state with true/false
        } catch (err) {
            console.error('Error fetching advisor:', err);
        } finally {
            setLoading(false); // Set loading to false after completion
        }
    };




    useEffect(() => {
        if (email) {
            checkAdvisor(); // Call checkAdvisor when email is available
        }
    }, [email]);

    useEffect( () => {
        handleCreate();
    }, [])

    async function handleCreate(){
        setCreate(true)
        setMain(false)
        setEnrollment(false)
        setAdvisor(false)
        try {
            const response = await axios.get(`http://localhost:8000/faculty/createdcourseneedapproval/${email}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data for create:', error);
        }
    }

    async function handleMain(){
        setAdvisor(false)
        setEnrollment(false)
        setMain(true)
        setCreate(false)
        try {
            const response = await axios.get(`http://localhost:8000/faculty/courseneedadminapproval/${email}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data for main:', error);
        }
    }
        
    async function handleEnrollment(){
        setMain(false)
        setEnrollment(true)
        setCreate(false)
        setAdvisor(false)
        try {
            const response = await axios.get(`http://localhost:8000/faculty/studentneedapproval/${email}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data for enrollment:', error);
        }
    }

    async function handleAdvisor(){
        setAdvisor(true)
        setMain(false)
        setCreate(false)
        setEnrollment(false)
        try {
            const response = await axios.get(`http://localhost:8000/faculty/studentneedadvisorapproval/${email}`);
            console.log('Advisor enrollments:', response.data);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data for enrollment:', error);
        }
    }

    const handleCheckboxChange = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id)); // Unselect row
        } else {
            setSelectedRows([...selectedRows, id]); // Select row
        }
    };
    
    const handleCheckbox = (id) => {
        if (rows.includes(id)) {
            setRows(rows.filter((rowId) => rowId !== id)); // Unselect row
        } else {
            setRows([...rows, id]); // Select row
        }
    };

    function handleClick(){
        setShow(!show)
    }

    function handleClickadvisor(){
        setS(!s)
    }

    const handleAction = async (action) => {
        try {
            // Send selected row IDs and action to the backend
            await axios.post(`http://localhost:8000/faculty/changecoursestatus/${email}`, {
                ids: selectedRows,
                action: action,
            });
            setShow(false)
            alert(`${action} action applied successfully`);
            setSelectedRows([]);
            handleEnrollment();
        } catch (error) {
            console.error(`Error applying ${action} action:`, error);
        }
    };

    const handleActionadvisor = async (action) => {
        try {
            // Send selected row IDs and action to the backend
            await axios.post(`http://localhost:8000/faculty//changecoursestatusadvisor/${email}`, {
                ids: rows,
                action: action,
            });
            setS(false)
            alert(`${action} action applied successfully`);
            setRows([]);
            handleAdvisor();
        } catch (error) {
            console.error(`Error applying ${action} action:`, error);
        }
    };
    

    if (loading) {
        return <div>Loading...</div>; // Show a loading screen while waiting for `checkAdvisor`
    }
    
    return (
  <div className='pt-4'>
    <Landing />

    <div className="mt-[4rem] ml-[6rem]">

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={handleCreate} className="px-3 py-1 border bg-blue-800/50">
          New Courses Created
        </button>
        <button onClick={handleMain} className="px-3 py-1 border bg-blue-800/50">
          Offered Courses
        </button>
        <button onClick={handleEnrollment} className="px-3 py-1 border bg-blue-800/50">
          Enrollment
        </button>
        {isadvisor && (
          <button onClick={handleAdvisor} className="px-3 py-1 border bg-blue-800/50">
            Approve as Advisor
          </button>
        )}
      </div>

      {/* ---------------- CREATE ---------------- */}
      {create && (
        <div className='overflow-x-auto pr-20'>
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Department</th>
              <th>L-T-P-S-C</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-blue-800/20"}>
                <td className='text-center'>{d.courseCode}</td>
                <td className='text-center'>{d.courseName}</td>
                <td className='text-center'>{d.departmentName?.departmentName || "N/A"}</td>
                <td className='text-center'>{d.ltpsc}</td>
                <td className="font-semibold text-center">Needs Admin Approval</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {/* ---------------- MAIN ---------------- */}
      {main && (
        <div className='overflow-x-auto pr-20'>
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr>
              <th>Academic Session</th>
              <th>Course Code</th>
              <th>Eligible Batches</th>
              <th>Max Seats</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-blue-800/20"}>
                <td className='text-center'>
                  {d.sessionId?.academicYear} {d.sessionId?.phase}
                </td>
                <td className='text-center'>{d.courseCode}</td>
                <td className='text-center'>
                  {d.eligibleBatches?.map((b, idx) => (
                    <div key={idx}>{b}</div>
                  ))}
                </td>
                <td className='text-center'>{d.maxSeats}</td>
                <td className="font-semibold text-center">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* ---------------- ENROLLMENT ---------------- */}
      {enrollment && (
        <div className='overflow-x-auto pr-20'>
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr>
              <th>Academic Session</th>
              <th>Course Code</th>
              <th>Student Name</th>
              <th>Batch-year</th>
              <th>Department</th>
              <th>Status</th>
              <th>
                <div className="flex justify-end items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    Select All
                  </label>

                  <div className="relative">
                    <button
                      className="px-2 py-1 bg-orange-500 text-white rounded"
                      onClick={handleClick}
                    >
                      Action
                    </button>

                    {show && (
                      <div className="absolute right-0 mt-1 bg-white border shadow z-50">
                        <button
                          className="block px-3 py-1 hover:bg-gray-200 w-full text-left"
                          onClick={() => handleAction("Approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="block px-3 py-1 hover:bg-gray-200 w-full text-left"
                          onClick={() => handleAction("Reject")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-blue-800/20"}>
                <td className='text-center'>
                  {d.offeringId?.sessionId?.academicYear}{" "}
                  {d.offeringId?.sessionId?.phase}
                </td>
                <td className='text-center'>{d.offeringId?.courseCode}</td>
                <td className='text-center'>{d.studentId?.userId?.name}</td>
                <td className='text-center'>{d.studentId?.enrollmentYear}</td>
                <td className='text-center'>{d.studentId?.department?.departmentName}</td>
                <td className="font-semibold text-center">{d.status}</td>
                <td className='text-center'> 
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(d._id)}
                    onChange={() => handleCheckboxChange(d._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* ---------------- ADVISOR ---------------- */}
      {advisor && (
        <div className='overflow-x-auto pr-20'>
        <table className="table-auto border-collapse border w-full">
          <thead>
            <tr>
              <th>Academic Session</th>
              <th>Course Code</th>
              <th>Student Name</th>
              <th>Batch-year</th>
              <th>Department</th>
              <th>Status</th>
              <th>
                <div className="flex justify-end items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={selectAllAdvisor}
                      onChange={(e) =>
                        handleSelectAllAdvisor(e.target.checked)
                      }
                    />
                    Select All
                  </label>

                  <div className="relative">
                    <button
                      className="px-2 py-1 bg-orange-500 text-white rounded"
                      onClick={handleClickadvisor}
                    >
                      Action
                    </button>

                    {s && (
                      <div className="absolute right-0 mt-1 bg-white border shadow z-50">
                        <button
                          className="block px-3 py-1 hover:bg-gray-200 w-full text-left"
                          onClick={() => handleActionadvisor("Approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="block px-3 py-1 hover:bg-gray-200 w-full text-left"
                          onClick={() => handleActionadvisor("Reject")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className={i % 2 ? "bg-white" : "bg-blue-800/20"}>
                <td className='text-center'>
                  {d.offeringId?.sessionId?.academicYear}{" "}
                  {d.offeringId?.sessionId?.phase}
                </td>
                <td className='text-center'>{d.offeringId?.courseCode}</td>
                <td className='text-center'>{d.studentId?.userId?.name}</td>
                <td className='text-center'>{d.studentId?.enrollmentYear}</td>
                <td className='text-center'>{d.studentId?.department?.departmentName}</td>
                <td className="text-center font-semibold">{d.status}</td>
                <td className='text-center'>
                  <input
                    type="checkbox"
                    checked={rows.includes(d._id)}
                    onChange={() => handleCheckbox(d._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  </div>
);

};

export default ActionPending;
