import { signup, signin } from "../../infrastructure/api/authApi";

export const signupUser = async (fullName, email, password, role) => {
  if (!fullName || !email || !password || !role) {
    throw new Error("All fields are required.");
  }

  return await signup(fullName, email, password, role);
};

export const signInUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  return await signin(email, password);
};
