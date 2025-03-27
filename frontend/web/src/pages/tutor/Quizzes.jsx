import {useState} from 'react'
import FilterBar from './FilterBar';
import QuizCard from './QuizCard';
import { FaPlus } from "react-icons/fa6";

const Quizzes = () => {

    const quizzesData = [
        {
          id: 1,
          title: "Calculus Midterm Review",
          dueDate: "Jun 20, 2023",
          duration: 60,
          course: "Advanced Mathematics",
          questions: 25,
          status: "Active",
        },
        {
          id: 2,
          title: "Python Syntax Quiz",
          dueDate: null,
          duration: 30,
          course: "Intro to Programming",
          questions: 15,
          status: "Draft",
        },
        {
          id: 3,
          title: "Mechanics Quiz 2",
          dueDate: "Jun 25, 2023",
          duration: 45,
          course: "Physics 101",
          questions: 20,
          status: "Scheduled",
        },
      ];

  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = quizzesData.filter((quiz) => {
    return (
      (courseFilter === "" || quiz.course === courseFilter) &&
      (statusFilter === "" || quiz.status === statusFilter) &&
      (searchQuery === "" || quiz.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

      
  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-4">Quizzes</h1>
      <div className='flex justify-end mb-3'>
        <button className="bg-blue-500 text-white px-4 py-2 rounded my-5 flex text-2xl gap-1"><FaPlus className="mt-1"/>Create Quiz </button>
     </div>
      <FilterBar
        setCourseFilter={setCourseFilter}
        setStatusFilter={setStatusFilter}
        setSearchQuery={setSearchQuery}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center gap-4">
        {filteredQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </div>
  )
}

export default Quizzes
