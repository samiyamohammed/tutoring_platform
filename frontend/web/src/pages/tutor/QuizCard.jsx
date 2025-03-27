import { FaUserGraduate,FaCalendarAlt,FaEdit } from "react-icons/fa";
import { GrView } from "react-icons/gr";

const QuizCard = ({ quiz }) => {
  return (        
    <div className='w-full h-[24rem] max-w-xl border border-gray-200 rounded-2xl flex flex-col shadow-md bg-gray-100 my-10'>
        <div className='h-32 w-full bg-[#177063ea] rounded-2xl relative'>
            <h1 className='absolute text-white text-2xl font-bold left-[2rem] bottom-6'>{quiz.title}</h1>
        </div>

        <div className="p-6 ">
            <div className="flex justify-between font-extralight">
                <p className="flex text-2xl gap-1"><FaUserGraduate/><span className="-mt-1">Due: {quiz.dueDate || "Not scheduled"}</span></p>
                <p className="flex text-2xl gap-1"><FaCalendarAlt/><span className="-mt-1">{quiz.duration} mins</span></p>
            </div>
            <div className="font-extralight my-3">
            <p className="text-2xl text-pretty">{quiz.questions} questions</p>
            <p className="text-2xl text-pretty my-3">Course: <span className="flex flex-wrap">{quiz.course}</span></p>
            <div className="flex justify-between gap-6 my-3">
                <div className="flex gap-2 mt-5">
                    <button className="flex text-2xl gap-2 bg-[#2563eb] hover:bg-blue-800 text-white px-2 py-1 rounded"><FaEdit className="mt-1"/>Edit</button>
                    <button className="flex text-2xl gap-2 bg-[#56746ecc] hover:bg-gray-600 text-white px-2 py-1 rounded"><GrView className="mt-1"/>View</button>
                </div>

                <div className="mt-6 text-xl">
                    {quiz.status === "Draft" ? (
                    <button className="bg-green-600 px-3 py-1 rounded">Publish</button>
                    ) : quiz.status === "Scheduled" ? (
                    <button className="bg-orange-500 px-3 py-1 rounded">Reschedule</button>
                    ) : (
                    <button className="bg-green-500 px-3 py-1 rounded">Grade</button>
                    )}
                </div>

            </div>
            </div>
            
            

        </div>
    </div>
            
  );
};

export default QuizCard;
