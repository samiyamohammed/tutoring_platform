import mongoose from 'mongoose';

const { Schema } = mongoose;

// Enum values
const EnrollmentStatus = ['enrolled', 'in_progress', 'completed', 'dropped', 'suspended'];
const ModuleStatus = ['not_started', 'started', 'completed'];
const SectionStatus = ['not_started', 'in_progress', 'completed'];
const AssessmentTypes = ['quiz', 'assignment', 'exam'];
const PaymentStatus = ['pending', 'partial', 'paid', 'refunded', 'failed'];
const SessionTypes = ['online', 'group', 'oneOnOne'];
const ResourceTypes = ['text', 'video', 'pdf', 'quiz'];

// Subschemas
const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const sectionProgressSchema = new mongoose.Schema({
  sectionId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'not_started' 
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessed: Date,
  timeSpent: { type: Number, default: 0 }, // in seconds
  notes: [noteSchema]
});

const TransactionSchema = new Schema({
  amount: Number,
  date: Date,
  transactionId: String,
  method: String,
  status: String
}, { _id: false });

const moduleProgressSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['not_started', 'started', 'completed'], 
    default: 'not_started' 
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessed: Date,
  timeSpent: { type: Number, default: 0 }, // in seconds
  sections: [sectionProgressSchema]
});

const SessionSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
  sessionType: { type: String, enum: SessionTypes },
  moduleId: Schema.Types.ObjectId, // No ref
  sectionId: Schema.Types.ObjectId, // No ref
  attended: Boolean,
  attendanceTime: Number,
  participationScore: Number,
  notes: String,
  recordingViewed: Boolean
}, { _id: false });


const ActivityLogSchema = new Schema({
  action: String,
  entityType: String,
  entityId: Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
  details: Schema.Types.Mixed,
  ipAddress: String
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  attemptNumber: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  score: Number,
  passingScore: Number,
  passed: Boolean,
  answers: mongoose.Schema.Types.Mixed, // Store user's answers
  feedback: String
});

const assessmentProgressSchema = new mongoose.Schema({
  assessmentId: { type: String, required: true },
  assessmentType: { 
    type: String, 
    enum: ['quiz', 'assignment', 'exam'], 
    required: true 
  },
  sectionId: { type: String, required: true },
  attempts: [quizAttemptSchema],
  bestScore: Number,
  passed: Boolean,
  required: { type: Boolean, default: true }
});

const certificationSchema = new mongoose.Schema({
  eligible: { type: Boolean, default: false },
  issued: { type: Boolean, default: false },
  issuedAt: Date,
  certificateId: String,
  expirationDate: Date
});

const EnrollmentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },

  enrolledSessionType: {
    type: String,
    enum: SessionTypes,
    required: true
  },

  currentStatus: {
    type: String,
    enum: EnrollmentStatus,
    default: 'enrolled'
  },

  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String
  }],

  progress: {
    modules: [moduleProgressSchema],
    assessments: [assessmentProgressSchema],
    completionPercentage: { type: Number, default: 0 },
    lastActivity: Date,
    timeSpentTotal: { type: Number, default: 0 }, // in seconds
    currentModule: String,
    currentSection: String
  },

  certification: certificationSchema,

  // Payment and other fields remain the same...
  payment: {
    status: { type: String, enum: PaymentStatus, default: 'pending' },
    amountPaid: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: String,
    transactions: [TransactionSchema],
    discountApplied: {
      code: String,
      amount: Number
    }
  },

  enrollmentDate: { type: Date, default: Date.now },
  startDate: Date,
  expectedCompletionDate: Date,
  actualCompletionDate: Date,

  metadata: {
    deviceInfo: [String],
    ipAddresses: [String],
    referralSource: String
  },

  activityLog: [ActivityLogSchema]

}, { timestamps: true });

// Virtuals
EnrollmentSchema.virtual('isCompleted').get(function () {
  return this.currentStatus === 'completed';
});

EnrollmentSchema.virtual('completedModules').get(function () {
  return this.progress.modules.filter(m => m.status === 'completed').length;
});

EnrollmentSchema.virtual('completedSections').get(function () {
  return this.progress.modules.reduce((acc, module) => {
    return acc + module.sections.filter(s => s.status === 'completed').length;
  }, 0);
});

// Indexes
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ course: 1, 'progress.completionPercentage': 1 });
EnrollmentSchema.index({ 'progress.currentModule': 1 });
EnrollmentSchema.index({ 'progress.currentSection': 1 });
EnrollmentSchema.index({ 'progress.modules.sections.sectionId': 1 });

// Middleware to update completion percentage when progress changes
EnrollmentSchema.pre('save', function (next) {
  if (this.isModified('progress')) {
    const totalModules = this.populated('course')?.modules?.length || 0;
    const totalSections = this.populated('course')?.modules?.reduce((acc, mod) =>
      acc + (mod.sections?.length || 0), 0) || 0;

    if (totalModules > 0 && totalSections > 0) {
      const completedModules = this.progress.modules.filter(m => m.status === 'completed').length;
      const completedSections = this.progress.modules.reduce((acc, module) =>
        acc + module.sections.filter(s => s.status === 'completed').length, 0);

      // Weighted average (50% modules, 50% sections)
      this.progress.completionPercentage = Math.round(
        ((completedModules / totalModules) * 50) +
        ((completedSections / totalSections) * 50)
      );
    }
  }
  next();
});

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

export default Enrollment;