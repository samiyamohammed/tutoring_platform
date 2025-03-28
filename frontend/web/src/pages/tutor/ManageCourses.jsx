import { useState } from "react";
import { FaUserGraduate,FaCalendarAlt,FaEdit } from "react-icons/fa";
import { GrView } from "react-icons/gr";
import { MdDelete } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import Modal from 'react-modal'
import CreateCourseModal from './CreateCourseModal'
import EditCourseModal from './EditCourseModal'


const ManageCourses = () => {
  
  const [courses,setCourses] = useState([
    {
      title: 'Advanced Mathematics',
      students: 15,
      days: 'Mon, Wed, Fri',
      status: 'Active',
      description:"Fundamentals of calculus,thermodynamics and electromagnetism",
    },
    {
      title: 'Intro to Programming',
      students: 24,
      days: 'Tue, Thu',
      status: 'Active',
      description:"Fundamentals of calculus,thermodynamics and electromagnetism",
    },
    {
      title: 'Physics 101',
      students: 18,
      days: 'Mon, Wed',
      status: 'Active',
      description:"Fundamentals of calculus,thermodynamics and electromagnetism",
    },
  ]);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); 

  const openCreateModal = () => {
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course); 
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedCourse(null); 
  };

  const handleCreateCourseSubmit = (newCourse) => {
    setCourses([...courses,newCourse]); 
    closeCreateModal(); 
  };

  const handleUpdateCourse = (updatedCourse) => {
    setCourses(courses.map((course)=>
      course.title === updatedCourse.title ? updatedCourse : course
    ))
    // console.log(updatedCourse); 
    closeEditModal(); 
  };

  const handleDeleteCourse = (courseIndex) => {
    const updatedCourses = courses.filter((_, index) => index !== courseIndex);
    setCourses(updatedCourses);
  };
  

  return (
    <div className='bg-white p-6'>
        <h1 className="text-2xl font-bold mb-4">Manage Courses</h1>
        <div className='flex flex-col'>
            <div className='flex justify-end mb-3'>
                <button onClick={openCreateModal} className="bg-blue-500 text-white px-4 py-2 rounded my-5 flex text-2xl gap-1"><FaPlus className="mt-1"/>Create Course </button>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center gap-4'>
                {courses.map((course,index)=>(
                    <div key={index} className='w-full h-[24rem] max-w-xl border border-gray-200 rounded-2xl flex flex-col shadow-md bg-gray-100'>
                        <div className='h-32 w-full bg-[#145D52] rounded-2xl relative'>
                            <h1 className='absolute text-white text-2xl font-bold left-[2rem] bottom-6'>{course.title}</h1>
                        </div>

                        <div className="p-6 mt-4">
                          <div className="flex justify-between mb-5">
                              <p className="flex text-2xl gap-1"><FaUserGraduate/><span className="-mt-1">{course.students}</span></p>
                              <p className="flex text-2xl gap-1"><FaCalendarAlt/><span className="-mt-1">{course.days}</span></p>
                          </div>
                          <div className="mb-6">
                            <p className="text-lg font-semibold text-pretty">{course.description}</p>
                          </div>
                          <div className="flex justify-between ">
                            <div className="flex gap-6">
                              <button onClick={()=>openEditModal(course)} className="flex text-2xl gap-2 bg-[#2563eb] hover:bg-blue-800 text-white px-2 py-1 rounded"><FaEdit className="mt-1"/>Edit</button>
                              <button className="flex text-2xl gap-2 bg-[#56746ecc] hover:bg-gray-600 text-white px-2 py-1 rounded"><GrView className="mt-1"/>View</button>
                            </div>
                            <div>
                              <button onClick={() => handleDeleteCourse(index)} className="text-3xl text-white bg-[#ef4444] p-2 rounded"><MdDelete/></button>
                            </div>
                          </div>

                        </div>
                    </div>
                    
                ))}
            </div>
        </div>
                
          {/* Modal for creating a new course */}
      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={closeCreateModal}
        contentLabel="Create Course Modal"
        ariaHideApp={false}
        className="w-[40rem] m-auto my-20 p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-xl font-bold mb-4 text-black">Create New Course</h2>
        <CreateCourseModal onSubmit={handleCreateCourseSubmit} onClose={closeCreateModal} />
      </Modal>

      {/* Edit Course Modal */}
      {selectedCourse && (
        <EditCourseModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          course={selectedCourse}
          onSubmit={handleUpdateCourse}
        />
      )}
    </div>
    
  );
};

export default ManageCourses;