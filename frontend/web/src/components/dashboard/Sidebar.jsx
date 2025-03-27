// import { Link } from 'react-router-dom';
// import { FiMenu, FaBookOpen, LuNotebookText, FaRegCircleQuestion, IoIosPeople, IoMdNotifications, CgProfile, MdVerifiedUser, MdOutlineSettings } from 'react-icons/all';
// import logo from '../assets/logo.png';

// const Sidebar = ({ onLogout, userRole }) => {
//   // Common links for all roles
//   // const commonLinks = [
//   //   { to: '/dashboard', icon: <FiMenu size={32} />, text: 'Dashboard' },
//   //   { to: '/notifications', icon: <IoMdNotifications size={32} />, text: 'Notifications' },
//   //   { to: '/profile', icon: <CgProfile size={32} />, text: 'Profile' },
//   // ];

//   // Role-specific links
//   const roleBasedLinks = {
//     student: [
//       { to: '/courses', icon: <FaBookOpen size={32} />, text: 'My Courses' },
//       { to: '/assignments', icon: <LuNotebookText size={32} />, text: 'Assignments' },
//       { to: '/quizzes', icon: <FaRegCircleQuestion size={32} />, text: 'Quizzes' },
//       { to: '/schedule', icon: <IoIosPeople size={32} />, text: 'Sessions' },
//       { to: '/find-tutors', icon: <IoIosPeople size={32} />, text: 'Find Tutors' },
//     ],
//     tutor: [
//       { to: '/courses', icon: <FaBookOpen size={32} />, text: 'Manage Courses' },
//       { to: '/assignments', icon: <LuNotebookText size={32} />, text: 'Assignments' },
//       { to: '/quizzes', icon: <FaRegCircleQuestion size={32} />, text: 'Quizzes' },
//       { to: '/schedule', icon: <IoIosPeople size={32} />, text: 'Schedule' },
//       { to: '/students', icon: <IoIosPeople size={32} />, text: 'My Students' },
//     ],
//     admin: [
//       { to: '/courses', icon: <FaBookOpen size={32} />, text: 'Manage Courses' },
//       { to: '/users', icon: <IoIosPeople size={32} />, text: 'Manage Users' },
//       { to: '/verify-tutors', icon: <MdVerifiedUser size={32} />, text: 'Verify Tutors' },
//       { to: '/certificates', icon: <MdVerified size={32} />, text: 'Certificates' },
//       { to: '/settings', icon: <MdOutlineSettings size={32} />, text: 'Settings' },
//     ],
//   };

//   // combining the links
//   const links = [...commonLinks, ...(roleBasedLinks[userRole] || [])];

//   return (
//     <aside className="w-1/6 bg-[#145D52] text-white h-screen p-4 fixed">
//       <div className="flex gap-3 items-center justify-center mb-6">
//         <img src={logo} alt="Logo" className="size-12 rounded-full" />
//         <h2 className="text-3xl font-bold">EDconnect</h2>
//       </div>
//       <nav className="flex flex-col px-7 py-4 space-y-8">
//         {links.map((link, index) => (
//           <Link key={index} to={link.to} className="flex gap-5">
//             {link.icon}
//             <span className="text-2xl">{link.text}</span>
//           </Link>
//         ))}
//       </nav>
//       <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
//         <button
//           onClick={onLogout}
//           className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2"
//         >
//           Log out
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
import React from 'react'

const Sidebar = () => {
  return (
    <div>
      
    </div>
  )
}

export default Sidebar
