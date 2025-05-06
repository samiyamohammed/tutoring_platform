import mongoose from "mongoose";

const { Schema } = mongoose;

// Enum values
const EnrollmentStatus = [
  "enrolled",
  "in_progress",
  "completed",
  "dropped",
  "suspended",
];
const ModuleStatus = ["not_started", "started", "completed"];
const AssessmentTypes = ["quiz", "assignment", "exam"];
const PaymentStatus = ["pending", "partial", "paid", "refunded", "failed"];
const SessionTypes = ["online", "group", "oneOnOne"];

// Subschemas
const NoteSchema = new Schema(
  {
    content: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ResourceCompletionSchema = new Schema(
  {
    resourceId: Schema.Types.ObjectId,
    resourceType: String,
    completedAt: Date,
  },
  { _id: false }
);

const ModuleProgressSchema = new Schema(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: "Module" },
    status: { type: String, enum: ModuleStatus, default: "not_started" },
    startedAt: Date,
    completedAt: Date,
    lastAccessed: Date,
    timeSpent: { type: Number, default: 0 },
    notes: [NoteSchema],
    resourcesCompleted: [ResourceCompletionSchema],
  },
  { _id: false }
);

const AssessmentAttemptSchema = new Schema(
  {
    attemptNumber: Number,
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    score: Number,
    passingScore: Number,
    passed: Boolean,
    answers: Schema.Types.Mixed,
    feedback: String,
  },
  { _id: false }
);

const AssessmentSchema = new Schema(
  {
    assessmentId: { type: Schema.Types.ObjectId, ref: "Quiz" },
    assessmentType: { type: String, enum: AssessmentTypes },
    attempts: [AssessmentAttemptSchema],
    bestScore: Number,
    passed: Boolean,
    required: { type: Boolean, default: true },
  },
  { _id: false }
);

const SessionSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
    sessionType: { type: String, enum: SessionTypes },
    attended: Boolean,
    attendanceTime: Number,
    participationScore: Number,
    notes: String,
    recordingViewed: Boolean,
  },
  { _id: false }
);

const TransactionSchema = new Schema(
  {
    amount: Number,
    date: Date,
    transactionId: String,
    method: String,
    status: String,
  },
  { _id: false }
);

const ActivityLogSchema = new Schema(
  {
    action: String,
    entityType: String,
    entityId: Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now },
    details: Schema.Types.Mixed,
    ipAddress: String,
  },
  { _id: false }
);

const EnrollmentSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    enrolledSessionType: {
      type: String,
      enum: SessionTypes, // ['online', 'group', 'oneOnOne']
      required: true,
    },

    currentStatus: {
      type: String,
      enum: EnrollmentStatus,
      default: "enrolled",
    },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reason: String,
      },
    ],

    progress: {
      modules: [ModuleProgressSchema],
      assessments: [AssessmentSchema],
      sessions: [SessionSchema],
      completionPercentage: { type: Number, default: 0 },
      lastActivity: Date,
      timeSpentTotal: { type: Number, default: 0 },
      currentModule: { type: Schema.Types.ObjectId, ref: "Module" },
    },

    certification: {
      eligible: Boolean,
      issued: { type: Boolean, default: false },
      certificateId: { type: Schema.Types.ObjectId, ref: "Certificate" },
      issuedDate: Date,
      expirationDate: Date,
      requirementsMet: [String],
    },

    payment: {
      status: { type: String, enum: PaymentStatus, default: "pending" },
      amountPaid: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true }, // only required field in payment
      paymentMethod: String,
      transactions: [TransactionSchema],
      discountApplied: {
        code: String,
        amount: Number,
      },
    },

    enrollmentDate: { type: Date, default: Date.now },
    startDate: Date,
    expectedCompletionDate: Date,
    actualCompletionDate: Date,

    metadata: {
      deviceInfo: [String],
      ipAddresses: [String],
      referralSource: String,
    },

    activityLog: [ActivityLogSchema],
  },
  { timestamps: true }
);

// Virtual
EnrollmentSchema.virtual("isCompleted").get(function () {
  return this.currentStatus === "completed";
});

// Indexes
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ course: 1, "progress.completionPercentage": 1 });
EnrollmentSchema.index({ "progress.currentModule": 1 });

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);

export default Enrollment;
