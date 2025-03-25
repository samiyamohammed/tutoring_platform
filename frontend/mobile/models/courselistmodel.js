import { Course } from "./coursemodel";
import { Tutor } from "./tutormodel";

export const filters = ["Saved Courses", "In Progress", "Completed"];

export const tutor1 = new Tutor(
  "1",
  "John Doe",
  require("../assets/ladyprofile.jpg"),
  "5 years",
  4.8
);
export const tutor2 = new Tutor(
  "2",
  "Jane Smith",
  require("../assets/ladyprofile.jpg"),
  "3 years",
  4.7
);

export const CourseList = [
  new Course(
    "1",
    "UI/UX Design Essentials",
    "Tech Innovations University",
    4.9,
    require("../assets/courseimage.jpg"),
    79,
    "Saved Courses",
    3457,
    tutor1
  ),
  new Course(
    "2",
    "Graphic Design Fundamentals",
    "Creative Arts Institute",
    4.7,
    require("../assets/courseimage.jpg"),
    35,
    "In Progress",
    1457,
    tutor2
  ),
  new Course(
    "3",
    "Web Development Basics",
    "Code Academy",
    4.8,
    require("../assets/courseimage.jpg"),
    50,
    "Completed",
    5679,
    tutor1
  ),
  new Course(
    "4",
    "Advanced Photoshop Techniques",
    "Visual Arts School",
    4.6,
    require("../assets/courseimage.jpg"),
    60,
    "Saved Course",
    5389,
    tutor2
  ),
  new Course(
    "5",
    "Mobile App UI Design",
    "App Design Institute",
    4.9,
    require("../assets/courseimage.jpg"),
    85,
    "In Progress",
    2987,
    tutor1
  ),
];
