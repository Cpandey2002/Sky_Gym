import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import { getAllClients } from "../API/Client";
import { CakeSlice } from "lucide-react";
import Table from "../Components/UI/Table";

export default function BirthdayList() {

    // ---------- STATES ----------
    const [todayBirthdays, setTodayBirthdays] = useState([]);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
    const [monthWiseBirthdays, setMonthWiseBirthdays] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [tableLoader, setTableLoader] = useState(false);
    const [activeTab, setActiveTab] = useState("today"); // today | upcoming | monthwise

    // ---------- FETCH CLIENTS ----------
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setTableLoader(true);
        try {
            const data = await getAllClients();
            processBirthdays(data);
            setTableLoader(false);
        } catch (error) {
            console.error("API Error:", error);
        }
    };

    // ---------- DATE FORMATTER ----------
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (isNaN(date)) return "—";

        const dd = String(date.getDate()).padStart(2, "0");
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const yyyy = date.getFullYear();

        return `${dd}/${mm}/${yyyy}`;
    };

    // ---------- TABLE COLUMNS ----------
    const birthdayColumns = [
        { header: "Sr No", accessor: "sr" },
        { header: "Client Name", accessor: "client_name" },
        { header: "Member ID", accessor: "member_id" },
        { header: "Date of Birth", accessor: "dob" },
    ];

    // ---------- PROCESS BIRTHDAYS ----------
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const processMonthWise = (clients) => {
        let monthGroups = {};

        clients.forEach((client) => {
            if (!client.dob) return;

            const dob = new Date(client.dob);
            const month = dob.getMonth(); // 0–11

            if (!monthGroups[month]) monthGroups[month] = [];

            monthGroups[month].push({
                sr: monthGroups[month].length + 1,
                client_name: client.client_name,
                member_id: client.member_id,
                dob: formatDate(client.dob),
            });
        });

        return monthGroups;
    };

    const processBirthdays = (clients) => {
        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDate = today.getDate();

        let todayList = [];
        let upcomingList = [];

        clients.forEach((client) => {
            if (!client.dob) return;

            const dob = new Date(client.dob);
            const dobMonth = dob.getMonth() + 1;
            const dobDate = dob.getDate();

            // 🎉 TODAY'S BIRTHDAY
            if (dobMonth === todayMonth && dobDate === todayDate) {
                todayList.push(client);
            }

            // 🗓 UPCOMING (Next 7 days)
            const upcomingDate = new Date(today);
            upcomingDate.setDate(today.getDate() + 7);

            const birthdayThisYear = new Date(
                today.getFullYear(),
                dob.getMonth(),
                dob.getDate()
            );

            if (birthdayThisYear > today && birthdayThisYear <= upcomingDate) {
                upcomingList.push(client);
            }
        });

        // Format Today Birthdays
        setTodayBirthdays(
            todayList.map((c, i) => ({
                sr: i + 1,
                client_name: c.client_name,
                dob: formatDate(c.dob),
                member_id: c.member_id,
            }))
        );

        // Format Upcoming Birthdays
        setUpcomingBirthdays(
            upcomingList.map((c, i) => ({
                sr: i + 1,
                client_name: c.client_name,
                dob: formatDate(c.dob),
                member_id: c.member_id,
            }))
        );

        // Month-wise grouping
        setMonthWiseBirthdays(processMonthWise(clients));
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem]  pt-16 overflow-x-auto">
                <Topbar />

                <div className="p-6 space-y-2 flex  gap-2">
                    <div
                        className={`bg-gradient-to-r from-[#1e4543] to-[#1e4543] 
                                        w-9 h-9  rounded-xl flex items-center justify-center shadow-sm`}
                    >
                       <CakeSlice className="inline  text-[#C2FC85]" />
                    </div>
                    <span className="text-2xl font-semibold  text-gray-800">
                        Birthday List
                    </span>
                </div>

                {/* ---------- TABS HEADER ---------- */}
                <div className="px-6">
                    <div className="flex gap-4  border-b-2 border-[#e8e0e0] pb-2">
                        <button
                            className={`px-4 py-2 font-semibold ${activeTab === "today" ? "text-[#1e4543] border-b-2 border-[#1e4543]" : "text-gray-600"
                                }`}
                            onClick={() => setActiveTab("today")}
                        >
                            Today
                        </button>

                        <button
                            className={`px-4 py-2 font-semibold ${activeTab === "upcoming" ? "text-[#1e4543] border-b-2 border-[#1e4543]" : "text-gray-600"
                                }`}
                            onClick={() => setActiveTab("upcoming")}
                        >
                            Upcoming
                        </button>

                        <button
                            className={`px-4 py-2 font-semibold ${activeTab === "monthwise" ? "text-[#1e4543] border-b-2 border-[#1e4543]" : "text-gray-600"
                                }`}
                            onClick={() => setActiveTab("monthwise")}
                        >
                            Month-wise
                        </button>
                    </div>
                </div>

                {/* ---------- TAB CONTENT ---------- */}
                <div className="px-6 mt-6">

                    {/* TODAY */}
                    {activeTab === "today" && (
                        <Table
                            tableTitle="Today's Birthdays"
                            columns={birthdayColumns}
                            data={todayBirthdays}
                            loading={tableLoader}
                            showExport={false}
                        />
                    )}

                    {/* UPCOMING */}
                    {activeTab === "upcoming" && (
                        <Table
                            tableTitle="Upcoming Birthdays (Next 7 Days)"
                            columns={birthdayColumns}
                            data={upcomingBirthdays}
                            loading={tableLoader}
                            showExport={false}
                        />
                    )}

                    {/* MONTHWISE */}
                    {activeTab === "monthwise" && (
                        <div className="space-y-6">

                            {/* Month Selector */}
                            <select
                                className=" appearance-none w-36 px-4 py-2.5
      bg-white/80 backdrop-blur-md
      border border-[#C2FC85] rounded-xl
      shadow-sm text-gray-700 font-semibold
      focus:outline-none focus:ring-4 focus:ring-[#C2FC85]/40
      hover:border-[#C2FC85] hover:shadow-[#C2FC85]/40
      transition-all duration-200"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i} value={i}>{m}</option>
                                ))}
                            </select>

                            <Table
                                tableTitle={`${monthNames[selectedMonth]} Birthdays`}
                                columns={birthdayColumns}
                                data={monthWiseBirthdays[selectedMonth] || []}
                                loading={tableLoader}
                                showExport={false}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
