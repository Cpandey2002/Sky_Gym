import React from "react";
import Button from "./Button";

const Modal = ({ isOpen, onClose, title, isForm = true, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-fadeIn">

        {/* 🌟 Header */}
        <div className="sticky top-0 z-10 bg-black text-white rounded-t-lg px-6 py-4 flex items-center justify-between shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold tracking-wide">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-black bg-[#e8e0e0] hover:bg-gray-400 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[12px] transition-all"
          >
            ✕
          </button>
        </div>

        {/* 🌸 Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isForm ? (
            <form className="space-y-6">
              {children}
            </form>
          ) : (
            <div>{children}</div>
          )}
        </div>

        {/* 🌈 Footer */}
        {/* {isForm && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 rounded-b-lg px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="danger" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Modal;
