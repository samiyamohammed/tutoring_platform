import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import { Readable } from 'stream';
import { generateCertificatePDFBuffer } from '../../utils/certificateHelper.js';
import { gfs } from '../../utils/multer-config.js';

class CertificateService {
    static async generateAndStoreCertificate(enrollment, userId) {
        try {
            // Validate required data with proper fallbacks
            const studentName = enrollment.student?.name || enrollment.student?.email || 'Student';
            const courseTitle = enrollment.course?.title || 'Course';
            const instructorName = enrollment.tutor?.name || 'Instructor';

            const buffer = await generateCertificatePDFBuffer(
                studentName,
                courseTitle,
                instructorName,
                new Date()
            );

            const filename = `certificate_${enrollment._id}_${Date.now()}.pdf`;

            // Proper ObjectId generation
            const certificateId = `CERT-${new ObjectId().toString().slice(-8).toUpperCase()}`;

            const uploadStream = gfs.openUploadStream(filename, {
                contentType: 'application/pdf',
                metadata: {
                    enrollmentId: new ObjectId(enrollment._id),
                    studentId: new ObjectId(enrollment.student._id),
                    courseId: new ObjectId(enrollment.course._id),
                    issuedBy: new ObjectId(userId),
                    isCertificate: true
                }
            });

            // Wrap buffer into a proper stream
            const readableStream = new Readable();
            readableStream.push(buffer);
            readableStream.push(null);

            return new Promise((resolve, reject) => {
                uploadStream.on('error', reject);
                uploadStream.on('finish', () => {
                    resolve({
                        fileId: uploadStream.id,
                        certificateId,
                        filename,
                        url: `/api/files/${uploadStream.id}`
                    });
                });

                readableStream.pipe(uploadStream);
            });
        } catch (error) {
            console.error('Certificate generation error:', error);
            throw error;
        }
    }
}

export default CertificateService;
