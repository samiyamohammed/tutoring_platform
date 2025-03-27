import StatusCard from "../../components/content/tutorcontent/StatusCard";
import TodaysSchedule from "../../components/content/tutorcontent/TodaysSchedule";
import AssignmentSubmissions from "../../components/content/tutorcontent/AssignmentSubmissions";
import SessionRequests from "../../components/content/tutorcontent/SessionRequests";

const TutorDashboard = () => {
  return (
    <section className="animate-fade-in">
          <h1 className="text-2xl font-bold mb-6 ">Tutor Dashboard</h1>
          
          <StatusCard />

          <div className="my-6">
            <TodaysSchedule />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AssignmentSubmissions />
            <SessionRequests />
          </div>

    </section>
  )
}

export default TutorDashboard
