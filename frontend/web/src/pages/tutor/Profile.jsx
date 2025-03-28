import React from "react";
import ProfileOverview from "./ProfileOverview";
import EditProfile from "./EditProfile";

const Profile = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 ">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ProfileOverview />
        <div className="lg:col-span-2">
          <EditProfile />
        </div>
      </div>
    </div>
  );
};

export default Profile;
