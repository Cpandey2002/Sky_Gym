import React from "react";

const DashboardCard = ({ title, value, icon, percentage }) => {
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

      {/* Percentage */}
      <div className="mt-1">
        <p className="text-xs text-gray-500 mt-1 text-right">
          {percentage.toFixed(2)}%
        </p>

        {/* Progress Line */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full"
            style={{
              width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;