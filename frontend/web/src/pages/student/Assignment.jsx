import React, { useState } from 'react';

const assignmentsData = [
  {
    id: 1,
    title: 'Final Project: Algorithm Implementation',
    course: 'Introduction to Programming',
    status: 'Pending',
    dueDate: 'Dec 10, 11:59 PM',
    description: 'Implement a sorting algorithm of your choice with analysis of time complexity and best/worst case scenarios.',
  },
  {
    id: 2,
    title: 'Differential Equations Problem Set',
    course: 'Advanced Mathematics',
    status: 'Pending',
    dueDate: 'Dec 12, 11:59 PM',
    description: 'Complete problems 1-15 on second-order differential equations with detailed solutions.',
  },
  {
    id: 3,
    title: 'Physics Lab Report: Pendulum Motion',
    course: 'Physics Fundamentals',
    status: 'Pending',
    dueDate: 'Dec 8, 11:59 PM',
    description: 'Write a detailed lab report on the pendulum experiment, including data analysis and error calculations.',
  },
  {
    id: 4,
    title: 'Data Structures Analysis',
    course: 'Introduction to Programming',
    status: 'Submitted',
    dueDate: 'Dec 2, 10:23 AM',
    description: 'Analysis of different data structures and their applications in real-world programming scenarios.',
  },
  {
    id: 5,
    title: 'Integral Calculus Problem Set',
    course: 'Advanced Mathematics',
    status: 'Submitted',
    dueDate: 'Nov 28, 8:45 PM',
    description: 'Comprehensive problem set covering integration techniques, applications, and theorems.',
  },
  {
    id: 6,
    title: 'Kinematics Research Paper',
    course: 'Physics Fundamentals',
    status: 'Graded',
    dueDate: 'Nov 25',
    description: 'Research paper exploring advances in kinematics and their applications in modern physics.',
    grade: '92/100 (A)',
  }
];

const Assignment = () => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssignments = assignmentsData.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'All' ||
      assignment.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="">

      <div className="flex flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-10">Assignments</h1>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search assignments..." 
              className="px-4 py-2 rounded-lg text-base border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
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

      {/* Filter Categories */}
      <div className="mb-8">
        <div className="flex gap-5 mb-4 overflow-x-auto pb-2 text-xl font-bold ml-9">
          {assignmentsData.map((assignment, index) => (
            <button 
              key={index}
              className={`${filter === assignment.status ? 'text-[#0b3630]' : 'text-[#4B5563]'} whitespace-nowrap`}
              onClick={() => setFilter(assignment.status)}
            >
              {assignment.status} ({filteredAssignments.filter(a => a.status === assignment.status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Assignment List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAssignments.map(assignment => (
          <div key={assignment.id} className="rounded-lg overflow-hidden border border-gray-800 bg-dark-100">
            {/* Assignment Header */}
            <div className="h-32 bg-[#145D52] relative">
              <div className="absolute bottom-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.status === "Graded" ? 'bg-green-500' : 
                    assignment.status === "Submitted" ? 'bg-blue-500' : 'bg-yellow-500'
                }`}>
                  {assignment.status}
                </span>
              </div>
            </div>

            {/* Assignment Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg">{assignment.title}</h3>
              <div className="text-sm text-gray-900 mb-2">{assignment.course}</div>
              
              {/* Due Date */}
              <div className={`mb-4 text-sm ${assignment.status === 'Pending' ? 'text-red-500' : 'text-gray-500'}`}>
                Due in {assignment.dueDate}
              </div>
              
              {/* Description */}
              <div className="text-gray-600 dark:text-gray-400 mt-2">{assignment.description}</div>

              <div className="flex gap-3 mt-4">
                <button className={`px-4 py-2 ${assignment.status === 'Pending' ? 'bg-[#145D52] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded`}>
                  {assignment.status === 'Pending' ? 'Start Assignment' : 'View Submission'}
                </button>
                {assignment.status === 'Graded' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                    View Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignment;
