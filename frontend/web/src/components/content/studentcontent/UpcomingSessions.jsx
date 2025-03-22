import React from "react";

const sessions = [
  { name: "Advanced Math Tutoring", time: "Tomorrow, 2:00 PM - 3:30 PM", tutor: "Prof. John Doe" },
  { name: "Programming Help", time: "Friday, 4:00 PM - 5:00 PM", tutor: "Prof. Jane Smith" },
];

const UpcomingSessions = () => {
  return (
    <div className="bg-[#145D52] p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>
      {sessions.map((session, index) => (
        <div key={index} className="bg-[#14655D] p-3 mb-3 rounded-lg">
          <h3 className="font-medium">{session.name}</h3>
          <p className="text-sm text-gray-400">{session.time}</p>
          <p className="text-sm text-gray-400">Tutor: {session.tutor}</p>
          <div className="mt-2">
            <button className="bg-green-600 px-3 py-2 rounded-lg mr-2">Join Session</button>
            <button className="bg-yellow-600 px-3 py-2 rounded-lg">Reschedule</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingSessions;
