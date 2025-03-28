import React from 'react';
import { FaBookOpen, FaClock, FaStar } from 'react-icons/fa';

const CourseCard = ({ title, instructor, modules, hours, rating, tags }) => {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-800 bg-dark-100">
      {/* Course Header */}
      <div className="h-32 bg-[#145D52] relative">
        <div className="absolute bottom-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${rating.includes('4.9') ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {rating}
          </span>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="text-sm text-gray-900 mb-2">{instructor}</div>
        
        {/* Course Info */}
        <div className="flex text-xs text-gray-900 mb-4 gap-4">
          <div className="flex items-center">
            <FaBookOpen className="mr-1" /> {modules} Modules
          </div>
          <div className="flex items-center">
            <FaClock className="mr-1" /> {hours} Hours
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-2">
          {tags.map((tag, index) => (
            <span key={index} className="text-xs text-white bg-blue-500 px-2 py-1 rounded-full">{tag}</span>
          ))}
        </div>

        {/* Enroll Button */}
        <div className="flex mt-4">
          <button className="w-full px-4 py-2 bg-[#145D52] text-white rounded-lg hover:bg-green-600 transition-colors">
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
