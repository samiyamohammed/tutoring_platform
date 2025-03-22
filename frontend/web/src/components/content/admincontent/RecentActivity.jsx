import React from 'react'

const RecentActivity = () => {

    const activities = [
        { id: 1, text: 'Sarah Johnson verified as a tutor', time: '10 minutes ago' },
        { id: 2, text: 'New course created "Advanced Data Structure"', time: '1 hour ago' },
        { id: 3, text: 'New user reported a technical issue', time: '3 hours ago' },
        { id: 4, text: 'Course "Introduction to ML" removed due to low enrollment', time: '5 hours ago' },
        { id: 5, text: 'System-wide notification sent about scheduled maintenance', time: 'Yesterday' },
      ];

  return (
    <div className="bg-[#145D52] p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <ul>
        {activities.map((activity) => (
          <li key={activity.id} className="mb-2 my-6 text-white">
            <span className="font-semibold">{activity.text}</span>
            <span className="text-gray-900 text-sm ml-2">{activity.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RecentActivity
