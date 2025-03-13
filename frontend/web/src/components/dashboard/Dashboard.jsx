// import React, { useState } from 'react';
// import Sidebar from './Sidebar';
// import Student from './Student';
// import Tutor from './Tutor';
// import Admin from './Admin';

// function Dashboard({ userRole }) {
//   const [activeSection, setActiveSection] = useState('dashboard');

//   const renderContent = () => {
//     switch (userRole) {
//       case 'student':
//         return <Student />;
//       case 'tutor':
//         return <Tutor />;
//       case 'admin':
//         return <Admin/>;
//       default:
//         return <div>Invalid role</div>;
//     }
//   };

//   return (
//     <div className="h-full flex flex-col md:flex-row">
//       <Sidebar userRole={userRole} activeSection={activeSection} setActiveSection={setActiveSection} />
//       <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 transition-all duration-300">
//         {renderContent()}
//       </main>
//     </div>
//   );
// }

// export default Dashboard;

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

function Dashboard({ userRole, onLogout }) {
  return (
    <div className="h-full flex flex-col md:flex-row">
      <Sidebar userRole={userRole} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;