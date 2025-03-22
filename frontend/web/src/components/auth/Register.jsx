import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterForm = ({ onRegister }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [tutorFields, setTutorFields] = useState({
    specialty: '',
    experience: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role === 'tutor' && (!tutorFields.specialty || !tutorFields.experience)) {
      setError('Please complete your tutor profile.');
      return;
    }

    const userData = {
      fullName,
      email,
      password,
      role,
      ...(role === 'tutor' && tutorFields),
    };

    // Simulate registration (replace with API call in real app)
    onRegister(userData);
    navigate(`/${role}/dashboard`); // Redirect to the respective dashboard
  };

  return (
    <div className="bg-white h-screen flex flex-col justify-center items-center min-h-screen">
      <div className="text-center mb-8">
        <h1 className="mt-4 text-5xl font-bold mb-5">EduConnect</h1>
        <p className="mt-2 text-3xl font-semibold">Your Online Tutoring Platform</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-lg mb-2">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-xl font-light mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            className="block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-xl font-light mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-xl font-light mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-xl font-light mb-2">
            Register as
          </label>
          <select
            id="role"
            className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>
        {role === 'tutor' && (
          <div className="mb-4">
            <div className="mb-4">
              <label htmlFor="tutor-specialty" className="block text-xl font-light mb-2">
                Specialty
              </label>
              <input
                id="tutor-specialty"
                type="text"
                className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
                placeholder="E.g., Mathematics, Physics, Programming"
                value={tutorFields.specialty}
                onChange={(e) => setTutorFields({ ...tutorFields, specialty: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="tutor-experience" className="block text-xl font-light mb-2">
                Years of Experience
              </label>
              <input
                id="tutor-experience"
                type="number"
                min="0"
                className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
                placeholder="Years of teaching experience"
                value={tutorFields.experience}
                onChange={(e) => setTutorFields({ ...tutorFields, experience: e.target.value })}
              />
            </div>
          </div>
        )}
        <div className="mb-4">
          <button
            type="submit"
            className="bg-emerald-800 text-white w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Register
          </button>
        </div>
      </form>
      <div className="flex text-base gap-2">
        <h2>Already have an account?</h2>
        <Link to="/login" className="underline text-blue-700 text-lg -mt-1">
          Login
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;






























// import {useState} from 'react'
// import { Link } from 'react-router-dom'

// const RegisterForm = ({ onRegister }) => {

//     const [fullName, setFullName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [role, setRole] = useState('student');
//     const [tutorFields, setTutorFields] = useState({
//     specialty: '',
//     experience: '',
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();
    
//         if (role === 'tutor' && (!tutorFields.specialty || !tutorFields.experience)) {
//           alert('Please complete your tutor profile.');
//           return;
//         }
    
//         const userData = {
//           fullName,
//           email,
//           password,
//           role,
//           ...(role === 'tutor' && tutorFields),
//         };
    
//         onRegister(userData);
//       };
    

//   return (
//     <div className='bg-white h-screen flex flex-col justify-center items-center min-h-screen'>
//         <div className="text-center mb-8">
//             <h1 className="mt-4 text-5xl font-bold mb-5">EduConnect</h1>
//             <p className="mt-2 text-3xl font-semibold">Your Online Tutoring Platform</p>
//         </div>
        
//       <form action="" onSubmit={handleSubmit} className='w-full max-w-lg mb-2'>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Full Name</label>
//             <input type="text" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Email address' value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             required/>
//         </div>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Email</label>
//             <input type="email" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Email address' value={email}
//           onChange={(e) => setEmail(e.target.value)}
// required/>
//         </div>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Password</label>
//             <input type="password" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Password' value={password}
//           onChange={(e) => setPassword(e.target.value)}
// required/>
//         </div>
//         <div class="mb-4">
//             <label htmlFor="" className='block text-xl font-light mb-2'>Register as</label>
//             <select className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100" value={role}
//           onChange={(e) => setRole(e.target.value)}>
//                 <option value="student">Student</option>
//                 <option value="tutor">Tutor</option>
//             </select>
//         </div>
//         {role === 'tutor' && (
//         <div className="mb-4">
//           <div className="mb-4">
//             <label htmlFor="tutor-specialty" className='block text-xl font-light mb-2'>
//               Specialty
//             </label>
//             <input
//               id="tutor-specialty"
//               type="text"
//               value={tutorFields.specialty}
//               onChange={(e) => setTutorFields({ ...tutorFields, specialty: e.target.value })}
//               className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
//               placeholder="E.g., Mathematics, Physics, Programming"
//             />
//           </div>
//           <div className="mb-4">
//             <label htmlFor="tutor-experience" className='block text-xl font-light mb-2'>
//               Years of Experience
//             </label>
//             <input
//               id="tutor-experience"
//               type="number"
//               min="0"
//               value={tutorFields.experience}
//               onChange={(e) => setTutorFields({ ...tutorFields, experience: e.target.value })}
//               className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
//               placeholder="Years of teaching experience"
//             />
//           </div>
//         </div>
//       )}
//         <div className="mb-4">
//             <button type='submit' className="bg-emerald-800 text-white w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ">
//                 Register
//             </button>
//         </div>
//       </form>
//       <div className='flex text-base gap-2'>
//         <h2>Already have an account?</h2>
//         <Link to='/login' className='underline text-blue-700 text-lg -mt-1'>Login</Link>
//       </div>
//     </div>
//   )
// }

// export default RegisterForm
