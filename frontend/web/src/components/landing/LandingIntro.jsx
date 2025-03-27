import ellipse1 from '../../assets/Ellipse1.png'
import ellipse2 from '../../assets/Ellipse2.png'
import Nav from '../../layout/Nav'

const LandingIntro = () => {
  return (
    <div className='relative '>
        <Nav/>

      <div className='absolute top-0 right-0'>
        <img src={ellipse1} alt="" />
      </div>

      <div className='absolute top-0 right-0'>
        <img src={ellipse2} alt="" />
      </div>

    </div>
  )
}

export default LandingIntro




// const LandingPage = () => {
//   return (
//     <div className="relative min-h-screen bg-white">
//       {/* Top Right Design */}
//       <div className="absolute top-0 right-0 w-64 h-64 bg-green-900 rounded-bl-full"></div>
//       <div className="absolute top-0 right-0 w-56 h-56 bg-green-700 rounded-bl-full"></div>

//       {/* Navbar */}
//       <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
//         <div className="flex space-x-6 text-gray-700">
//           <a href="#" className="hover:text-green-600">Home</a>
//           <a href="#" className="hover:text-green-600">Courses</a>
//           <a href="#" className="hover:text-green-600">About Us</a>
//           <a href="#" className="hover:text-green-600">Contact</a>
//         </div>
//         <button className="px-4 py-2 text-white bg-green-800 rounded-full">Sign In</button>
//       </nav>

//       {/* Hero Section */}
//       <div className="text-center max-w-3xl mx-auto mt-20 px-4">
//         <h1 className="text-4xl font-bold text-gray-800">
//           Learn, Teach, Connect – Anytime, Anywhere!
//         </h1>
//         <p className="text-gray-600 mt-4">
//           Enroll in courses, find the perfect tutor, or start tutoring today!
//         </p>

//         {/* Buttons */}
//         <div className="mt-6 flex justify-center space-x-4">
//           <button className="px-6 py-2 bg-green-600 text-white rounded-full">Find a Tutor</button>
//           <button className="px-6 py-2 bg-green-700 text-white rounded-full">Become a Tutor</button>
//           <button className="px-6 py-2 bg-green-800 text-white rounded-full">Browse Courses</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;
