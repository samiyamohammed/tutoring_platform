import React from "react";

const assignments = [
  { title: "Differential Equations", student: "Sarah Johnson", course: "Advanced Mathematics", timeAgo: "2 hours ago" },
  { title: "Arrays and Functions", student: "Thomas Brown", course: "Intro to Programming", timeAgo: "Yesterday" },
  { title: "Newton’s Laws Quiz", student: "Multiple Students", course: "Physics Fundamentals", timeAgo: "4 hours ago", isMultiple: true },
];

const AssignmentSubmissions = () => {
  return (
    <div className="bg-[#145D52] text-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Assignment Submissions</h2>
      {assignments.map((assignment, index) => (
        <div key={index} className="bg-[#14655D] p-4 mb-3 rounded-lg flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">{assignment.title}</h3>
            <p className="text-sm text-gray-400">{assignment.student} - {assignment.course}</p>
            <p className="text-sm text-gray-400">Submitted {assignment.timeAgo}</p>
          </div>
          <button className="bg-green-400 hover:bg-purple-700 px-4 py-1 rounded text-white">
            {assignment.isMultiple ? "Grade All" : "Grade"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AssignmentSubmissions;
