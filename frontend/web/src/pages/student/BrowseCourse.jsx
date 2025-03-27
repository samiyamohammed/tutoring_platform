import React from "react";
import FilterSidebar from "./FilterSidebar";
import CourseCard from "./CourseCard";

const courses = [
  {
    title: "Data Science Fundamentals",
    instructor: "Prof. Alex Thompson",
    modules: 14,
    hours: 36,
    rating: "4.8 ⭐",
    reviews: 124,
    level: "Beginner",
    category: "Data Science",
    tags: ["Python"]
  },
  {
    title: "Advanced Algorithms",
    instructor: "Dr. Elena Rodriguez",
    modules: 12,
    hours: 30,
    rating: "4.9 ⭐",
    reviews: 89,
    level: "Advanced",
    category: "Algorithms",
    tags: ["Computer Science"]
  },
  {
    title: "Organic Chemistry",
    instructor: "Prof. David Lee",
    modules: 16,
    hours: 40,
    rating: "4.7 ⭐",
    reviews: 112,
    level: "Intermediate",
    category: "Chemistry",
    tags: ["Laboratory"]
  },
  {
    title: "Machine Learning Basics",
    instructor: "Prof. James Wilson",
    modules: 10,
    hours: 28,
    rating: "4.6 ⭐",
    reviews: 205,
    level: "Beginner",
    category: "ML",
    tags: ["AI"]
  },
  {
    title: "Calculus II",
    instructor: "Dr. Emily Chen",
    modules: 15,
    hours: 42,
    rating: "4.8 ⭐",
    reviews: 176,
    level: "Intermediate",
    category: "Mathematics",
    tags: ["Calculus"]
  },
  {
    title: "Quantum Physics",
    instructor: "Prof. Richard Barnes",
    modules: 18,
    hours: 50,
    rating: "4.9 ⭐",
    reviews: 142,
    level: "Advanced",
    category: "Physics",
    tags: ["Quantum"]
  }
];

const BrowseCourse = () => {
  return (
    <section id="browse-courses" className="mb-8">
      <h1 className="text-2xl font-bold mb-6">Browse Courses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar />
        </div>

        {/* Courses Section */}
        <div className="lg:col-span-3">
          {/* Featured Courses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </div>
          </div>

          {/* Popular Courses */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Popular Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(3).map((course, index) => (
                <CourseCard key={index} {...course} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrowseCourse;
