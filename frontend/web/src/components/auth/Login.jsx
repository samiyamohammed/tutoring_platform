import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Simulate login (replace with API call in real app)
    if (email === 'student@example.com' && password === 'student123') {
      onLogin(email, 'student');
      navigate('/student/dashboard'); // Redirect to student dashboard
    } else if (email === 'tutor@example.com' && password === 'tutor123') {
      onLogin(email, 'tutor');
      navigate('/tutor/dashboard'); // Redirect to tutor dashboard
    } else if (email === 'admin@example.com' && password === 'admin123') {
      onLogin(email, 'admin');
      navigate('/admin/dashboard'); // Redirect to admin dashboard
    } else {
      setError('Invalid email or password.');
    }
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
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center">
            <input type="checkbox" className="size-5 rounded bg-white" />
            <label htmlFor="remember-me" className="ml-2 block text-base">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-base font-medium text-blue-700 underline">
            Forgot password?
          </Link>
        </div>
        <div className="mb-4">
          <button
            type="submit"
            className="bg-emerald-800 text-white w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Sign in
          </button>
        </div>
      </form>
      <div className="flex text-base gap-2">
        <h2>Don't have an account?</h2>
        <Link to="/register" className="underline text-blue-700 text-lg -mt-1">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
























// import {useState} from 'react'
// import { Link } from 'react-router-dom'

// const LoginForm = ({ onLogin }) => {

//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onLogin(email, password);
//     };

//   return (
//     <div className='bg-white h-screen flex flex-col justify-center items-center min-h-screen'>
//         <div className="text-center mb-8">
//             <h1 className="mt-4 text-5xl font-bold mb-5">EduConnect</h1>
//             <p className="mt-2 text-3xl font-semibold">Your Online Tutoring Platform</p>
//         </div>
//       <form action="" onSubmit={handleSubmit} className='w-full max-w-lg mb-2'>
//       <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Email</label>
//             <input type="email" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Email address' />
//         </div>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Password</label>
//             <input type="password" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Password'/>
//         </div>
//         <div className="flex items-center justify-between mb-10">
//             <div className="flex items-center">
//                 <input type="checkbox" className="size-5 rounded bg-white"/>
//                 <label htmlFor="" className="ml-2 block text-base">Remember me</label>
//             </div>
//             <Link className="text-base font-medium text-blue-700 underline">Forgot password?</Link>
//         </div>
//         <div className="mb-4">
//             <button className="bg-emerald-800 text-white w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ">
//                 Sign in
//             </button>
//         </div>
//       </form>
//       <div className='flex text-base gap-2'>
//         <h2>Don't have an account?</h2>
//         <Link to='/register' className='underline text-blue-700 text-lg -mt-1'>Register</Link>
//       </div>
//     </div>
//   )
// }

// export default LoginForm