import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
// import Dashboard from './components/dashboard/Dashboard';
import Student from './pages/Student';
import Tutor from './pages/Tutor';
import Admin from './pages/Admin';
import Toast from './components/toast/Toast';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const handleLogin = (email, role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    showToast('Success', 'Logged in successfully!', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
    showToast('Success', 'Logged out successfully!', 'success');
  };

  const showToast = (title, message, type) => {
    setToast({ show: true, message, type, title });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  return (
    <div className="bg-white text-black">
      <div className="h-full bg-white duration-200">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          <Route path="/student/dashboard" element={<Student />} />
          <Route path="/tutor/dashboard" element={<Tutor />} />
          <Route path="/admin/dashboard" element={<Admin />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        {toast.show && <Toast message={toast.message} type={toast.type} title={toast.title} />}
      </div>
    </div>
  );
};

export default App;




























// import React, { useState } from 'react'
// import { Routes ,Route,Navigate} from 'react-router-dom'
// // import Login from './components/auth/Login';
// import LoginForm from './components/landing/LoginForm';
// import RegisterForm from './components/landing/RegisterForm';
// import Register from './components/auth/Register';
// import Dashboard from './components/dashboard/Dashboard';
// import Toast from './components/toast/Toast';
// import Nav from './layout/Nav'
// import Footer from './layout/Footer'
// // import Home from './pages/Home'
// // import About from './pages/About'
// // import Courses from './pages/Courses'
// // import Landing from './pages/Landing'


// const App = () => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userRole, setUserRole] = useState('student');
//   const [toast, setToast] = useState({ show: false, message: '', type: '' });

//   const handleLogin = (email, password) => {
//     // Simulate authentication
//     setIsLoggedIn(true);
//     setUserRole(email.includes('admin') ? 'admin' : email.includes('tutor') ? 'tutor' : 'student');
//     showToast('Success', 'Logged in successfully!', 'success');
//   };
  
//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setUserRole('student');
//     showToast('Success', 'Logged out successfully!', 'success');
//   };
  
//   const showToast = (title, message, type) => {
//     setToast({ show: true, message, type, title });
//     setTimeout(() => setToast({ ...toast, show: false }), 3000);
//   };
  

//   return (
//     <div className='bg-white text-black'>
//       {/* <Nav/> */}
     
//       <div className='h-full bg-white duration-200'>
//         <Routes>
//           <Route
//             path="/login"
//             element={
//               !isLoggedIn ? (
//                 <LoginForm onLogin={handleLogin} />
//               ) : (
//                 <Navigate to={`/${userRole}/dashboard`} />
//               )
//             }
//           />

//           <Route
//             path="/register"
//             element={
//               !isLoggedIn ? (
//                 <RegisterForm onRegister={handleLogin} />
//               ) : (
//                 <Navigate to={`/${userRole}/dashboard`} />
//               )
//             }
//           />

//           <Route
//             path="/student/dashboard"
//             element={
//               isLoggedIn && userRole === 'student' ? (
//                 <Dashboard userRole={userRole} onLogout={handleLogout}>
//                   <Student />
//                 </Dashboard>
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           <Route
//             path="/tutor/dashboard"
//             element={
//               isLoggedIn && userRole === 'tutor' ? (
//                 <Dashboard userRole={userRole} onLogout={handleLogout}>
//                   <Tutor />
//                 </Dashboard>
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           <Route
//             path="/admin/dashboard"
//             element={
//               isLoggedIn && userRole === 'admin' ? (
//                 <Dashboard userRole={userRole} onLogout={handleLogout}>
//                   <Admin />
//                 </Dashboard>
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           <Route
//             path="/"
//             element={
//               isLoggedIn ? (
//                 <Navigate to={`/${userRole}/dashboard`} />
//               ) : (
//                 <Navigate to="/login" />
//               )
//             }
//           />

//           {toast.show && <Toast message={toast.message} type={toast.type} title={toast.title} />}


//         {/* <Route path="/" element={<Home />} />
//         <Route path="/landing" element={<Landing />} /> */}
//         {/* <Route path='/login'/>
//         <Route path='/register'/> */}
//         {/* <Route path="/about" element={<About />} />
//         <Route path="/course" element={<Courses />} /> */}
//       </Routes>

//         </div>
//       {/* <Footer/> */}
//     </div>
//   )
// }

// export default App
