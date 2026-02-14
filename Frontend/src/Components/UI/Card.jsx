import React from "react";

export default function Card({ name, date, image }) {
    return (
        <div className="
            relative  rounded-2xl border-2 border-[#9A322B] backdrop-blur-xl
        ">
            <div className="
                bg-white/90 backdrop-blur-xl rounded-2xl p-5 
                shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                flex items-center gap-4
            ">

                {/* Image */}
                {/* <div className="relative">
                    <img
                        src={image}
                        alt={name}
                        className="w-16 h-16 rounded-full object-cover shadow-md"
                    />

                    <span className="
                        absolute -top-2 -right-2 text-xs
                        bg-gradient-to-br from-yellow-400 to-orange-500
                        text-white px-2 py-1 rounded-full shadow-md
                    ">
                        🎉
                    </span>
                </div> */}

                {/* Text Content */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                        {name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                         {date}
                    </p>

                    {/* Subtext */}
                    <p className="text-purple-600 font-medium text-xs mt-2">
                        Wishing you a fantastic year ahead!
                    </p>
                </div>
            </div>
        </div>
    );
}
