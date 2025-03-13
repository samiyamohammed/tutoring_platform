import React from 'react'

const Sidebar = () => {
  return (
    <div>
      <h1>hellow</h1>
    </div>
  )
}

export default Sidebar










































// import { FiMenu } from "react-icons/fi";
// import { FaBookOpen } from "react-icons/fa6";
// import { LuNotebookText } from "react-icons/lu";
// import { FaRegCircleQuestion } from "react-icons/fa6";
// import { IoIosPeople } from "react-icons/io";
// import { IoMdNotifications } from "react-icons/io";
// import { CgProfile } from "react-icons/cg";
// import {Link} from 'react-router-dom'

// function Sidebar({ userRole, activeSection, setActiveSection }) {
//   const handleNavClick = (section) => {
//     setActiveSection(section);
//   };type="submit"

//   return (
//     <aside className="w-full md:w-64 bg-gray-100 dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 transition-all duration-300">
//       <div className="p-4 flex items-center">
//         <svg className="w-8 h-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//           <circle cx="50" cy="50" r="45" fill="#5D5CDE" />
//           <path d="M32 40 L50 30 L68 40 L68 65 L50 75 L32 65 Z" fill="white" />
//           <path d="M50 30 L50 55 L68 65" stroke="white" stroke-width="2" fill="none" />
//           <path d="M50 55 L32 65" stroke="white" stroke-width="2" fill="none" />
//         </svg>
//         <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">EduConnect</h1>
//       </div>

      // <nav className="px-2 py-4">
      //   <Link to=''>
      //       <FiMenu/>
      //       <span className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''} px-3 py-2 rounded-md text-sm font-medium w-full text-left flex items-center`}>Dashboard</span>
      //   </Link>
        
      // </nav>
//     </aside>
//   );
// }

// export default Sidebar;

// import React from 'react';
// import { Link } from 'react-router-dom';

// function Sidebar({ userRole, onLogout }) {
//   return (
//     <aside className="w-full md:w-64 bg-gray-100 dark:bg-gray-800 overflow-y-auto border-r border-gray-200 dark:border-gray-700 transition-all duration-300">
//       <div className="p-4 flex items-center">
//         <svg className="w-8 h-8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//           <circle cx="50" cy="50" r="45" fill="#5D5CDE" />
//           <path d="M32 40 L50 30 L68 40 L68 65 L50 75 L32 65 Z" fill="white" />
//           <path d="M50 30 L50 55 L68 65" stroke="white" stroke-width="2" fill="none" />
//           <path d="M50 55 L32 65" stroke="white" stroke-width="2" fill="none" />
//         </svg>
//         <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">EduConnect</h1>
//       </div>
//       <nav className="px-2 py-4">
//         <ul>
//           <li className="mb-1">
//             <Link
//               to={`/${userRole}/dashboard`}
//               className="nav-link px-3 py-2 rounded-md text-sm font-medium w-full text-left flex items-center"
//             >
//               Dashboard
//             </Link>
//           </li>
//           {/* Add more navigation links based on userRole */}
//         </ul>
//       </nav>
      // <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
      //   <button
      //     onClick={onLogout}
      //     className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      //   >
      //     Log out
      //   </button>
      // </div>
//     </aside>
//   );
// }

// export default Sidebar;