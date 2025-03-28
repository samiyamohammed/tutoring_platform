import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const EditCourseModal = ({ isOpen, onClose, course, onSubmit }) => {
  const [courseData, setCourseData] = useState({
    title: "",
    students: "",
    days: "",
    description: "",
  });

  // Update modal state when a new course is selected
  useEffect(() => {
    if (course) {
      setCourseData(course);
    }
  }, [course]);

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(courseData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Course Modal"
      ariaHideApp={false}
      className="w-[40rem] text-black m-auto my-20 p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Edit Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block">Course Title</label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
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
          />
        </div>
        <div className="mb-4">
          <label className="block">Description</label>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCourseModal;
