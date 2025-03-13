import React from "react";

const courses = [
  { name: "Advanced Mathematics", professor: "Prof. John Doe", progress: 85 },
  { name: "Introduction to Programming", professor: "Prof. Jane Smith", progress: 62 },
  { name: "Physics Fundamentals", professor: "Dr. Michael Brown", progress: 38 },
];
// #5D1420 #8B2E3D D72638 #14655D #147D72
const CourseList = () => {
  return (
    <div className="bg-[#145D52] text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Current Courses</h2>
      {courses.map((course, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-[#14655D] p-3 mb-2 rounded-lg"
        >
          <div>
            <h3 className="font-medium">{course.name}</h3>
            <p className="text-sm text-gray-400">{course.professor} - {course.progress}% Complete</p>
          </div>
          <button className="bg-green-600 px-4 py-2 rounded-lg">Continue</button>
        </div>
      ))}
    </div>
  );
};

export default CourseList 