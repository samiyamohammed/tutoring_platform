import React, { useState } from "react";

const CreateCourse = ({ onSubmit, onClose }) => {
  const [courseData, setCourseData] = useState({
    title: "",
    students: "",
    days: "",
    description: "",
  });

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(courseData); // Pass the course data back to ManageCourses
    setCourseData({ title: "", students: "", days: "", description: "" }); // Reset form
  };

  return (
    <form onSubmit={handleSubmit} className="text-black">
      <div className="mb-4">
        <label className="block">Course Title</label>
        <input
          type="text"
          name="title"
          value={courseData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block">Students</label>
        <input
          type="number"
          name="students"
          value={courseData.students}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block">Days</label>
        <input
          type="text"
          name="days"
          value={courseData.days}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block">Description</label>
        <textarea
          name="description"
          value={courseData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded"
          required
        />
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Course
        </button>
      </div>
    </form>
  );
};

export default CreateCourse;
