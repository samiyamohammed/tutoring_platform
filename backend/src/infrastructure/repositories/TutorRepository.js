import Tutor from "../../domain/models/Tutor.js";

class TutorRepository {
  async createTutor(data) {
    const tutor = new Tutor(data);
    return await tutor.save();
  }
}

export default new TutorRepository();
