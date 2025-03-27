import React, { useState } from 'react';

const Quizzes = () => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const quizzes = [
    {
      title: 'Recursion and Algorithms',
      course: 'Introduction to Programming',
      dueDate: 'Dec 15, 11:59 PM',
      duration: '60 min',
      status: 'Available',
      description: '25 questions covering recursion, algorithm analysis, and implementation strategies.',
    },
    {
      title: 'Differential Equations',
      course: 'Advanced Mathematics',
      dueDate: 'Dec 12, 11:59 PM',
      duration: '45 min',
      status: 'Available',
      description: '15 questions on solving and applications of differential equations in various fields.',
    },
    {
      title: 'Classical Mechanics',
      course: 'Physics Fundamentals',
      dueDate: 'Dec 9, 11:59 PM',
      duration: '30 min',
      status: 'Available',
      description: '20 questions covering Newton\'s laws, energy conservation, and classical mechanics problems.',
    },
    {
      title: 'Variables and Data Types',
      course: 'Introduction to Programming',
      completionDate: 'Nov 20',
      score: '23/25',
      percentage: '92%',
      feedback: 'Great work on understanding data types and variables in programming!',
      status: 'Completed',
    },
    {
      title: 'Limits and Continuity',
      course: 'Advanced Mathematics',
      completionDate: 'Nov 15',
      score: '14/16',
      percentage: '88%',
      feedback: 'Good understanding of limits and continuity concepts.',
      status: 'Completed',
    },
    {
      title: 'Kinematics',
      course: 'Physics Fundamentals',
      completionDate: 'Nov 10',
      score: '16/20',
      percentage: '78%',
      feedback: 'Good work, but review sections on projectile motion.',
      status: 'Completed',
    },
    {
      title: 'HTML and CSS Basics',
      course: 'Web Development Basics',
      completionDate: 'Nov 5',
      score: '19/20',
      percentage: '95%',
      feedback: 'Excellent understanding of HTML and CSS fundamentals!',
      status: 'Completed',
    },
  ];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || quiz.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <section id="quizzes" className="mb-8">
      <h1 className="text-2xl font-bold mb-6">Quizzes</h1>

      <div className="flex flex-row justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="Search quizzes..." 
          className="px-4 py-2 rounded-lg text-base border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Buttons */}
      <div className="mb-8 flex gap-5 text-xl font-bold ml-9">
        {['All', 'Available', 'Completed'].map(status => (
          <button
            key={status}
            className={`${filter === status ? 'text-[#0b3630]' : 'text-[#4B5563]'} whitespace-nowrap`}
            onClick={() => setFilter(status)}
          >
            {status} ({quizzes.filter(quiz => quiz.status === status).length})
          </button>
        ))}
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredQuizzes.map((quiz, index) => (
          <div key={index} className="rounded-lg overflow-hidden border border-gray-800 bg-dark-100">
            {/* Quiz Header */}
            <div className="h-32 bg-[#145D52] relative">
              <div className="absolute bottom-4 right-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    quiz.status === "Completed" ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {quiz.status}
                </span>
              </div>
            </div>

            {/* Quiz Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg">{quiz.title}</h3>
              <div className="text-sm text-gray-900 mb-2">{quiz.course}</div>

              {/* Conditional Date Display */}
              <div className={`mb-4 text-sm ${quiz.status === 'Available' ? 'text-red-500' : 'text-gray-500'}`}>
                {quiz.status === 'Available' ? `Due by ${quiz.dueDate}` : `Completed on ${quiz.completionDate}`}
              </div>

              {/* Description or Score */}
              {quiz.status === 'Available' ? (
                <div className="text-gray-600 mt-2">{quiz.description}</div>
              ) : (
                <div className="text-gray-600 mt-2">
                  Score: {quiz.score} ({quiz.percentage})
                  <p className="text-gray-500 mt-1">{quiz.feedback}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button className={`px-4 py-2 ${quiz.status === 'Available' ? 'bg-[#145D52] text-white' : 'bg-gray-200 text-gray-700'} rounded`}>
                  {quiz.status === 'Available' ? 'Start Quiz' : 'View Results'}
                </button>
                {quiz.status === 'Completed' && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                    View Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Quizzes;
