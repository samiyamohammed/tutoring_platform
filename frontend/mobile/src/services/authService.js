const API_URL = "http://192.168.100.13:5000/api/auth";

export const signUp = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    // Get the raw response text
    const text = await response.text(); // Read the response as text

    // Log the raw response to help with debugging
    console.log("Raw Response:", text);

    // Try parsing the response as JSON
    let data;
    try {
      data = JSON.parse(text); // Try to parse JSON
    } catch (e) {
      throw new Error("Failed to parse response as JSON");
    }

    if (!response.ok) {
      // If response is not OK, throw an error with the message
      throw new Error(data.message || "Sign up failed");
    }

    return data; // Return the parsed JSON data
  } catch (error) {
    // Log the error to console for debugging purposes
    console.error("Sign up error:", error);
    throw error; // Rethrow the error
  }
};

export const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      // Check if the response is OK and the response is of type JSON
      const text = await response.text(); // Read the raw response as text
      if (response.ok && response.headers.get("Content-Type").includes("application/json")) {
        const data = JSON.parse(text); // Only parse as JSON if it's of type JSON
        return data; // Return user data on successful sign in
      } else {
        console.error("Received non-JSON response:", text); // Log non-JSON response
        throw new Error("Failed to parse JSON, unexpected response received");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  };
  
