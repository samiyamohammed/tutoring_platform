import axios from "axios";
import { API_URL } from "@env";

const authApi = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const signup = async (name, email, password, role) => {
  try {
    const response = await authApi.post("/register", {
      name,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

export const signin = async (email, password) => {
  try {
    const response = await authApi.post("/login", { email, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


