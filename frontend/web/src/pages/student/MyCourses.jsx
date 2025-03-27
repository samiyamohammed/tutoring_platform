import React, { useState } from 'react';
import { FaCaretDown, FaBookOpen, FaClock, FaCalendarAlt, FaEllipsisV } from 'react-icons/fa';
import { FaRegCircleUser } from "react-icons/fa6";
import { Link } from 'react-router-dom';

// JSON data for courses
const coursesData = [
  {
    id: 1,
    title: "Advanced Mathematics",
    description:"A deep dive into the wonders of the universe and beyond.",
    instructor: "Prof. John Doe",
    status: "In Progress",
    progress: 85,
    modules: 12,
    hours: 42,
    endDate: "Ends Dec 15",
    action: "Continue"
  },
  {
    id: 2,
    title: "Introduction to Programming",
    description:"A deep dive into the wonders of the universe and beyond.",
    instructor: "Prof. Jane Smith",
    status: "In Progress",
    progress: 62,
    modules: 15,
    hours: 36,
    endDate: "Ends Jan 10",
    action: "Continue"
  },
  {
    id: 3,
    title: "Physics Fundamentals",
    description:"A deep dive into the wonders of the universe and beyond.",
    instructor: "Dr. Michael Brown",
    status: "In Progress",
    progress: 38,
    modules: 10,
    hours: 30,
    endDate: "Ends Feb 5",
    action: "Continue"
  },
  {
    id: 4,
    title: "Web Development Basics",
    description:"A deep dive into the wonders of the universe and beyond.",
    instructor: "Prof. Sarah Johnson",
    status: "Completed",
    progress: 100,
    modules: 8,
    hours: 24,
    endDate: "Completed",
    action: "View Certificate"
  }
];


const categories = [
  { name: "All Courses", count: 4, active: true },
  { name: "In Progress", count: 3, active: false },
  { name: "Completed", count: 1, active: false },
  { name: "Archived", count: 0, active: false }
];

const MyCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Courses");

  const filteredCourses = coursesData.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All Courses" || 
                          course.status === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="">

      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-10 ">My Courses</h1>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="px-4 py-2 rounded-lg text-base border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100 "
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative inline-block">
            <button className="bg-dark-100 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
              <span>Search</span>
            </button>
          </div>

        </div>
      </div>

      
      
      {/* Course Categories */}
      <div className="mb-8">
        <div className="flex gap-5 mb-4 overflow-x-auto pb-2 text-xl font-bold ml-9">
          {categories.map((category, index) => (
            <button 
              key={index}
              className={`${activeCategory === category.name ? 'text-[#0b3630]' : 'text-[#4B5563]'} whitespace-nowrap`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>
      
      {/* Course List */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {filteredCourses.map(course => (
        <div key={course.id} className="rounded-lg overflow-hidden border border-gray-800 bg-dark-100">
        {/* Course Header */}
        <div className="h-32 bg-[#145D52] relative">
            <div className="absolute bottom-4 right-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.status === "Completed" ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
                {course.status}
            </span>
            </div>
        </div>
        
        {/* Course Content */}
        <div className="p-4">
            <h3 className="font-bold text-lg">{course.title}</h3>
            <div className="text-sm text-gray-900 mb-2">{course.instructor}</div>
            
            {/* Progress bar */}
            <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                className={`${course.status === "Completed" ? 'bg-green-500' : 'bg-yellow-300'} h-2 rounded-full`} 
                style={{ width: `${course.progress}%` }}
                ></div>
            </div>
            </div>
            
            {/* Stats */}
            <div className="flex text-xs text-gray-900 mb-4 gap-4">
            <div className="flex items-center">
                <FaBookOpen className="mr-1" /> {course.modules} Modules
            </div>
            <div className="flex items-center">
                <FaClock className="mr-1" /> {course.hours} Hours
            </div>
            <div className="flex items-center">
                <FaCalendarAlt className="mr-1" /> {course.endDate}
            </div>
            </div>
            
            <div className="flex ">
                <Link to='' className="bg-[#145D52] py-2 flex-1 text-center text-white">{course.action}</Link>
            </div>
        </div>
        </div>
    ))}
    </div>

    </div>
  );
};

export default MyCourses;