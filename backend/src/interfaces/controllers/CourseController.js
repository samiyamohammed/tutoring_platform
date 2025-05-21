import CourseService from "../../application/services/CourseService.js";
import Course from "../../domain/models/Course.js";

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

  async addModule(req, res) {
    try {
      const { courseId } = req.params;
      const moduleData = req.body;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      course.modules.push(moduleData);
      await course.save();

      res
        .status(201)
        .json({ message: "Module added to course", modules: course.modules });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get all modules in a course
  async getModules(req, res) {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      res.json(course.modules);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get a single module by its ID from a course
  async getModuleById(req, res) {
    try {
      const { courseId, moduleId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: "Module not found" });

      res.json(module);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Update a module in a course
  async updateModule(req, res) {
    try {
      const { courseId, moduleId } = req.params;
      const updates = req.body;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: "Module not found" });

      module.set(updates);
      await course.save();

      res.json({ message: "Module updated", module });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Delete a module from a course
  async deleteModule(req, res) {
    try {
      const { courseId, moduleId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: "Module not found" });

      // Optionally delete GridFS files linked to video/pdf sections
      for (const section of module.sections) {
        if (["video", "pdf"].includes(section.type)) {
          await gfs
            .delete(new mongoose.Types.ObjectId(section.fileId))
            .catch((err) => {
              console.warn(
                `Could not delete GridFS file ${section.fileId}: ${err.message}`
              );
            });
        }
      }

      module.remove();
      await course.save();

      res.json({ message: "Module deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CourseController();
