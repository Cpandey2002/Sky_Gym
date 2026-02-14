import React from "react";

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
}) => {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Textarea */}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full mt-2 px-4 py-3 rounded-lg border border-gray-300 
                  focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
      ></textarea>
    </div>
  );
};

export default Textarea;
