import WaitingList from "../domain/models/WaitingList";

class WaitingListRepository {
  async addToWaitlist(userId, courseId) {
    const existing = await WaitingList.findOne({
      user: userId,
      course: courseId,
    });
    if (existing) {
      throw new Error("User is already on the waitlist for this course");
    }
    return await WaitingList.create({ user: userId, course: courseId });
  }

  async removeFromWaitlist(userId, courseId) {
    return await WaitingList.findOneAndDelete({
      user: userId,
      course: courseId,
    });
  }

  async getWaitlistByCourse(courseId) {
    return await WaitingList.find({ course: courseId }).populate("user");
  }

  async getWaitlistByUser(userId) {
    return await WaitingList.find({ user: userId }).populate("course");
  }

  async isUserOnWaitlist(userId, courseId) {
    const record = await WaitingList.findOne({
      user: userId,
      course: courseId,
    });
    return !!record;
  }

  async getWaitlistPosition(userId, courseId) {
    const allEntries = await WaitingList.find({ course: courseId }).sort({
      createdAt: 1,
    });
    const position = allEntries.findIndex(
      (entry) => entry.user.toString() === userId
    );
    return position >= 0 ? position + 1 : null;
  }
}

export default new WaitingListRepository();
