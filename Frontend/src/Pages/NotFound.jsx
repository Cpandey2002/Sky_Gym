import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#e8e0e0] px-4">
      
      {/* Animated 404 Number */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-7xl sm:text-9xl font-extrabold text-[#9A322B] drop-shadow-lg"
      >
        404
      </motion.h1>

      {/* Animated Subtitle */}
      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="mt-4 text-xl sm:text-2xl font-semibold text-gray-700"
      >
        Page Not Found
      </motion.p>

      {/* Animated Description */}
      <motion.p
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-2 text-center text-gray-500 max-w-md"
      >
        Oops! The page you're looking for doesn't exist or may have been moved.
      </motion.p>

      {/* Animated Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#9A322B] text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Go Back Home
        </Link>
      </motion.div>

      {/* Floating Animation Element */}
      <motion.div
        className="absolute bottom-10 text-[#9A322B] text-sm"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Lost in space? Let’s get you back.
      </motion.div>

    </div>
  );
}
