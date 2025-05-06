import CourseService from "../../application/services/CourseService.js";
import Course from "../../domain/models/Course.js";
import gfs from '../../utils/gfs.js';

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

  async update(req, res) {
    try {
      const course = await CourseService.updateCourse(req.params.id, req.user._id, req.body);
      res.status(200).json(course);
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await CourseService.deleteCourse(req.params.id, req.user._id);
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async addModule(req, res) {
    try {
      const { courseId } = req.params;
      const { title, content, order, isPublished, sections } = req.body;
  
      const parsedSections = typeof sections === 'string' ? JSON.parse(sections) : sections;
      
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });
  
      const processedSections = [];
      let fileIndex = 0;
  
      for (const section of parsedSections) {
        const baseSection = {
          title: section.title,
          order: section.order,
          type: section.type
        };
  
        let fullSection;
        switch(section.type) {
          case 'text':
            fullSection = {
              ...baseSection,
              content: section.content
            };
            break;
            
          case 'video':
            fullSection = {
              ...baseSection,
              videoUrl: req.fileIds && req.fileIds[fileIndex] 
                ? `/api/files/${req.fileIds[fileIndex]}`
                : null
            };
            if (req.fileIds && req.fileIds[fileIndex]) fileIndex++;
            break;
            
          case 'pdf':
            fullSection = {
              ...baseSection,
              pdfUrl: req.fileIds && req.fileIds[fileIndex] 
                ? `/api/files/${req.fileIds[fileIndex]}`
                : null
            };
            if (req.fileIds && req.fileIds[fileIndex]) fileIndex++;
            break;
            
          case 'quiz':
            fullSection = {
              ...baseSection,
              quiz: {
                title: section.quiz.title,
                order: section.quiz.order || 1,
                duration: section.quiz.duration || 30,
                isPublished: section.quiz.isPublished || false,
                questions: section.quiz.questions.map(q => ({
                  questionText: q.questionText,
                  questionType: q.questionType,
                  options: q.options,
                  correctAnswers: q.correctAnswers,
                  points: q.points || 1,
                  explanation: q.explanation || ""
                }))
              }
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
        isPublished: isPublished === 'true',
        sections: processedSections
      };
  
      course.modules.push(newModule);
      await course.save();
  
      res.status(201).json({
        message: 'Module added successfully',
        module: newModule
      });
  
    } catch (err) {
      console.error('Error in addModule:', err);
      res.status(500).json({
        error: err.message || 'Failed to add module'
      });
    }
  }

  // Get all modules in a course (with file URLs)
  async getModules(req, res) {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });

      // Map modules to include proper file URLs
      const modulesWithUrls = course.modules.map(module => {
        return {
          ...module.toObject(),
          sections: module.sections.map(section => {
            if (section.type === 'video' || section.type === 'pdf') {
              return {
                ...section.toObject(),
                url: section.fileId ? `/api/files/${section.fileId}` : section.videoUrl || section.pdfUrl
              };
            }
            return section.toObject();
          })
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
      if (!course) return res.status(404).json({ error: 'Course not found' });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: 'Module not found' });

      // Add proper file URLs
      const moduleWithUrls = {
        ...module.toObject(),
        sections: module.sections.map(section => {
          if (section.type === 'video' || section.type === 'pdf') {
            return {
              ...section.toObject(),
              url: section.fileId ? `/api/files/${section.fileId}` : section.videoUrl || section.pdfUrl
            };
          }
          return section.toObject();
        })
      };

      res.json(moduleWithUrls);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Update module (with file handling)
  async updateModule(req, res) {
    try {
      const { courseId, moduleId } = req.params;
      const updates = req.body;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: 'Module not found' });

      // Handle file updates if needed
      if (updates.sections && Array.isArray(updates.sections)) {
        for (let i = 0; i < updates.sections.length; i++) {
          const updatedSection = updates.sections[i];
          const existingSection = module.sections[i];

          if (existingSection && ['video', 'pdf'].includes(existingSection.type)) {
            // Keep existing file if not being updated
            if (!updatedSection.fileId && !updatedSection.videoUrl && !updatedSection.pdfUrl) {
              updatedSection.fileId = existingSection.fileId;
              updatedSection.videoUrl = existingSection.videoUrl;
              updatedSection.pdfUrl = existingSection.pdfUrl;
            }
          }
        }
      }

      module.set(updates);
      await course.save();

      res.json({
        message: 'Module updated successfully',
        module: module.toObject()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // Delete module (with file cleanup)
  async deleteModule(req, res) {
    try {
      const { courseId, moduleId } = req.params;

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });

      const module = course.modules.id(moduleId);
      if (!module) return res.status(404).json({ error: 'Module not found' });

      // Delete GridFS files linked to video/pdf sections
      for (const section of module.sections) {
        if (['video', 'pdf'].includes(section.type)) {
          try {
            if (section.fileId) {
              await gfs.delete(new mongoose.Types.ObjectId(section.fileId));
            }
          } catch (err) {
            console.warn(`Could not delete GridFS file ${section.fileId}: ${err.message}`);
          }
        }
      }

      module.remove();
      await course.save();

      res.json({ message: 'Module deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}


export default new CourseController();