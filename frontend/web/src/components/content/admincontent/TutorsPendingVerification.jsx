import React from 'react'

const TutorsPendingVerification = () => {

    const tutors = [
        { id: 1, name: 'Daniel Thompson', subject: 'Computer Science', experience: '8 years experience', status: 'Audited course' },
        { id: 2, name: 'Jessica Williams', subject: 'Mathematics', experience: '5 years experience', status: 'Audited time ago' },
        { id: 3, name: 'Robert Chen', subject: 'Physics', experience: '10 years experience', status: 'Audited date ago' },
      ];
    
  return (
    <div className="bg-[#145D52] p-4 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Tutors Pending Verification</h2>
      <div>
        {tutors.map((tutor) => (
          <div key={tutor.id} className=" flex justify-between mb-4 py-5 px-3 bg-[#14655D]">
            <div>
                <div className="font-semibold text-white">{tutor.name}</div>
                <div className="text-gray-900">{tutor.subject} - {tutor.experience}</div>
                <div className="text-gray-700 text-sm">{tutor.status}</div>
            </div>
            <div>
                <button class="mb-2 w-full px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#10B981] hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success">
                    Verify
                </button>
                <button class="w-full px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#EF4444] hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger">
                    Reject
                </button>
            </div>
          </div>
          
        ))}
        
      </div>
    </div>
  )
}

export default TutorsPendingVerification
