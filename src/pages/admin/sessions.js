import React, { useEffect, useState } from 'react';
import Header from './admin';
import axios from 'axios';

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL;



function Sessions() {
  const [academicYear, setAcademicYear] = useState('');
  const [phase, setPhase] = useState('');
  const [sessions, setSessions] = useState([]);
  const [message, setMessage] = useState('');

  // Fetch existing sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get(`${ADMIN_URL}/session-list`); // We'll create /session-list in backend
        setSessions(res.data);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, []);

  // Handle session submission
  const handleAddSession = async (e) => {
    e.preventDefault();

    if (!academicYear || !phase) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post(`${ADMIN_URL}/sessions`, { academicYear, phase });
      setMessage(res.data.message || 'Session added successfully!');
      setSessions([...sessions, res.data.session]); // Add new session to list
      setAcademicYear('');
      setPhase('');
    } catch (error) {
      console.error('Error adding session:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error adding session');
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4 mt-[4rem]">
        <h2 className="text-2xl font-bold mb-4">Add New Session</h2>

        {message && <p className="text-red-500 mb-4">{message}</p>}

        <form onSubmit={handleAddSession} className="mb-6 space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Academic Year</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g., 2026"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Phase</label>
            <select
  value={phase}
  onChange={(e) => setPhase(e.target.value)}
  className="w-full p-2 border rounded"
>
  <option value="">Select Phase</option>
  <option value="I">I</option>
  <option value="II">II</option>
</select>

          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Session
          </button>
        </form>

        <h3 className="text-xl font-bold mb-2">Existing Sessions</h3>
        {sessions.length === 0 ? (
          <p className="text-gray-500">No sessions added yet.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Academic Year</th>
                <th className="border border-gray-300 px-4 py-2">Phase</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id}>
                  <td className="border border-gray-300 px-4 py-2 text-center">{session.academicYear}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{session.phase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Sessions;