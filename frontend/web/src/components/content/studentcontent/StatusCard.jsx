import React from "react";

const StatusCard = ({ title, value }) => {
  return (
    <div className="bg-[#145D52] p-4 rounded-lg shadow-lg text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default StatusCard;
