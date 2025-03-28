import { MdEmail } from "react-icons/md";
import { PiPhoneFill } from "react-icons/pi";
import { MdLocationOn } from "react-icons/md";
import { FaStar } from "react-icons/fa";

const ProfileOverview = () => {

    // Reusable Profile Detail component
    const ProfileDetail = ({ icon, text }) => (
        <div className="flex items-center text-[#146356] gap-3 ">
        <div className="w-8">
            {icon} 
        </div>
        <span className="text-2xl">{text}</span>
        </div>
    );

  return (
    <div className="border border-green-200 rounded-lg shadow-md overflow-hidden">
      <div className="bg-[#146356] p-8 text-white text-center">
        <div className="w-24 h-24 rounded-full bg-white text-primary mx-auto flex items-center justify-center font-bold text-3xl">
          JD
        </div>
        <h2 className="text-xl font-bold mt-4">John Doe</h2>
        <p className="text-lg opacity-80">Mathematics & Programming Tutor</p>
      </div>
      <div className="p-4 pt-10">
        <div className="flex flex-col gap-5 ">
          <ProfileDetail icon={<MdEmail size={30}/>} text="john.doe@example.com" />
          <ProfileDetail icon={<PiPhoneFill size={30}/>} text="(555) 123-4567" />
          <ProfileDetail icon={<MdLocationOn size={30}/>} text="New York, NY" />
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-xl mb-2">
            Expertise
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Calculus", "Linear Algebra", "Differential Equations", "Python", "Java", "Physics"].map(
              (skill, index) => (
                <span
                  key={index}
                  className="bg-green-500 px-2 py-1 rounded text-base text-white"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-2xl mb-2">
            Rating
          </h3>
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              <FaStar className="fas fa-star"/>
              <FaStar className="fas fa-star"/>
              <FaStar className="fas fa-star"/>
              <FaStar className="fas fa-star"/>
              <FaStar className="fas fa-star-half-alt"/>
            </div>
            <span className="ml-2">
              4.5/5 (28 reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};



export default ProfileOverview;
