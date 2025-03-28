import React, { useState } from "react";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    location: "New York, NY",
    bio: "Experienced mathematics and programming tutor with over 8 years of teaching experience.",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="mb-6">
            <div className="bg-[#0a5144] p-4 text-white">
                <h3 className="font-bold text-2xl">Edit Profile</h3>
            </div>
            <div className="p-6">
                <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {Object.keys(formData).map((key) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-[#145D52] mb-1">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                        <input
                        type="text"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-200"
                        />
                    </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" className="bg-gray-200 px-4 py-2 rounded-md">
                    Cancel
                    </button>
                    <button type="submit" className="bg-[#2563eb] px-4 py-2 text-white rounded-md">
                    Save Changes
                    </button>
                </div>
                </form>
            </div>

        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
      <div className="bg-[#0a5144] p-4 text-white">
        <h3 className="font-bold text-xl">Change Password</h3>
      </div>
      <div className="p-6">
        <form>
          {["Current Password", "New Password", "Confirm New Password"].map(
            (placeholder, index) => (
              <div className="mb-6" key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {placeholder}
                </label>
                <input
                  type="password"
                  placeholder={`Enter ${placeholder.toLowerCase()}`}
                  className="w-full bg-gray-200 border border-gray-300 rounded-md p-2"
                />
              </div>
            )
          )}
          <div className="flex justify-end">
            <button type="submit" className="bg-[#2563eb] px-4 py-2 text-white rounded-md">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default EditProfile;
