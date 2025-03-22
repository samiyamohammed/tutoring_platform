import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <div className="bg-[#1C9381] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-10 mx-0.5">
      <div className="text-white text-xl " >
        <h1 className="mb-8">About & Mission</h1>
        <div className="flex flex-col text-base gap-5 ml-4" >
            <Link className="underline">About Us</Link>
            <Link className="underline">📧Email: support@zplatform.com</Link>
            <Link className="underline">📞 Phone: +123 456 7890</Link>
        </div>
      </div>
      
      <div className="text-white text-xl " >
        <h1 className="mb-8">For Students</h1>
        <div className="flex flex-col text-base gap-5 ml-4" >
            <Link className="underline">Find a tutor</Link>
            <Link className="underline">Browse Courses</Link>
            <Link className="underline">How it works</Link>
            <Link className="underline">Browse Courses</Link>
        </div>
      </div>

      <div className="text-white text-xl " >
        <h1 className="mb-8">For Tutors</h1>
        <div className="flex flex-col text-base gap-5 ml-4" >
            <Link className="underline">Become a tutor</Link>
            <Link className="underline">Tutor Guidelines</Link>
            <Link className="underline">Payment and Earnings</Link>
        </div>
      </div>
      
      <div className="text-white text-xl " >
        <h1 className="mb-8"> Newsletter Subscription</h1>
        <div className="flex flex-col text-base gap-5 ml-4" >
            <p className="text-lg" >Get the latest tutoring insights & courses!</p>
            <form action="">
                <input type="email" placeholder="Enter your email" className="bg-gray-100 text-black w-full rounded-full px-5 py-3"/>
                <button className="bg-[#d6d31c] text-white p-2 mt-3 mx-40 w-28 rounded-xl">Subscribe</button>
            </form>
        </div>
      </div>
      
    </div>
  )
}

export default Footer
