
const stats = [
  { title: "Active Courses", value: 5 },
  { title: "Enrolled Students", value: 32 },
  { title: "Upcoming Sessions", value: 8 },
  { title: "To Be Graded", value: 12 },
];

const StatusCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-[#145D52]  text-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold">{stat.title}</h3>
          <p className="text-3xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatusCard;
