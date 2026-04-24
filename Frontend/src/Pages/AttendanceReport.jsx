import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import { getAllClients } from "../API/Client";
import { getAttendance } from "../API/Attendance";
import { CheckCircle, XCircle, CalendarDays, Award, Timer, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo (2).png";
import Loader from "../Components/Loader/Loader";



export default function AttendanceReport() {
    const [loading, setLoading] = useState(false);

    const getDayName = (year, month, day) => {
        return new Date(year, month - 1, day).toLocaleString("en-US", {
            weekday: "short"
        });
    };

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [clients, setClients] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});

    useEffect(() => {
        loadData();
    }, [month, year]);
const loadData = async () => {
  setLoading(true);

  try {
    const attendanceRes = await getAttendance(
      String(month).padStart(2, "0"),
      String(year)
    );

    const attendanceList = attendanceRes.data || [];

    // ✅ use attendance data as clients
    const uniqueClients = [];

const map = {};

attendanceList.forEach((item) => {
  if (!map[item.client_id]) {
    map[item.client_id] = true;
    uniqueClients.push({
      client_id: item.client_id,
      client_name: item.client_name
    });
  }
});

setClients(uniqueClients);

    generateAttendanceMap(attendanceList);

  } catch (error) {
    console.log("Error loading data:", error);
  } finally {
    setLoading(false);
  }
};
    // -----------------------------------------
    // Convert all sessions → { client_id: { day: "P" } }
    // -----------------------------------------
