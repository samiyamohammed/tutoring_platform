import React from "react";

const assignments = [
  { name: "Differential Equations", course: "Advanced Mathematics", due: "Due Tomorrow", urgency: "bg-red-600" },
  { name: "Arrays and Functions", course: "Introduction to Programming", due: "Due in 3 days", urgency: "bg-yellow-600" },
  { name: "Newton’s Laws Quiz", course: "Physics Fundamentals", due: "Due in 3 days", urgency: "bg-yellow-600" },
];


const PendingAssignment = () => {
  return (
    <div className="bg-[#145D52] text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Pending Assignments</h2>
      {assignments.map((assignment, index) => (
        <div key={index} className="bg-[#14655D] p-3 mb-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{assignment.name}</h3>
              <p className="text-sm text-gray-400">{assignment.course}</p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-lg ${assignment.urgency}`}>{assignment.due}</span>
          </div>
          <button className="bg-[#157d9c] w-full mt-3 py-2 rounded-lg">Complete Assignment</button>
        </div>
      ))}
    </div>
  );
};

export default PendingAssignment;
