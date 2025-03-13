import { Link } from "react-router-dom";

const schedule = [
  { title: "Advanced Math Tutoring", time: "2:00 PM - 3:30 PM", tutor: "Sarah Johnson" },
  { title: "Programming Help", time: "4:00 PM - 5:00 PM", tutor: "Thomas Brown" },
  { title: "Quiz Review - Physics", time: "6:30 PM - 7:30 PM", tutor: "Group Session (5 students)" },
];

const TodaysSchedule = () => {
  return (
    <div className="bg-[#145D52] text-white  p-6 rounded-lg shadow-md">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold text-white mb-4">Today's Schedule</h2>
        <Link className='underline text-blue-300'>View all</Link>
      </div>
      {schedule.map((session, index) => (
        <div key={index} className="bg-[#14655D] p-4 mb-3 rounded-lg flex justify-between">
          <div>
            <h3 className="text-lg font-semibold">{session.title}</h3>
            <p className="text-sm text-gray-400">{session.time} • {session.tutor}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
            Join Session
          </button>
        </div>
      ))}
    </div>
  );
};

export default TodaysSchedule;
