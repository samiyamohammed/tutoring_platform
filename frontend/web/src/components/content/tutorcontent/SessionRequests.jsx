import React from "react";

const sessionRequests = [
  { title: "Math Help - Calculus", student: "Emily Davis", time: "Tomorrow, 5:00 PM - 6:00 PM" },
  { title: "Programming Project Guidance", student: "Alex Wilson", time: "Friday, 2:00 PM - 3:00 PM" },
];

const SessionRequests = () => {
  return (
    <div className="bg-[#145D52] text-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Session Requests</h2>
      {sessionRequests.map((request, index) => (
        <div key={index} className="bg-[#14655D] p-4 mb-3 rounded-lg">
          <h3 className="text-lg font-semibold">{request.title}</h3>
          <p className="text-sm text-gray-400">{request.student}</p>
          <p className="text-sm text-gray-400">Requested for {request.time}</p>
          <div className="mt-3 flex space-x-2">
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">
              Accept
            </button>
            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">
              Decline
            </button>
            <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white">
              Reschedule
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionRequests;
