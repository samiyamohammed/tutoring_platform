import React from "react";
// primary: '#0a5144',
//                         secondary: '#146356',
//                         accent: '#2563eb',
//                         success: '#10b981',
//                         danger: '#ef4444',
//                         warning: '#f59e0b',

const FilterBar = ({setCourseFilter,setStatusFilter,setSearchQuery}) => {
  return (
    <div className="w-full bg-[#0a5144] p-4 rounded-lg flex flex-wrap gap-4 justify-between">
      <select
        className="w-full lg:max-w-[30rem] p-3 rounded bg-[#146356] text-white text-xl"
        onChange={(e) => setCourseFilter(e.target.value)}
      >
        <option value="">All Courses</option>
        <option value="Advanced Mathematics">Advanced Mathematics</option>
        <option value="Intro to Programming">Intro to Programming</option>
        <option value="Physics 101">Physics 101</option>
      </select>
      <select
        className="w-full max-w-[30rem] p-3 rounded bg-[#146356] text-white text-xl"
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Draft">Draft</option>
        <option value="Scheduled">Scheduled</option>
      </select>
      <input
        type="text"
        className="p-3 rounded bg-gray-200 text-[#146356] text-xl font-bold w-full max-w-[30rem]"
        placeholder="Search quizzes..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default FilterBar;