const generateAttendanceMap = (attendanceList) => {

    const map = {};

    attendanceList.forEach(att => {

        const date = new Date(att.attendance_date);

        if (
            date.getMonth() + 1 === Number(month) &&
            date.getFullYear() === Number(year)
        ) {

            if (!map[att.client_id]) {

                map[att.client_id] = {};

            }

            map[att.client_id][date.getDate()] = "P";

        }

    });

    setAttendanceMap(map);

};


    const daysInMonth = new Date(year, month, 0).getDate();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const handleDownloadPDF = async () => {
        const doc = new jsPDF("landscape", "mm", "a4");

        // ✅ Load logo as base64
        const logoBase64 = await loadImageAsBase64(logo);

        // ✅ Add LOGO (TOP-LEFT)
        doc.addImage(logoBase64, "PNG", 10, 8, 30, 18); // x, y, width, height

        // ✅ Get Month Name
        const monthName = new Date(year, month - 1).toLocaleString("default", {
            month: "long",
        });

        // ✅ Center Title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(
            `Monthly Attendance Report - ${monthName} ${year}`,
            doc.internal.pageSize.getWidth() / 2,
            15,
            { align: "center" }
        );

        // ✅ Generated Date (Top Right)
        doc.setFontSize(10);
        doc.text(
            `Generated: ${new Date().toLocaleDateString()}`,
            doc.internal.pageSize.getWidth() - 15,
            12,
            { align: "right" }
        );

        // ✅ TABLE HEADERS
        const tableColumn = [
            "Client Name",
            ...[...Array(daysInMonth)].map((_, i) => i + 1),
            "Present",
            "Absent",
            "%",
        ];

        // ✅ TABLE ROWS
        const tableRows = [];

        clients.forEach((client) => {
            let presentCount = 0;
            const row = [client.client_name];

            [...Array(daysInMonth)].forEach((_, day) => {
                const isPresent = attendanceMap[client.client_id]?.[day + 1] === "P";
                if (isPresent) presentCount++;
                row.push(isPresent ? "P" : "A");
            });

            const absentCount = daysInMonth - presentCount;
            const percentage = ((presentCount / daysInMonth) * 100).toFixed(0) + "%";

            row.push(presentCount);
            row.push(absentCount);
            row.push(percentage);

            tableRows.push(row);
        });

        // ✅ PDF TABLE
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30, // ⬅ pushed down to avoid logo & title clash

            styles: {
                fontSize: 8,
                halign: "center",
                valign: "middle",
            },

            headStyles: {
                fillColor: [154, 50, 43],
                textColor: [255, 255, 255],
                fontStyle: "bold",
            },

            columnStyles: {
                0: { halign: "left", cellWidth: 40 },
            },

            didParseCell: function (data) {
                const value = data.cell.raw;
                const colIndex = data.column.index;

                // ✅ P = GREEN TEXT
                if (value === "P") {
                    data.cell.styles.textColor = [22, 163, 74];
                    data.cell.styles.fontStyle = "bold";
                }

                // ✅ A = RED TEXT
                if (value === "A") {
                    data.cell.styles.textColor = [220, 38, 38];
                    data.cell.styles.fontStyle = "bold";
                }

                // ✅ SUNDAY = YELLOW BACKGROUND
                if (colIndex >= 1 && colIndex <= daysInMonth) {
                    const day = colIndex;
                    const isSunday =
                        new Date(year, month - 1, day).getDay() === 0;

                    if (isSunday) {
                        data.cell.styles.fillColor = [253, 224, 71];
                        data.cell.styles.textColor = [113, 63, 18];
                        data.cell.styles.fontStyle = "bold";
                    }
                }
            },

            margin: { top: 30 },
        });

        // Download PDF
        doc.save(`Attendance_Report_${monthName}_${year}.pdf`);
    };

    const loadImageAsBase64 = (url) =>
        new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
        });

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-20 overflow-x-auto">
                <Topbar />

                <div className="p-4">

                    <h2 className="text-2xl font-semibold mb-5">Monthly Attendance Report</h2>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6 ">
                        <div className="relative group">
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="
      appearance-none w-36 px-4 py-2.5
      bg-white/80 backdrop-blur-md
      border border-[#1e4543] rounded-xl
      shadow-sm text-gray-700 font-semibold
      focus:outline-none focus:ring-4 focus:ring-[#1e4543]/40
      hover:border-[#1e4543] hover:shadow-[#1e4543]/40
      transition-all duration-200
    "
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>

                            {/* ✅ Custom Arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#1e4543]">
                                <ChevronDown size={18} />
                            </div>
                        </div>


                        <div className="relative group">
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="
      appearance-none w-36 px-4 py-2.5
      bg-white/80 backdrop-blur-md
      border border-[#1e4543] rounded-xl
      shadow-sm text-gray-700 font-semibold
      focus:outline-none focus:ring-4 focus:ring-[#1e4543]/40
      hover:border-[#1e4543] hover:shadow-[#1e4543]/40
      transition-all duration-200
    "
                            >
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const yr = 2023 + i;
                                    return <option key={i} value={yr}>{yr}</option>;
                                })}
                            </select>

                            {/* ✅ Custom Arrow */}
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#1e4543]">
                                <ChevronDown size={18} />
                            </div>
                        </div>

                        <div>
                            <button
                                className="
      appearance-none w-36 px-4 py-2.5
      bg-white/80 backdrop-blur-md
      border border-[#1e4543] rounded-xl
      shadow-sm text-gray-700 font-semibold
      focus:outline-none focus:ring-4 focus:ring-[#1e4543]/40
      hover:border-[#1e4543] hover:shadow-[#1e4543]/40
      transition-all duration-200
    "
                                onClick={handleDownloadPDF}
                            >
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="border-2 border-gray-200  rounded-md shadow-2xl overflow-auto bg-white backdrop-blur-md">

                        <table className="min-w-max border-collapse w-full text-sm font-medium">

                            {/* ✅ TABLE HEAD */}
                            <thead className="bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 text-white sticky top-0 z-30 shadow-lg">
                                <tr>

                                    {/* ✅ Client Name Sticky Column */}
                                    <th className="border border-indigo-400 px-5 py-4 text-left sticky left-0 bg-[#1e4543] z-40 shadow-xl">
                                        <div className="flex items-center gap-2 font-bold text-base tracking-wide">
                                            <CalendarDays size={18} />
                                            Client Name
                                        </div>
                                    </th>

                                    {/* ✅ Dynamic Day Columns */}
                                    {[...Array(daysInMonth)].map((_, index) => {
                                        const day = index + 1;
                                        const dayName = getDayName(year, month, day);

                                        const isSunday =
                                            new Date(year, month - 1, day).getDay() === 0;

                                        return (
                                            <th
                                                key={index}
                                                className={`border border-indigo-300 px-3 py-2 text-center transition-all
                                                   ${isSunday
                                                        ? "bg-[#ff000c] text-white shadow-md"
                                                        : "bg-[#1e4543]"
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center leading-tight">

                                                    {/* ✅ Day Number */}
                                                    <span className="text-base font-bold">{day}</span>

                                                    {/* ✅ Day Name + Sunday Icon */}
                                                    <span className="text-[11px] flex items-center gap-1 opacity-90">
                                                        {dayName}
                                                        {/* {isSunday && <Timer size={12} className="text-yellow-300" />} */}
                                                    </span>
                                                </div>
                                            </th>
                                        );
                                    })}

                                    {/* ✅ Summary Headers */}
                                    <th className="border border-indigo-300 px-4 py-2 text-center bg-green-600">Present</th>
                                    <th className="border border-indigo-300 px-4 py-2 text-center bg-red-600">Absent</th>
                                    <th className="border border-indigo-300 px-4 py-2 text-center bg-[#C2FC85] text-black">%</th>
                                </tr>
                            </thead>

                            {/* ✅ TABLE BODY */}
                            <tbody className="bg-white divide-y divide-indigo-200">

                                {/* 🔥 SHOW LOADER ONLY INSIDE TABLE BODY */}
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={daysInMonth + 4}
                                            className="py-10 text-center"
                                        >
                                            <Loader />  {/* Your Hourglass Loader */}
                                        </td>
                                    </tr>
                                ) : clients.length > 0 ? (
                                    clients.map((client) => {
                                        let presentCount = 0;

                                        return (
                                            <tr
                                                key={client.client_id}
                                                className="hover:bg-indigo-50 transition-all border-b border-indigo-200"
                                            >

                                                {/* Sticky Client Name */}
                                                <td className="border border-indigo-200 px-4 py-3 font-semibold bg-[#e8e0e0] sticky left-0 z-20 shadow-lg">
                                                    {client.client_name}
                                                </td>

                                                {/* Day-wise Attendance */}
                                                {[...Array(daysInMonth)].map((_, day) => {
                                                    const isSunday =
                                                        new Date(year, month - 1, day + 1).getDay() === 0;

                                                    const isPresent =
                                                        attendanceMap[client.client_id]?.[day + 1] === "P";

                                                    if (isPresent) presentCount++;

                                                    return (
                                                        <td
                                                            key={day}
                                                            className={`border border-indigo-200 px-2 py-2 text-center transition-all
                                ${isSunday ? "bg-red-100" : "bg-white"}`}
                                                        >
                                                            {isSunday ? (
                                                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold shadow-md border border-yellow-300">
                                                                    <Timer size={14} />
                                                                </span>
                                                            ) : isPresent ? (
                                                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold shadow-md border border-emerald-300">
                                                                    <CheckCircle size={13} />
                                                                    P
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold shadow-md border border-rose-300">
                                                                    <XCircle size={13} />
                                                                    A
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                {/* Present Summary */}
                                                <td className="border border-indigo-200 px-3 py-2 text-center font-bold text-green-700">
                                                    <span className="inline-flex items-center gap-1 bg-green-100 px-4 py-1 rounded-full shadow-md border border-green-300">
                                                        <CheckCircle size={14} />
                                                        {presentCount}
                                                    </span>
                                                </td>

                                                {/* Absent Summary */}
                                                <td className="border border-indigo-200 px-3 py-2 text-center font-bold text-red-600">
                                                    <span className="inline-flex items-center gap-1 bg-red-100 px-4 py-1 rounded-full shadow-md border border-red-300">
                                                        <XCircle size={14} />
                                                        {daysInMonth - presentCount}
                                                    </span>
                                                </td>

                                                {/* Percentage */}
                                                <td className="border border-indigo-200 px-3 py-2 text-center">
                                                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full font-bold shadow-md border border-indigo-300">
                                                        <Award size={15} />
                                                        {((presentCount / daysInMonth) * 100).toFixed(0)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={daysInMonth + 4}
                                            className="text-center py-6 text-gray-500 text-sm"
                                        >
                                            No data available
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
