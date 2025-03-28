import { Routes, Route, useNavigate } from "react-router-dom"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"

import DashboardSidebar from "./Sidebar"
import StudentDashboard from "./StudentDashboard"
import Quizzes from "./Quizzes"
import MyCourses from "./MyCourses"
import BrowseCourse from "./BrowseCourse"
import Assignment from "./Assignment"
import FindTutor from "./FindTutor"
// Placeholder components for other routes




const Sessions = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Sessions</h1>
  </div>
)


const StudentLayout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Handle logout logic here
    navigate("/login")
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-gray-50 w-full">
        <DashboardSidebar onLogout={handleLogout} />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 w-full max-w-full">
            <div className="container mx-auto max-w-full">
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="mycourses" element={<MyCourses />} />
                <Route path="browsecourse" element={<BrowseCourse />} />
                <Route path="assignment" element={<Assignment />} />
                <Route path="quizzes" element={<Quizzes />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="findtutor" element={<FindTutor />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default StudentLayout

