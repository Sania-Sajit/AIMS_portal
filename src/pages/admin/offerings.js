import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './admin'; // Assuming you have a Header component

const ADMIN_URL = process.env.REACT_APP_ADMIN_URL; // Use environment variable for the base URL

function Offerings() {
  const [offerings, setOfferings] = useState([]); // All offerings
  const [filteredOfferings, setFilteredOfferings] = useState([]); // Offerings filtered by status
  const [filter, setFilter] = useState('approved'); // Current filter ('approved' or 'not approved')

  // Fetch offerings on component mount
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const response = await axios.get(`${ADMIN_URL}/offerings`);
        setOfferings(response.data);
        setFilteredOfferings(response.data.filter(offering => offering.status === 'approved'));
      } catch (error) {
        console.error('Error fetching offerings:', error);
      }
    };

    fetchOfferings();
  }, []);

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilter(status);
    setFilteredOfferings(offerings.filter(offering => (status === 'approved' ? offering.status === 'approved' : offering.status !== 'approved')));
  };

  // Handle offering approval
  const handleApprove = async (offeringId) => {
    try {
      await axios.put(`${ADMIN_URL}/approve-offerings/${offeringId}`, { status: 'approved' });

      // Update the offerings list locally after approval
      setOfferings(prevOfferings => 
        prevOfferings.map(offering => 
          offering._id === offeringId ? { ...offering, status: 'approved' } : offering
        )
      );

      // Update the filtered list based on the current filter
      handleFilterChange(filter);

    } catch (error) {
      console.error('Error approving offering:', error);
    }
  };

  return (
    <div>
      <Header />
      <main className="pt-6">
      <div className="container mx-auto p-4 mt-11">
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => handleFilterChange('approved')}
          >
            Approved Offerings
          </button>
          <button
            className={`px-4 py-2 rounded ${filter === 'not approved' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => handleFilterChange('not approved')}
          >
            Not Approved Offerings
          </button>
        </div>

        <div>
          {filteredOfferings.length === 0 ? (
            <p className="text-gray-500">No offerings to display.</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Course Code</th>
                  <th className="border border-gray-300 px-4 py-2">Session</th>
                  <th className="border border-gray-300 px-4 py-2">Max Seats</th>
                  <th className="border border-gray-300 px-4 py-2">Status</th>
                  {filter === 'not approved' && <th className="border border-gray-300 px-4 py-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOfferings.map(offering => (
                  <tr key={offering._id}>
                    <td className="border border-gray-300 px-4 py-2">{offering.courseCode}</td>
                    <td className="border border-gray-300 px-4 py-2">{`${offering.sessionId.academicYear}-${offering.sessionId.phase}`}</td>
                    <td className="border border-gray-300 px-4 py-2">{offering.maxSeats}</td>
                    <td className="border border-gray-300 px-4 py-2">{offering.status}</td>
                    {filter === 'not approved' && (
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded"
                          onClick={() => handleApprove(offering._id)}
                        >
                          Approve
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}

export default Offerings;