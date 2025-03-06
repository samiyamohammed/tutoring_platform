import UserService from "../../application/services/UserService.js";
import jwt from "jsonwebtoken";

class UserController {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      const user = await UserService.registerUser(name, email, password, role);
      res.status(201).json({ message: "User registered", user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await UserService.loginUser(email, password);

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new UserController();
