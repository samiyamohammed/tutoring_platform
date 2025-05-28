import waitingListRepository from "./waitingList.repository";
import enrollmentService from "../enrollment/enrollment.service"; // You'll need to implement this

class WaitingListService {
  async joinWaitlist(userId, courseId) {
    // Check if user is already enrolled
    const isEnrolled = await enrollmentService.isUserEnrolled(userId, courseId);
    if (isEnrolled) {
      throw new Error("User is already enrolled in this course");
    }

    // Add to waitlist
    return await waitingListRepository.addToWaitlist(userId, courseId);
  }

  async leaveWaitlist(userId, courseId) {
    return await waitingListRepository.removeFromWaitlist(userId, courseId);
  }

  async getWaitlistStatus(userId, courseId) {
    const isOnWaitlist = await waitingListRepository.isUserOnWaitlist(
      userId,
      courseId
    );
    if (!isOnWaitlist) return { isOnWaitlist: false };

    const position = await waitingListRepository.getWaitlistPosition(
      userId,
      courseId
    );
    return { isOnWaitlist: true, position };
  }

  async getCourseWaitlist(courseId) {
    return await waitingListRepository.getWaitlistByCourse(courseId);
  }

  async getUserWaitlist(userId) {
    return await waitingListRepository.getWaitlistByUser(userId);
  }

  async processWaitlist(courseId, availableSlots) {
    const waitlist = await waitingListRepository.getWaitlistByCourse(courseId);
    const usersToEnroll = waitlist.slice(0, availableSlots);

    // Process enrollments
    for (const entry of usersToEnroll) {
      try {
        await enrollmentService.enrollUser(entry.user._id, courseId);
        await waitingListRepository.removeFromWaitlist(
          entry.user._id,
          courseId
        );
      } catch (error) {
        console.error(
          `Failed to enroll user ${entry.user._id} from waitlist:`,
          error
        );
      }
    }

    return usersToEnroll.length;
  }
}

export default new WaitingListService();
