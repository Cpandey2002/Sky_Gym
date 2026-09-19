import React from "react";

const DashboardCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 w-full min-w-0">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        {icon && (
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#C2FC85]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;