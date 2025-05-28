import EnrollmentService from "../../application/services/EnrollmentService.js";
import CertificateService from "../../application/services/CertificateService.js";
import Enrollment from "../../domain/models/Enrollment.js";
import Course from "../../domain/models/Course.js";
import mongoose from "mongoose";

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class EnrollmentController {
  constructor() {
    // Bind all methods that will be used as route handlers
    this.enrollStudent = this.enrollStudent.bind(this);
    this.getAllEnrollments = this.getAllEnrollments.bind(this);
    this.getEnrollments = this.getEnrollments.bind(this);
    this.getEnrollmentById = this.getEnrollmentById.bind(this);
    this.getCurrentEnrollment = this.getCurrentEnrollment.bind(this);
    this.getCourseEnrollments = this.getCourseEnrollments.bind(this);
    this.updateEnrollment = this.updateEnrollment.bind(this);
    this.updateEnrollmentStatus = this.updateEnrollmentStatus.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.markSectionComplete = this.markSectionComplete.bind(this);
    this.handleCompletionAndCertificate =
      this.handleCompletionAndCertificate.bind(this);
    this.calculateCourseProgress = this.calculateCourseProgress.bind(this);
    this.getTutorEnrollments = this.getTutorEnrollments.bind(this);
    this.addNoteToSection = this.addNoteToSection.bind(this);
    this.submitQuiz = this.submitQuiz.bind(this);
    this.submitFinalExam = this.submitFinalExam.bind(this);
    this.startFinalExam = this.startFinalExam.bind(this);
    this.submitPreAssessment = this.submitPreAssessment.bind(this);
    this.submitPostAssessment = this.submitPostAssessment.bind(this);
    this.getAssessmentResponses = this.getAssessmentResponses.bind(this);
  }

  async enrollStudent(req, res) {
    try {
      req.body.student = req.user._id;
      const enrollment = await EnrollmentService.enrollStudent(req.body);
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllEnrollments(req, res) {
    try {
      const enrollments = await EnrollmentService.getAllEnrollments();
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getEnrollments(req, res) {
    try {
      const enrollments = await EnrollmentService.getEnrollments(req.user._id);
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getEnrollmentById(req, res) {
    try {
      const enrollment = await EnrollmentService.getEnrollmentById(
        req.params.id
      );
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCurrentEnrollment(req, res) {
    try {
      const enrollment = await EnrollmentService.getCurrentEnrollment(
        req.user._id,
        req.params.courseId
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getCourseEnrollments(req, res) {
    try {
      const enrollment = await EnrollmentService.getCourseEnrollments(
        req.params.id
      );
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEnrollment(req, res) {
    try {
      const enrollment = await EnrollmentService.updateEnrollment(
        req.params.id,
        req.body
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEnrollmentStatus(req, res) {
    try {
      const enrollment = await EnrollmentService.updateEnrollmentStatus(
        req.body.enrollmentId,
        req.body.status
      );
      res.status(200).json(enrollment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProgress(req, res) {
    try {
      const { moduleId, sectionId, timeSpent = 1, markAsStarted } = req.body;

      const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.user._id,
      }).populate("course", "modules");

      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Find the module and section in the course
      const course = enrollment.course;
      const module = course.modules.find((m) => m._id.toString() === moduleId);
      if (!module) {
        throw new NotFoundError("Module not found in course");
      }

      const section = module.sections.find(
        (s) => s._id.toString() === sectionId
      );
      if (!section) {
        throw new NotFoundError("Section not found in module");
      }

      // Update module progress
      let moduleProgress = enrollment.progress.modules.find(
        (m) => m.moduleId.toString() === moduleId
      );
      if (!moduleProgress) {
        moduleProgress = {
          moduleId: module._id,
          status: "started", // Changed from 'in_progress' to 'started'
          startedAt: new Date(),
          timeSpent: 0,
          sections: [],
        };
        enrollment.progress.modules.push(moduleProgress);
      }

      // Update section progress
      let sectionProgress = moduleProgress.sections.find(
        (s) => s.sectionId.toString() === sectionId
      );
      if (!sectionProgress) {
        sectionProgress = {
          sectionId: section._id,
          status: markAsStarted ? "in_progress" : "not_started",
          startedAt: new Date(),
          timeSpent: 0,
        };
        moduleProgress.sections.push(sectionProgress);
      }

      // Update timestamps and time spent
      sectionProgress.lastAccessed = new Date();
      sectionProgress.timeSpent += timeSpent;
      moduleProgress.lastAccessed = new Date();
      moduleProgress.timeSpent += timeSpent;
      enrollment.progress.lastActivity = new Date();
      enrollment.progress.timeSpentTotal += timeSpent;
      enrollment.progress.currentModule = moduleId;
      enrollment.progress.currentSection = sectionId;

      // Update module status if needed
      if (moduleProgress.status === "not_started") {
        moduleProgress.status = "started"; // Changed from 'in_progress' to 'started'
      }

      // Update enrollment status if needed
      if (enrollment.currentStatus === "enrolled") {
        enrollment.currentStatus = "in_progress";
      }

      // Calculate completion percentage
      await this.calculateCourseProgress(enrollment);

      await enrollment.save();
      res.json(enrollment);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async markSectionComplete(req, res) {
    try {
      const { moduleId, sectionId } = req.body;
      const { enrollmentId } = req.params;

      // Validate enrollmentId
      if (!enrollmentId || !mongoose.Types.ObjectId.isValid(enrollmentId)) {
        return res.status(400).json({
          message: "Invalid enrollment ID",
        });
      }
      const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.user._id,
      }).populate({
        path: "course",
        populate: {
          path: "modules.sections",
        },
      });

      if (!enrollment) {
        return res.status(404).json({
          message: "Enrollment not found",
        });
      }

      // Find the module in course
      const module = enrollment.course.modules.id(moduleId);
      if (!module) {
        return res.status(404).json({
          message: "Module not found in course",
        });
      }

      // Find the section in module
      const section = module.sections.id(sectionId);
      if (!section) {
        return res.status(404).json({
          message: "Section not found in module",
        });
      }

      // Find or create module progress
      let moduleProgress = enrollment.progress.modules.find(
        (m) => m.moduleId.toString() === moduleId
      );
      if (!moduleProgress) {
        moduleProgress = {
          moduleId: module._id,
          status: "started",
          startedAt: new Date(),
          timeSpent: 0,
          sections: [],
        };
        enrollment.progress.modules.push(moduleProgress);
      }

      // Find or create section progress
      let sectionProgress = moduleProgress.sections.find(
        (s) => s.sectionId.toString() === sectionId
      );
      if (!sectionProgress) {
        sectionProgress = {
          sectionId: section._id,
          status: "in_progress",
          startedAt: new Date(),
          timeSpent: 0,
        };
        moduleProgress.sections.push(sectionProgress);
      }

      // For quiz sections, verify they passed before marking complete
      if (section.type === "quiz") {
        const quizAssessment = enrollment.progress.assessments?.find(
          (a) =>
            a.sectionId.toString() === sectionId && a.assessmentType === "quiz"
        );

        if (!quizAssessment?.passed) {
          return res.status(400).json({
            message:
              "You must pass the quiz before marking this section complete",
          });
        }
      }

      // Mark section as completed
      sectionProgress.status = "completed";
      sectionProgress.completedAt = new Date();

      // Check if all sections in module are completed
      const allModuleSectionsCompleted = module.sections.every((s) => {
        const sp = moduleProgress.sections.find(
          (sect) => sect.sectionId.toString() === s._id.toString()
        );
        return sp?.status === "completed";
      });

      if (allModuleSectionsCompleted) {
        moduleProgress.status = "completed";
        moduleProgress.completedAt = new Date();
      }

      // Check if all modules are completed
      const allModulesCompleted = enrollment.course.modules.every((m) => {
        const mp = enrollment.progress.modules.find(
          (mod) => mod.moduleId.toString() === m._id.toString()
        );
        return mp?.status === "completed";
      });

      // Update overall progress
      await this.calculateCourseProgress(enrollment);

      // Handle course completion logic
      if (allModulesCompleted) {
        if (enrollment.course.finalExam) {
          if (!enrollment.finalExam) {
            enrollment.finalExam = {
              attempts: [],
              taken: false,
              passed: false,
              bestScore: 0,
            };
          }

          // If exam already passed, mark course as completed
          if (enrollment.finalExam.passed) {
            enrollment.currentStatus = "completed";
            enrollment.actualCompletionDate = new Date();
          }
        } else {
          // If no final exam, mark course as completed when all modules done
          enrollment.currentStatus = "completed";
          enrollment.actualCompletionDate = new Date();
        }
      }

      // Handle certification if course is completed
      if (enrollment.currentStatus === "completed") {
        if (!enrollment.certification) {
          enrollment.certification = {
            eligible: true,
            issued: false,
          };
        }

        // Only generate certificate if eligible and not already issued
        if (
          enrollment.certification.eligible &&
          !enrollment.certification.issued
        ) {
          await handleCompletionAndCertificate(enrollment, req.user._id);
        }
      }

      await enrollment.save();

      return res.status(200).json({
        message: "Section marked as completed successfully",
        enrollment,
      });
    } catch (error) {
      console.error("Error in markSectionComplete:", error);
      return res.status(500).json({
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  async handleCompletionAndCertificate(enrollment, userId) {
    try {
      // Additional validation checks
      if (!enrollment || !enrollment.course) {
        throw new Error("Invalid enrollment data");
      }

      if (enrollment.certification?.issued) {
        console.log(
          "Certificate already issued for enrollment:",
          enrollment._id
        );
        return;
      }

      if (!enrollment.certification) {
        enrollment.certification = {
          eligible: true,
          issued: false,
        };
      }

      // Verify course is actually completed
      if (
        enrollment.currentStatus !== "completed" ||
        enrollment.progress.completionPercentage < 100
      ) {
        throw new Error("Course not fully completed");
      }

      // Generate and store certificate
      const { fileId, certificateId, url } =
        await CertificateService.generateAndStoreCertificate(
          enrollment,
          userId
        );

      // Update enrollment with certificate info
      enrollment.certification.issued = true;
      enrollment.certification.issuedAt = new Date();
      enrollment.certification.fileId = fileId;
      enrollment.certification.certificateId = certificateId;
      enrollment.certification.downloadUrl = url;
      enrollment.certification.issuedBy = userId;

      // Set expiration date (1 year from issuance)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      enrollment.certification.expirationDate = expirationDate;

      await enrollment.save();
      return enrollment;
    } catch (error) {
      console.error("Error handling certificate generation:", error);
      throw error;
    }
  }

  async calculateCourseProgress(enrollment) {
    const course = enrollment.course;

    // Calculate based on completed sections
    const totalSections = course.modules.reduce(
      (acc, mod) => acc + mod.sections.length,
      0
    );
    const completedSections = enrollment.progress.modules.reduce((acc, mod) => {
      return acc + mod.sections.filter((s) => s.status === "completed").length;
    }, 0);

    const newCompletionPercentage = Math.round(
      (completedSections / totalSections) * 100
    );
    enrollment.progress.completionPercentage = newCompletionPercentage;

    // Update status based on completion
    if (
      newCompletionPercentage === 100 &&
      enrollment.currentStatus !== "completed"
    ) {
      // Only mark as completed if there's no final exam or if final exam is passed
      if (!course.finalExam || enrollment.finalExam?.passed) {
        enrollment.currentStatus = "completed";
        enrollment.actualCompletionDate = new Date();
      }
    } else if (
      newCompletionPercentage > 0 &&
      enrollment.currentStatus === "enrolled"
    ) {
      enrollment.currentStatus = "in_progress";
    }
  }

  async getTutorEnrollments(req, res) {
    try {
      const tutorId = req.user._id;
      console.log("Tutor ID:", tutorId);
      const enrollments = await EnrollmentService.getTutorEnrollments(tutorId);
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addNoteToSection(req, res) {
    try {
      const { moduleId, sectionId, note } = req.body;

      const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.user._id,
      });

      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Find the module progress
      const moduleProgress = enrollment.progress.modules.find(
        (m) => m.moduleId.toString() === moduleId
      );
      if (!moduleProgress) {
        throw new NotFoundError("Module progress not found");
      }

      // Find the section progress
      let sectionProgress = moduleProgress.sections.find(
        (s) => s.sectionId.toString() === sectionId
      );
      if (!sectionProgress) {
        sectionProgress = {
          sectionId: sectionId,
          status: "not_started",
          startedAt: new Date(),
          timeSpent: 0,
        };
        moduleProgress.sections.push(sectionProgress);
      }

      // Add the note
      sectionProgress.notes = sectionProgress.notes || [];
      sectionProgress.notes.push({
        content: note,
        createdAt: new Date(),
      });

      await enrollment.save();
      res.json(enrollment);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async submitQuiz(req, res) {
    try {
      const { moduleId, sectionId, quizId, answers } = req.body;

      const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.user._id,
      }).populate({
        path: "course",
        populate: {
          path: "modules.sections.quiz",
        },
      });

      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Find the course, module, section and quiz
      const course = enrollment.course;
      const module = course.modules.find((m) => m._id.toString() === moduleId);
      if (!module) {
        throw new NotFoundError("Module not found");
      }

      const section = module.sections.find(
        (s) => s._id.toString() === sectionId
      );
      if (!section || section.type !== "quiz") {
        throw new NotFoundError("Quiz section not found");
      }

      if (!section.quiz || section.quiz._id.toString() !== quizId) {
        throw new NotFoundError("Quiz not found in section");
      }

      const quiz = section.quiz;

      // Calculate score
      let correctAnswers = 0;
      const questionResults = quiz.questions.map((question, qIndex) => {
        const userSelectedIndices = answers[qIndex] || [];
        const userSelectedOptions = userSelectedIndices.map(
          (index) => question.options[index]
        );

        const correctOptions = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];

        const isCorrect = arraysEqual(
          userSelectedOptions.sort(),
          correctOptions.sort()
        );

        if (isCorrect) correctAnswers++;
        return {
          questionIndex: qIndex,
          userAnswers: userSelectedOptions,
          correctAnswers: correctOptions,
          isCorrect,
        };
      });

      const score = Math.round((correctAnswers / quiz.questions.length) * 100);
      const passingScore = 70;
      const passed = score >= passingScore;

      // Update assessment progress
      let assessmentProgress = enrollment.progress.assessments.find(
        (a) =>
          a.sectionId.toString() === sectionId && a.assessmentType === "quiz"
      );

      if (!assessmentProgress) {
        assessmentProgress = {
          assessmentId: quizId,
          assessmentType: "quiz",
          sectionId: sectionId,
          attempts: [],
          required: true,
        };
        enrollment.progress.assessments.push(assessmentProgress);
      }

      // Add attempt
      const attemptNumber = assessmentProgress.attempts.length + 1;
      assessmentProgress.attempts.push({
        attemptNumber,
        startedAt: new Date(),
        submittedAt: new Date(),
        score,
        passingScore,
        passed,
        answers: questionResults,
      });

      // Update best score and passed status
      assessmentProgress.bestScore = Math.max(
        assessmentProgress.bestScore || 0,
        score
      );
      assessmentProgress.passed = assessmentProgress.passed || passed;

      // Update section progress
      const moduleProgress = enrollment.progress.modules.find(
        (m) => m.moduleId.toString() === moduleId
      );
      if (!moduleProgress) {
        throw new NotFoundError("Module progress not found");
      }

      let sectionProgress = moduleProgress.sections.find(
        (s) => s.sectionId.toString() === sectionId
      );
      if (!sectionProgress) {
        sectionProgress = {
          sectionId: sectionId,
          status: passed ? "completed" : "in_progress",
          startedAt: new Date(),
          timeSpent: 0,
        };
        moduleProgress.sections.push(sectionProgress);
      }

      if (passed) {
        sectionProgress.status = "completed";
        sectionProgress.completedAt = new Date();
      }

      // Update completion percentage
      await this.calculateCourseProgress(enrollment);

      await enrollment.save();
      res.json(enrollment);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  }

  async submitFinalExam(req, res) {
    try {
      const { answers } = req.body;

      const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.user._id,
      }).populate("student course");

      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Validate active attempt
      if (!enrollment.finalExam?.attempts?.length) {
        return res.status(400).json({
          message: "No active exam attempt found",
        });
      }

      const currentAttempt =
        enrollment.finalExam.attempts[enrollment.finalExam.attempts.length - 1];
      if (currentAttempt.submittedAt) {
        return res.status(400).json({
          message: "This exam attempt has already been submitted",
        });
      }

      // Calculate score
      const exam = enrollment.course.finalExam;
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      const questionResults = exam.questions.map((question) => {
        const userAnswer = answers[question._id.toString()];
        const questionPoints = question.points || 1;
        totalPoints += questionPoints;

        const isCorrect = String(userAnswer) === String(question.correctAnswer);

        if (isCorrect) {
          correctAnswers++;
          earnedPoints += questionPoints;
        }

        return {
          questionId: question._id,
          questionText: question.questionText,
          userAnswer: userAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          points: isCorrect ? questionPoints : 0,
        };
      });

      const score = Math.round((earnedPoints / totalPoints) * 100);
      const passed = score >= exam.passingScore;

      // Update current attempt
      currentAttempt.submittedAt = new Date();
      currentAttempt.score = score;
      currentAttempt.passed = passed;
      currentAttempt.answers = questionResults;
      currentAttempt.totalPoints = totalPoints;
      currentAttempt.earnedPoints = earnedPoints;

      // Calculate duration used in minutes
      const durationUsed = Math.floor(
        (currentAttempt.submittedAt - currentAttempt.startedAt) / 1000 / 60
      );
      currentAttempt.durationUsed = durationUsed;

      // Update final exam status
      enrollment.finalExam.bestScore = Math.max(
        enrollment.finalExam.bestScore || 0,
        score
      );
      enrollment.finalExam.passed = enrollment.finalExam.passed || passed;
      enrollment.finalExam.lastAttemptDate = new Date();

      // Mark course as completed if exam is passed
      if (passed) {
        enrollment.currentStatus = "completed";
        enrollment.progress.completionPercentage = 100;
        enrollment.actualCompletionDate = new Date();

        if (!enrollment.certification) {
          enrollment.certification = {
            eligible: true,
            issued: false,
          };
        }

        // Generate certificate if eligible and not already issued
        if (
          enrollment.certification.eligible &&
          !enrollment.certification.issued
        ) {
          await this.handleCompletionAndCertificate(
            enrollment,
            enrollment.student
          );
        }
      }

      await enrollment.save();
      res.json({
        ...enrollment.toObject(),
        examResult: {
          score,
          passed,
          correctAnswers,
          totalQuestions: exam.questions.length,
          passingScore: exam.passingScore,
          detailedResults: questionResults,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error submitting final exam:", error);
        res.status(500).json({
          message: error.message || "Internal server error",
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  }

  async startFinalExam(req, res) {
    try {
      const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.user._id,
      }).populate("course");

      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Check if all modules are completed
      const allModulesCompleted = enrollment.course.modules.every((module) => {
        const moduleProgress = enrollment.progress.modules.find(
          (m) => m.moduleId.toString() === module._id.toString()
        );
        return moduleProgress?.status === "completed";
      });

      if (!allModulesCompleted) {
        return res.status(400).json({
          message: "All modules must be completed before starting final exam",
        });
      }

      // Check if already passed
      if (enrollment.finalExam?.passed) {
        return res.status(400).json({
          message: "You have already passed the final exam",
        });
      }

      // Check attempt limits
      const attempts = enrollment.finalExam?.attempts?.length || 0;
      if (attempts >= 3) {
        return res.status(400).json({
          message: "Maximum exam attempts (3) reached",
        });
      }

      // Initialize final exam if not exists
      if (!enrollment.finalExam) {
        enrollment.finalExam = {
          attempts: [],
          taken: false,
          passed: false,
          bestScore: 0,
        };
      }

      // Create new attempt
      const attemptNumber = attempts + 1;
      const newAttempt = {
        attemptNumber,
        startedAt: new Date(),
        submittedAt: null,
        score: null,
        passed: null,
        answers: null,
        durationUsed: 0,
      };

      enrollment.finalExam.attempts.push(newAttempt);
      enrollment.finalExam.taken = true;
      enrollment.finalExam.lastAttemptDate = new Date();

      await enrollment.save();

      res.json({
        ...enrollment.toObject(),
        examDetails: {
          duration: enrollment.course.finalExam.duration,
          questionCount: enrollment.course.finalExam.questions.length,
          passingScore: enrollment.course.finalExam.passingScore,
          attemptNumber: newAttempt.attemptNumber,
          startedAt: newAttempt.startedAt,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error starting final exam:", error);
        res.status(500).json({
          message: error.message || "Internal server error",
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    }
  }

  async submitPreAssessment(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { responses } = req.body;

      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Validate responses
      if (!Array.isArray(responses) || responses.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid assessment responses" });
      }

      // Clear existing responses if any
      enrollment.assessmentResponses.preAssessment = [];

      // Process and store each response
      for (const response of responses) {
        enrollment.assessmentResponses.preAssessment.push({
          questionId: response.questionId,
          questionText: response.questionText,
          response: response.response,
          correctAnswer: response.correctAnswer,
          isCorrect: response.isCorrect,
          answeredAt: new Date(),
        });
      }

      // Calculate pre-assessment score
      const correctCount = enrollment.assessmentResponses.preAssessment.filter(
        (r) => r.isCorrect
      ).length;
      const totalQuestions =
        enrollment.assessmentResponses.preAssessment.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      await enrollment.save();

      res.status(200).json({
        message: "Pre-assessment submitted successfully",
        score,
        totalQuestions,
        correctCount,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error submitting pre-assessment:", error);
        res.status(500).json({ message: "Failed to submit pre-assessment" });
      }
    }
  }

  async submitPostAssessment(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { responses } = req.body;

      const enrollment = await Enrollment.findById(enrollmentId);
      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      // Validate that course is completed or near completion
      if (enrollment.progress.completionPercentage < 80) {
        return res.status(400).json({
          message:
            "Course must be at least 80% complete to submit post-assessment",
        });
      }

      // Validate responses
      if (!Array.isArray(responses) || responses.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid assessment responses" });
      }

      // Clear existing responses if any
      enrollment.assessmentResponses.postAssessment = [];

      // Process and store each response
      for (const response of responses) {
        enrollment.assessmentResponses.postAssessment.push({
          questionId: response.questionId,
          questionText: response.questionText,
          response: response.response,
          correctAnswer: response.correctAnswer,
          isCorrect: response.isCorrect,
          answeredAt: new Date(),
        });
      }

      // Calculate post-assessment score
      const correctCount = enrollment.assessmentResponses.postAssessment.filter(
        (r) => r.isCorrect
      ).length;
      const totalQuestions =
        enrollment.assessmentResponses.postAssessment.length;
      const score = Math.round((correctCount / totalQuestions) * 100);

      // Update progress if this is a required assessment
      if (enrollment.course.requiresPostAssessment) {
        const passingScore = enrollment.course.postAssessmentPassingScore || 70;
        const passed = score >= passingScore;

        if (passed) {
          enrollment.progress.completionPercentage = Math.min(
            100,
            enrollment.progress.completionPercentage + 5
          );
        }
      }

      await enrollment.save();

      res.status(200).json({
        message: "Post-assessment submitted successfully",
        score,
        totalQuestions,
        correctCount,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error submitting post-assessment:", error);
        res.status(500).json({ message: "Failed to submit post-assessment" });
      }
    }
  }

  async getAssessmentResponses(req, res) {
    try {
      const { enrollmentId } = req.params;
      const { type } = req.query; // 'pre' or 'post'

      const enrollment = await Enrollment.findById(enrollmentId).select(
        "assessmentResponses course progress"
      );

      if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
      }

      let responses;
      if (type === "pre") {
        responses = enrollment.assessmentResponses.preAssessment || [];
      } else if (type === "post") {
        responses = enrollment.assessmentResponses.postAssessment || [];
      } else {
        return res.status(400).json({ message: "Invalid assessment type" });
      }

      // Calculate score if responses exist
      let score = null;
      if (responses.length > 0) {
        const correctCount = responses.filter((r) => r.isCorrect).length;
        score = Math.round((correctCount / responses.length) * 100);
      }

      res.status(200).json({
        type,
        responses,
        score,
        totalQuestions: responses.length,
        completionPercentage: enrollment.progress.completionPercentage,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        console.error("Error getting assessment responses:", error);
        res.status(500).json({ message: "Failed to get assessment responses" });
      }
    }
  }
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  const aSorted = [...a].sort();
  const bSorted = [...b].sort();

  for (let i = 0; i < aSorted.length; ++i) {
    if (aSorted[i] !== bSorted[i]) return false;
  }
  return true;
}

export default new EnrollmentController();
