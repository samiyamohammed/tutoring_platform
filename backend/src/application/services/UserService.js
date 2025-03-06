import bcrypt from "bcryptjs";
import UserRepository from "../../infrastructure/repositories/UserRepository.js";

class UserService {
  async registerUser(name, email, password, role) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    return UserRepository.create({ name, email, password: hashedPassword, role });
  }

  async loginUser(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return user;
  }
}

export default new UserService();
