import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateField = ({
    label,
    name,
    value,
    onChange,
    required = false,
    error = "",
    placeholder = "dd/MM/yyyy",
    disabled = false,
}) => {

    const selectedDate = value
        ? new Date(`${value}T00:00:00`)
        : null;

    const handleDateChange = (date) => {
        const formattedValue = date
            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
            : "";

        onChange({
            target: {
                name,
                value: formattedValue,
            },
        });
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                disabled={disabled}
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder}
                className={`w-full pl-10 px-3 py-2 border rounded-md outline-none focus:ring-1 focus:ring-[black] focus:border-[black] ${error ? "border-red-500" : "border-gray-300"
                    }${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
                    `}
                wrapperClassName="w-full"

                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />

            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default DateField;