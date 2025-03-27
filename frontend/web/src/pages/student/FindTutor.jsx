import React, { useState } from 'react';

const FindTutor = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const tutors = [
    {
      initials: "JD",
      name: "Dr. John Doe",
      subject: "Mathematics Expert",
      skills: ["Calculus", "Linear Algebra", "Differential Equations"],
      description:
        "PhD in Mathematics with 10+ years of teaching experience. Specializes in advanced calculus and mathematical analysis.",
      rating: 4.9,
      reviews: 124,
      price: 40,
      languages: "English, Spanish",
    },
    {
      initials: "JS",
      name: "Prof. Jane Smith",
      subject: "Computer Science Expert",
      skills: ["Algorithms", "Data Structures", "Programming"],
      description:
        "Master's in Computer Science with focus on algorithm design and optimization. Experienced in teaching programming concepts.",
      rating: 4.8,
      reviews: 98,
      price: 35,
      languages: "English, French",
    },
  ];

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <section id="find-tutor" className="mb-8">
      <h1 className="text-2xl font-bold mb-6">Find a Tutor</h1>

      <div className="flex flex-row justify-between items-center mb-6">
        <input 
          type="text" 
          placeholder="Search tutors..." 
          className="px-4 py-2 rounded-lg text-base border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tutor List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTutors.map((tutor, index) => (
          <div key={index} className="rounded-lg overflow-hidden border border-gray-800 bg-dark-100">
            {/* Tutor Header */}
            <div className="h-32 bg-[#145D52] relative flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{tutor.initials}</span>
            </div>

            {/* Tutor Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg">{tutor.name}</h3>
              <div className="text-sm text-gray-900 mb-2">{tutor.subject}</div>
              <div className="mb-4 text-sm text-gray-500">Rating: {tutor.rating} ({tutor.reviews} reviews)</div>
              <div className="text-gray-600 mt-2">{tutor.description}</div>
              <div className="mt-2 text-sm text-gray-700">Languages: {tutor.languages}</div>
              <div className="mt-2 text-sm text-gray-700">Hourly Rate: ${tutor.price}/hr</div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 bg-[#145D52] text-white rounded">Contact Tutor</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FindTutor;
