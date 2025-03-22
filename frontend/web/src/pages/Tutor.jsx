import React from "react";
import StatusCard from "../components/content/tutorcontent/StatusCard";
import TodaysSchedule from "../components/content/tutorcontent/TodaysSchedule";
import AssignmentSubmissions from "../components/content/tutorcontent/AssignmentSubmissions";
import SessionRequests from "../components/content/tutorcontent/SessionRequests";
import { FiMenu } from "react-icons/fi";
import { FaBookOpen, FaPersonRifle } from "react-icons/fa6";
import { LuNotebookText } from "react-icons/lu";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { IoIosPeople } from "react-icons/io";
import { IoMdNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import {Link} from 'react-router-dom'
import logo from '../assets/logo.png'


const Tutor = () => {

  const Sidebar = ({onLogout}) => (

    <aside className="w-1/6 bg-[#145D52] text-white h-screen p-4 fixed">
      <div  className='flex gap-3 items-center justify-center  mb-6'>
        <img src={logo} alt="" className='size-12 rounded-full'/>
        <h2 className="text-3xl font-bold mb-6 mt-3">EDconnect</h2>
      </div>

      <div className='flex justify-center gap-4 mb-10 mt-auto p-4 text-black border-b border-gray-200 dark:border-gray-700'>
        <CgProfile size={40} className='-ml-4'/>
        <div className='flex flex-col'>
          <h1>Name</h1>
          <span>role</span>
        </div>
      </div>
      <nav className="flex flex-col px-7 py-4 space-y-8">
      <Link to='/student/dashboard' className='flex gap-5 '>
            <FiMenu size={32} />
            <span className='text-2xl'>Dashboard</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <FaBookOpen size={32} />
            <span className='text-2xl'>Manage Courses</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <LuNotebookText size={32} />
            <span className='text-2xl'>Assignments</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <FaRegCircleQuestion size={32} />
            <span className='text-2xl'>Quizzes</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <IoIosPeople size={32} />
            <span className='text-2xl'>Schedule</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <IoIosPeople size={32} />
            <span className='text-2xl'>My Students</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <IoMdNotifications size={32} />
            <span className='text-2xl'>Notifications</span>
        </Link>
        <Link to='/student/dashboard' className='flex gap-5 '>
            <CgProfile size={32} />
            <span className='text-2xl'>Profile</span>
        </Link>
        
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          Log out
        </button>
      </div>
    </aside>
  );
  
 
  return (
    <div className="flex bg-white h-screen">
      <Sidebar />
      <main className="w-5/6 flex-1 overflow-y-auto p-4  transition-all duration-300 ml-[16.67%]">
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
      </main>
    </div>
  
  );
}

export default Tutor;
