import EnrollmentService from '../../application/services/EnrollmentService.js';

class EnrollmentController {
    async enrollStudent(req, res) {
        const data = req.body;
        try {
            const enrollment = await EnrollmentService.enrollStudent(data);
            res.status(201).json(enrollment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getEnrollments(req, res) {
        const { studentId } = req.params;
        try {
            const enrollments = await EnrollmentService.getEnrollments(studentId);
            res.status(200).json(enrollments);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateEnrollmentStatus(req, res) {
        const { enrollmentId, status } = req.body;
        try {
            const enrollment = await EnrollmentService.updateEnrollmentStatus(enrollmentId, status);
            res.status(200).json(enrollment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async addProgress(req, res) {
        const { enrollmentId, moduleId, score } = req.body;
        try {
            const progress = await EnrollmentService.addProgress(enrollmentId, moduleId, score);
            res.status(200).json(progress);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new EnrollmentController();
