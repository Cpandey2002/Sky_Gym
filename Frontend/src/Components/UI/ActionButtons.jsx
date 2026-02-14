import React from "react";
import { Eye, Pencil, UserRoundCheck,CalendarSync} from "lucide-react";

const ActionButtons = ({
  onView,
  onUpdate,
  onAttend,
  onRenew,

  // Button visibility
  showView = false,
  showUpdate = false,
  showAttend = false,
  showRenew = false,

  // Tooltip Text
  viewTooltip = "View",
  updateTooltip = "Update",
  attendTooltip = "Attend",
  renewTooltip = "Renew"
}) => {
  const actions = [
    {
      icon: <Eye className="w-4 h-4" />,
      label: viewTooltip,
      gradient: "from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600",
      shadow: "shadow-green-200",
      onClick: onView,
      disabled: false,
      show: showView,
    },
    {
      icon: <Pencil className="w-4 h-4" />,
      label: updateTooltip,
      gradient: "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
      shadow: "shadow-indigo-200",
      onClick: onUpdate,
      disabled: false,
      show: showUpdate,
    },
    {
      icon: <UserRoundCheck className="w-4 h-4" />,
      label: attendTooltip,
      gradient: "from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
      shadow: "shadow-indigo-200",
      onClick: onAttend,
      disabled: false,
      show: showAttend,
    },
    {
      icon: <CalendarSync  className="w-4 h-4" />,
      label: renewTooltip,
      gradient: "from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
      shadow: "shadow-indigo-200",
      onClick: onRenew,
      disabled: false,
      show: showRenew,
    }
  ].filter((a) => a.show);

  return (
    <div className="flex items-center gap-4">
      {actions.map((action, index) => (
        <div key={index} className="relative group">

          {/* Action Button */}
          <button
            onClick={action.onClick}
            className={`
              p-2.5 bg-gradient-to-r ${action.gradient}
              text-white rounded-full transition-all duration-300 transform
              hover:scale-110 focus:outline-none shadow-md ${action.shadow}
            `}
          >
            {action.icon}
          </button>

          {/* Tooltip */}
          <span
            className="
              absolute -top-7 z-20 left-1/2 -translate-x-1/2 
              text-xs font-medium text-white px-2 py-1 
              rounded-md opacity-0 group-hover:opacity-100 
              transition-all duration-300 pointer-events-none 
              shadow-sm bg-gray-800/90
            "
          >
            {action.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ActionButtons;
