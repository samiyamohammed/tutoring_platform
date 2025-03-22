import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // Tracks the enrollment status
  enrollmentStatus: [{
    status: {
      type: String,
      enum: ['enrolled', 'in_progress', 'completed', 'dropped', 'suspended'],
      default: 'enrolled'
    },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String },
  }],

  progress: {
    completedModules: [{
      module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
      completionDate: { type: Date },
      score: { type: Number, default: 0 },
      attempts: [{ type: Number, score: Number, date: Date }],
    }],
    completedQuizzes: [{
      quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      completionDate: { type: Date },
      score: { type: Number, default: 0 },
      attempts: [{ type: Number, score: Number, date: Date }],
    }],
    totalScore: { type: Number, default: 0 },
  },

  learningOutcomes: [{
    outcome: { type: String },
    achieved: { type: Boolean, default: false },
    achievedDate: { type: Date },
  }],

  certification: {
    issued: { type: Boolean, default: false },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    issuedDate: { type: Date },
    expirationDate: { type: Date },
  },

  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'failed'],
    default: 'pending'
  },

  paymentHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    paymentDate: { type: Date, default: Date.now },
    amountPaid: { type: Number },
    discountApplied: { type: Number, default: 0 },
    transactionId: { type: String },
  }],

  courseCompletionDate: { type: Date },

  lastAccessed: { type: Date },

  activityLog: [{
    action: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
  }],
}, { timestamps: true });

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

export default Enrollment; 
