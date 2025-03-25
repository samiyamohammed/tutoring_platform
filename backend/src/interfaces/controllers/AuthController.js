import AuthService from "../../application/services/AuthService.js";

class AuthController {
  // Unified registration method
  async register(req, res) {
    req.body.role = "student";
    const { role, ...data } = req.body;

    try {
      let user;

      // Register user based on role
      if (role === "student") {
        user = await AuthService.registerStudent(data);
      } else if (role === "tutor") {
        user = await AuthService.registerTutor(data);
      } else if (role === "admin") {
        user = await AuthService.registerAdmin(data);
      } else {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Unified login method (No role parameter in the request)
  async login(req, res) {
    const { email, password } = req.body;

    try {
      // Try to find the user in all roles (student, tutor, admin)
      const token = await AuthService.login(email, password);
      res.status(200).json({ token });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();
