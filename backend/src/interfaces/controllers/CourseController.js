import CourseService from "../../application/services/CourseService.js";
import Course from "../../domain/models/Course.js";
import gfs from "../../utils/gfs.js";

class CourseController {
  async create(req, res) {
    try {
      req.body.tutor = req.user._id;
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

  async getTutorCourses(req, res) {
    try {
      const tutorId = req.user._id;
      const courses = await CourseService.getTutorCourses(tutorId);
      res.status(200).json(courses);
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
      const { title, content, order, isPublished, sections } = req.body;

      const parsedSections =
        typeof sections === "string" ? JSON.parse(sections) : sections;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const processedSections = [];
      let fileIndex = 0;

      for (const section of parsedSections) {
        const baseSection = {
          title: section.title,
          order: section.order,
          type: section.type,
        };

        let fullSection;
        switch (section.type) {
          case "text":
            fullSection = {
              ...baseSection,
              content: section.content,
            };
            break;

          case "video":
            fullSection = {
              ...baseSection,
              videoUrl:
                req.fileIds && req.fileIds[fileIndex]
                  ? `/api/files/${req.fileIds[fileIndex]}`
                  : null,
            };
            if (req.fileIds && req.fileIds[fileIndex]) fileIndex++;
            break;

          case "pdf":
            fullSection = {
              ...baseSection,
              pdfUrl:
                req.fileIds && req.fileIds[fileIndex]
                  ? `/api/files/${req.fileIds[fileIndex]}`
                  : null,
            };
            if (req.fileIds && req.fileIds[fileIndex]) fileIndex++;
            break;

          case "quiz":
            fullSection = {
              ...baseSection,
              quiz: {
                title: section.quiz.title,
                order: section.quiz.order || 1,
                duration: section.quiz.duration || 30,
                isPublished: section.quiz.isPublished || false,
                questions: section.quiz.questions.map((q) => ({
                  questionText: q.questionText,
                  questionType: q.questionType,
                  options: q.options,
                  correctAnswers: q.correctAnswers,
                  points: q.points || 1,
                  explanation: q.explanation || "",
                })),
              },
            };
            break;

          default:
            throw new Error(`Unknown section type: ${section.type}`);
        }

        processedSections.push(fullSection);
      }

      const newModule = {
        title,
        content,
        order: Number(order),
        isPublished: isPublished === "true",
        sections: processedSections,
      };

      course.modules.push(newModule);
      await course.save();

      res.status(201).json({
        message: "Module added successfully",
        module: newModule,
      });
    } catch (err) {
      console.error("Error in addModule:", err);
      res.status(500).json({
        error: err.message || "Failed to add module",
      });
    }
  }

  // Get all modules in a course (with file URLs)
  async getModules(req, res) {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      // Map modules to include proper file URLs
      const modulesWithUrls = course.modules.map((module) => {
        return {
          ...module.toObject(),
          sections: module.sections.map((section) => {
            if (section.type === "video" || section.type === "pdf") {
              return {
                ...section.toObject(),
                url: section.fileId
                  ? `/api/files/${section.fileId}`
                  : section.videoUrl || section.pdfUrl,
              };
            }
            return section.toObject();
          }),
        };
      });

      res.json(modulesWithUrls);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Get a single module by ID (with file URLs)
  async getModuleById(req, res) {
    try {
      const { courseId, moduleId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: "Module not found" });

      // Add proper file URLs
      const moduleWithUrls = {
        ...module.toObject(),
        sections: module.sections.map((section) => {
          if (section.type === "video" || section.type === "pdf") {
            return {
              ...section.toObject(),
              url: section.fileId
                ? `/api/files/${section.fileId}`
                : section.videoUrl || section.pdfUrl,
            };
          }
          return section.toObject();
        }),
      };

      res.json(moduleWithUrls);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Update module (with file handling)
  // In CourseController.js - updateModule method
  async updateModule(req, res) {
    try {
      const { courseId, moduleId } = req.params;
      const { title, content, order, isPublished, sections } = req.body;

      const parsedSections =
        typeof sections === "string" ? JSON.parse(sections) : sections;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: "Module not found" });

      // Track file indices for new uploads
      let fileIndex = 0;
      const processedSections = [];

      // Process each section
      for (let i = 0; i < parsedSections.length; i++) {
        const sectionUpdate = parsedSections[i];
        const existingSection = module.sections[i] || {};

        const baseSection = {
          title: sectionUpdate.title,
          order: sectionUpdate.order,
          type: sectionUpdate.type,
          description: sectionUpdate.description || existingSection.description,
        };

        let fullSection;

        switch (sectionUpdate.type) {
          case "text":
            fullSection = {
              ...baseSection,
              content: sectionUpdate.content,
            };
            break;

          case "video":
            // Keep existing video if no new file is uploaded
            if (req.fileIds && req.fileIds[fileIndex]) {
              fullSection = {
                ...baseSection,
                videoUrl: `/api/files/${req.fileIds[fileIndex]}`,
                content: sectionUpdate.content || "",
              };
              fileIndex++;
            } else if (sectionUpdate.content) {
              // Use URL if provided
              fullSection = {
                ...baseSection,
                videoUrl: null,
                content: sectionUpdate.content,
              };
            } else {
              // Keep existing video
              fullSection = {
                ...baseSection,
                videoUrl: existingSection.videoUrl,
                content: existingSection.content || "",
              };
            }
            break;

          case "pdf":
            if (req.fileIds && req.fileIds[fileIndex]) {
              fullSection = {
                ...baseSection,
                pdfUrl: `/api/files/${req.fileIds[fileIndex]}`,
              };
              fileIndex++;
            } else {
              // Keep existing PDF
              fullSection = {
                ...baseSection,
                pdfUrl: existingSection.pdfUrl,
              };
            }
            break;

          case "quiz":
            fullSection = {
              ...baseSection,
              quiz: {
                title: sectionUpdate.quiz.title,
                order: sectionUpdate.quiz.order || 1,
                duration: sectionUpdate.quiz.duration || 30,
                isPublished: sectionUpdate.quiz.isPublished || false,
                questions: sectionUpdate.quiz.questions.map((q) => ({
                  questionText: q.questionText,
                  questionType: q.questionType,
                  options: q.options,
                  correctAnswers: q.correctAnswers,
                  points: q.points || 1,
                  explanation: q.explanation || "",
                })),
              },
            };
            break;

          default:
            throw new Error(`Unknown section type: ${sectionUpdate.type}`);
        }

        processedSections.push(fullSection);
      }

      // Update module
      module.title = title;
      module.content = content;
      module.order = Number(order);
      module.isPublished = isPublished === "true";
      module.sections = processedSections;

      await course.save();

      res.json({
        message: "Module updated successfully",
        module: module.toObject(),
      });
    } catch (err) {
      console.error("Error updating module:", err);
      res.status(500).json({
        error: err.message || "Failed to update module",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }

  // Delete module (with file cleanup)
  // In CourseController.js - deleteModule method
  async deleteModule(req, res) {
    try {
      const { courseId, moduleId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: "Module not found" });

      // Delete all associated files from GridFS
      const deletePromises = [];

      for (const section of module.sections) {
        if (section.type === "video" && section.videoUrl) {
          const fileId = section.videoUrl.split("/").pop();
          if (mongoose.Types.ObjectId.isValid(fileId)) {
            deletePromises.push(
              gfs
                .delete(new mongoose.Types.ObjectId(fileId))
                .catch((err) =>
                  console.warn(`Failed to delete video ${fileId}:`, err)
                )
            );
          }
        }

        if (section.type === "pdf" && section.pdfUrl) {
          const fileId = section.pdfUrl.split("/").pop();
          if (mongoose.Types.ObjectId.isValid(fileId)) {
            deletePromises.push(
              gfs
                .delete(new mongoose.Types.ObjectId(fileId))
                .catch((err) =>
                  console.warn(`Failed to delete PDF ${fileId}:`, err)
                )
            );
          }
        }
      }

      // Wait for all file deletions to complete (but don't fail if some fail)
      await Promise.all(deletePromises);

      // Remove the module
      module.remove();
      await course.save();

      res.json({
        message: "Module deleted successfully",
        deletedFiles: deletePromises.length,
      });
    } catch (err) {
      console.error("Error deleting module:", err);
      res.status(500).json({
        error: err.message || "Failed to delete module",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    }
  }

  async createFinalExam(req, res) {
    try {
      const { courseId } = req.params;
      const finalExam = req.body;
      const updatedCourse = await CourseService.addFinalExam(
        courseId,
        finalExam
      );
      res.status(201).json(updatedCourse.finalExam);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getFinalExam(req, res) {
    try {
      const { courseId } = req.params;
      const course = await CourseService.getCourseById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json(course.finalExam);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateFinalExam(req, res) {
    try {
      const { courseId } = req.params;
      const finalExamUpdates = req.body;
      const updatedCourse = await CourseService.updateFinalExam(
        courseId,
        finalExamUpdates
      );
      res.json(updatedCourse.finalExam);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteFinalExam(req, res) {
    try {
      const { courseId } = req.params;
      const updatedCourse = await CourseService.deleteFinalExam(courseId);
      res.json({ message: "Final exam deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createAssessment(req, res) {
    try {
      const { courseId } = req.params;
      const assessmentData = req.body;
      const updatedCourse = await CourseService.addAssessment(
        courseId,
        assessmentData
      );
      res.status(201).json(updatedCourse.assessment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAssessment(req, res) {
    try {
      const { courseId } = req.params;
      const course = await CourseService.getCourseById(courseId);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.json(course.assessment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateAssessment(req, res) {
    try {
      const { courseId } = req.params;
      const assessmentUpdates = req.body;
      const updatedCourse = await CourseService.updateAssessment(
        courseId,
        assessmentUpdates
      );
      res.json(updatedCourse.assessment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteAssessment(req, res) {
    try {
      const { courseId } = req.params;
      const updatedCourse = await CourseService.deleteAssessment(courseId);
      res.json({ message: "Assessment deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CourseController();
