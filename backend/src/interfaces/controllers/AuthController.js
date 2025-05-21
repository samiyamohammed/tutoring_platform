import AuthService from "../../application/services/AuthService.js";

class AuthController {
  // Unified registration that detects role from request
  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async verifyOTP(req, res) {
    try {
      const result = await AuthService.verifyOTP(req.body.email, req.body.otp);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async resendOTP(req, res) {
    try {
      const result = await AuthService.resendOTP(req.body.email);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;
    try {
      const { token, user } = await AuthService.login(email, password);
      res.status(200).json({ token, user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

export default new AuthController();