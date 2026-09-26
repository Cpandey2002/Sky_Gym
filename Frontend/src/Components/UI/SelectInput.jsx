import React from "react";

export default function SelectInput({
    label,
    name,
    value,
    onChange,
    options = [],
    className = "",
    required
}) {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label className="font-medium text-gray-700 mb-1" htmlFor={name}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="border rounded-lg  px-3 py-2 focus:ring-1 focus:ring-black focus:border-black outline-none"
                required={required}
            >
                <option value="">Select</option>
                {options.map((opt, index) => (
                    <option key={index} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
