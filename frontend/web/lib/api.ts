const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export const apiClient = {
  async post(endpoint: string, data: any) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  },

  async get(endpoint: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  },

  async put(endpoint: string, data: any) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, _method: "PUT" }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "PUT request failed");
    }

    return response.json();
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ _method: "DELETE" }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "DELETE request failed");
    }

    return response.json();
  },
};
