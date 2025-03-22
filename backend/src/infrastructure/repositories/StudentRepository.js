import Student from "../../domain/models/Student.js";

class StudentRepository {
  async createStudent(data) {
    const student = new Student(data);
    return await student.save();
  }
}

export default new StudentRepository();
