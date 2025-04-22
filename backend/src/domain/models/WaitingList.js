import mongoose from 'mongoose';

const WaitingListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  // Other fields as necessary...
}, { timestamps: true });

const WaitingList = mongoose.model('WaitingList', WaitingListSchema);

export default WaitingList;