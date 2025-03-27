import StatusCard from '../../components/content/studentcontent/StatusCard';
import CourseList from '../../components/content/studentcontent/CourseList';
import UpcomingSessions from '../../components/content/studentcontent/UpcomingSessions'
import PendingAssignment from '../../components/content/studentcontent/PendingAssignments';

const StudentDashboard = () => {
  return (
    <section className="">
        <h1 className="text-2xl font-bold mb-6 ">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatusCard title="Enrolled Courses" value="4"/>
        <StatusCard title="Upcoming Sessions" value="4"/>
        <StatusCard title="Pending Assignments" value="4"/>
        
        </div>
        
        <CourseList/>

        <div className="grid grid-cols-2 gap-6 mt-6">
        <UpcomingSessions />
        <PendingAssignment />
        </div>
    </section>
  )
}

export default StudentDashboard
