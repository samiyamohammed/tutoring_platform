import CourseService from "../../application/services/CourseService.js";

class CourseController {
  async create(req, res) {
    try {
      req.body.tutor = req.user._id; // Assign tutor ID
      console.log(req.user._id);
      const course = await CourseService.createCourse(req.body);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCourses(req, res) {
    try {
      const courses = await CourseService.getCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCourseById(req, res) {
    try {
      const course = await CourseService.getCourseById(req.params.id);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const course = await CourseService.updateCourse(
        req.params.id,
        req.user._id,
        req.body
      );
      res.status(200).json(course);
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await CourseService.deleteCourse(req.params.id, req.user._id);
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }
}

export default new CourseController();
