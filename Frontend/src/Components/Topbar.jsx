import React, { useState, useEffect } from "react";

import {
    Bell,
    User,
    Mail,
    ChevronRight,
    X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getAllClients } from "../API/Client";
import CompanyLogo from "../Features/CompanyLogo";

const Topbar = ({ rightContent }) => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState({
        birthdayToday: [],
        birthdayUpcoming: [],
        expired: [],
        expiring: [],
        expiringOneMonth: [],
    });

    // Read Unread
    const [notificationsRead, setNotificationsRead] = useState(false);
    const [notificationTab, setNotificationTab] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Profile section click outside popup close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".profile-menu")) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Which notification category is open
    const [openCategory, setOpenCategory] = useState(null);

    // Birthday list view: today / upcoming
    const [birthdayView, setBirthdayView] = useState(null);

    // Selected client detail
    const [selectedClient, setSelectedClient] = useState(null);

    const company_code =
        localStorage.getItem("company_code") || "";

    const company_name =
        localStorage.getItem("company_name") || "Company";

    const [expiringTab, setExpiringTab] = useState("7days");

    // =========================================
    // FETCH CLIENTS
    // =========================================
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await getAllClients();

            console.log("Topbar clients:", data);

            filterNotifications(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Topbar notification error:",
                error
            );
        }
    };

    // =========================================
    // NORMALIZE DATE
    // =========================================
    const normalizeDate = (date) => {
        if (!date) return null;

        const d = new Date(date);

        if (isNaN(d.getTime())) return null;

        d.setHours(0, 0, 0, 0);

        return d;
    };

    // =========================================
    // FORMAT DATE
    // =========================================
    const formatDate = (date) => {
        if (!date) return "-";

        const d = new Date(date);

        if (isNaN(d.getTime())) return "-";

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const formatBirthdayDate = (date) => {
        if (!date) return "";

        const d = new Date(date);

        if (isNaN(d.getTime())) return "";

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // =========================================
    // BIRTHDAY + EXPIRED + EXPIRING
    // =========================================
    const filterNotifications = (clients) => {
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);

        const birthdayToday = [];
        const birthdayUpcoming = [];
        const expired = [];
        const expiring = [];
        const expiringOneMonth = [];

        clients.forEach((client) => {
            // =================================
            // BIRTHDAY
            // =================================
            if (client.dob) {
                const dob = normalizeDate(client.dob);

                if (dob) {
                    const dobMonth = dob.getMonth();
                    const dobDate = dob.getDate();

                    // TODAY BIRTHDAY
                    const isTodayBirthday =
                        dobMonth === today.getMonth() &&
                        dobDate === today.getDate();

                    if (isTodayBirthday) {
                        birthdayToday.push({
                            ...client,
                            birthdayDate: new Date(
                                today.getFullYear(),
                                dobMonth,
                                dobDate
                            ),
                        });
                    }

                    // UPCOMING BIRTHDAY
                    let nextBirthday = new Date(
                        today.getFullYear(),
                        dobMonth,
                        dobDate
                    );

                    nextBirthday.setHours(0, 0, 0, 0);

                    // If birthday already passed
                    if (nextBirthday < today) {
                        nextBirthday.setFullYear(
                            today.getFullYear() + 1
                        );
                    }

                    if (
                        nextBirthday >= today &&
                        nextBirthday <= sevenDaysLater
                    ) {
                        birthdayUpcoming.push({
                            ...client,
                            birthdayDate: nextBirthday,
                        });
                    }
                }
            }

            // =================================
            // EXPIRED - ONLY YESTERDAY
            // =================================
            if (client.to_date) {
                const expiry = normalizeDate(
                    client.to_date
                );

                if (expiry) {
                    if (
                        expiry.getTime() ===
                        yesterday.getTime()
                    ) {
                        expired.push(client);
                    }

                    // =================================
                    // EXPIRING - TODAY TO NEXT 7 DAYS
                    // =================================
                    if (
                        expiry >= today &&
                        expiry <= sevenDaysLater
                    ) {
                        expiring.push(client);
                    }

                    // =================================
                    // EXPIRING - AFTER 7 DAYS TO 1 MONTH
                    // =================================
                    if (
                        expiry >= today &&
                        expiry <= oneMonthLater
                    ) {
                        expiringOneMonth.push(client);
                    }
                }
            }
        });

        const newNotifications = {
            birthdayToday,
            birthdayUpcoming,
            expired,
            expiring,
            expiringOneMonth,
        };

        const notificationKey =
            `readNotifications_${company_code}`;

        const currentNotificationIds = [
            ...birthdayToday.map(
                (client) =>
                    `birthday-${client.id || client.member_id}`
            ),
            ...expired.map(
                (client) =>
                    `expired-${client.id || client.member_id}-${client.to_date}`
            ),
            ...expiring.map(
                (client) =>
                    `expiring-${client.id || client.member_id}-${client.to_date}`
            ),
        ];

        const readNotifications = JSON.parse(
            localStorage.getItem(notificationKey) || "[]"
        );

        const hasNewNotification =
            currentNotificationIds.some(
                (id) => !readNotifications.includes(id)
            );

        setNotificationsRead(!hasNewNotification);

        setNotifications(newNotifications);
    };

    // =========================================
    // TOTAL NOTIFICATION COUNT
    // =========================================
    const totalNotifications =
        notifications.birthdayToday.length +
        notifications.expired.length +
        notifications.expiring.length;

    // =========================================
    // CLIENT DETAILS
    // =========================================
    const handleClientClick = (client) => {
        // IMPORTANT:
        // Do NOT navigate.
        // Client details will open inside popup.
        setSelectedClient(client);
    };

    // =========================================
    // BACK FROM CLIENT DETAILS
    // =========================================
    const closeClientDetails = () => {
        setSelectedClient(null);
    };

    // =========================================
    // LOGOUT
    // =========================================
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
    };

    // =========================================
    // CATEGORY TOGGLE
    // =========================================
    const toggleCategory = (category) => {
        setOpenCategory((prev) =>
            prev === category ? null : category
        );

        setBirthdayView(null);
        setSelectedClient(null);
    };

    // =========================================
    // BIRTHDAY VIEW
    // =========================================
    const openBirthdayView = (type) => {
        setBirthdayView(type);
        setNotificationTab(type);
        setOpenCategory(null);
        setSelectedClient(null);
    };

    const closeBirthdayView = () => {
        setBirthdayView(null);
        setSelectedClient(null);
    };

    // =========================================
    // NOTIFICATION TAB
    // =========================================
    const handleNotificationTab = (tab) => {
        setNotificationTab(tab);
        setBirthdayView(null);
        setOpenCategory(null);
        setSelectedClient(null);
    };

    // =========================================
    // CLOSE NOTIFICATION PANEL
    // =========================================
    const closeNotificationPanel = () => {
        setShowNotifications(false);
        setBirthdayView(null);
        setOpenCategory(null);
        setSelectedClient(null);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 w-full bg-black px-4 py-3 flex justify-end items-center">

            <div className="relative flex items-center gap-4">

                {/* =====================================
                            BELL
                    ====================================== */}

                <div
                    onClick={() => {
                        setShowNotifications(
                            !showNotifications
                        );

                        // Notification read
                        const notificationKey =
                            `readNotifications_${company_code}`;

                        const currentNotificationIds = [
                            ...notifications.birthdayToday.map(
                                (client) =>
                                    `birthday-${client.id || client.member_id}`
                            ),
                            ...notifications.expired.map(
                                (client) =>
                                    `expired-${client.id || client.member_id}-${client.to_date}`
                            ),
                            ...notifications.expiring.map(
                                (client) =>
                                    `expiring-${client.id || client.member_id}-${client.to_date}`
                            ),
                        ];

                        localStorage.setItem(
                            notificationKey,
                            JSON.stringify(
                                currentNotificationIds
                            )
                        );

                        setNotificationsRead(true);
                        setShowProfileMenu(false);

                        // DEFAULT TAB = EXPIRED
                        setOpenCategory("expired");

                        setBirthdayView(null);
                        setSelectedClient(null);
                    }}
                    className="relative cursor-pointer p-2 rounded-full bg-[#C2FC85]"
                >
                    <Bell size={22} />

                    {/* NOTIFICATION COUNT */}
                    {totalNotifications > 0 &&
                        !notificationsRead && (
                            <span
                                className="
                                    absolute -top-1 -right-1
                                    min-w-[20px] h-5 px-1
                                    flex items-center justify-center
                                    bg-red-500 text-white
                                    text-xs font-bold
                                    rounded-full
                                "
                            >
                                {totalNotifications > 99
                                    ? "99+"
                                    : totalNotifications}
                            </span>
                        )}
                </div>

                {/* =====================================
                            PROFILE
                    ====================================== */}

                <div className="relative profile-menu">

                    <div
                        onClick={() => {
                            setShowProfileMenu(
                                !showProfileMenu
                            );

                            setShowNotifications(false);
                            setSelectedClient(null);
                        }}
                        className="cursor-pointer"
                    >
                        <CompanyLogo
                            companyCode={company_code}
                            className="w-12 h-8 rounded-full border-2 border-[#C2FC85] object-cover"
                        />
                    </div>

                    {/* PROFILE DROPDOWN */}

                    {showProfileMenu && (
                        <div
                            className="
                                absolute right-0 mt-3
                                w-64 bg-white
                                rounded-2xl shadow-xl
                                overflow-hidden
                            "
                        >
                            {/* PROFILE */}

                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    navigate("/profile");
                                }}
                                className="
                                    w-full px-4 py-3
                                    flex items-center gap-3
                                    hover:bg-gray-100
                                "
                            >
                                <User size={18} />
                                Profile
                            </button>

                            {/* MESSAGE */}

                            <button
                                className="
                                    w-full px-4 py-3
                                    flex items-center gap-3
                                    hover:bg-gray-100
                                "
                            >
                                <Mail size={18} />
                                My Messages
                            </button>

                            {/* LOGOUT */}
                            {/*
                            <button
                                onClick={handleLogout}
                                className="
                                    w-full px-4 py-3
                                    text-left text-red-500
                                    hover:bg-gray-100
                                "
                            >
                                Logout
                            </button>
                            */}
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================
                    NOTIFICATION PANEL
                ========================================== */}

            {showNotifications && (
                <>
                    {/* OUTSIDE CLICK OVERLAY */}

                    <div
                        className="fixed inset-0 z-40"
                        onClick={closeNotificationPanel}
                    />

                    {/* NOTIFICATION PANEL */}

                    <div
                        className="
                            absolute top-16 right-4
                            z-50
                            w-[350px]
                            max-w-[calc(100vw-2rem)]
                            bg-white
                            rounded-xl
                            shadow-2xl
                            overflow-hidden
                            border
                        "
                    >

                        {/* =================================
                            HEADER
                        ================================= */}

                        <div
                            className="
                                px-4 py-3
                                bg-black
                                text-white
                                font-semibold
                                flex justify-between
                                items-center
                            "
                        >
                            <div className="flex items-center gap-2">

                                {(selectedClient ||
                                    openCategory ||
                                    birthdayView) && (
                                    <button
                                        type="button"
                                        onClick={() => {

                                            // Client Details se category par wapas
                                            if (selectedClient) {
                                                setSelectedClient(null);
                                                return;
                                            }

                                            // Category se Notifications main screen par
                                            setOpenCategory(null);
                                            setBirthdayView(null);
                                        }}
                                        className="
                                            absolute right-12
                                            w-7 h-7
                                            rounded-full
                                            flex items-center
                                            justify-center
                                            hover:text-gray-900
                                            hover:bg-gray-100
                                            text-xl
                                            font-semibold
                                        "
                                    >
                                        <X size={16} />
                                    </button>
                                )}

                                <span>
                                    {selectedClient
                                        ? "Client Details"
                                        : openCategory === "expired"
                                            ? "Expired"
                                            : openCategory === "expiring"
                                                ? "Expiring"
                                                : birthdayView
                                                    ? "Birthday"
                                                    : "Notifications"}
                                </span>
                            </div>

                            {totalNotifications > 0 &&
                                !birthdayView &&
                                !selectedClient &&
                                openCategory !== "expired" &&
                                openCategory !== "expiring" && (
                                    <span
                                        className="
                                            bg-[#C2FC85]
                                            text-[#1e4543]
                                            px-2 py-1
                                            rounded-full
                                            text-xs
                                        "
                                    >
                                        {totalNotifications}
                                    </span>
                                )}
                        </div>

                        {/* =========================================
                            NOTIFICATION TABS
                            ALWAYS VISIBLE
                        ========================================= */}

                        {!selectedClient && (
                            <div className="flex border-b bg-white text-black">

                                {/* EXPIRED */}

                                <div
                                    onClick={() => {
                                        setOpenCategory("expired");
                                        setBirthdayView(null);
                                        setSelectedClient(null);
                                    }}
                                    className={`flex-1 py-3 text-center text-sm font-semibold cursor-pointer ${
                                        openCategory === "expired"
                                            ? "text-black border-b-2 border-[#1e4543]"
                                            : "text-black hover:text-gray-700"
                                    }`}
                                >
                                    Expired
                                </div>

                                {/* BIRTHDAY */}

                                <div
                                    onClick={() => {
                                        setBirthdayView("upcoming");
                                        setOpenCategory(null);
                                        setSelectedClient(null);
                                    }}
                                    className={`flex-1 py-3 text-center text-sm font-semibold cursor-pointer ${
                                        birthdayView
                                            ? "text-black border-b-2 border-[#1e4543]"
                                            : "text-black hover:text-gray-700"
                                    }`}
                                >
                                    Birthday
                                </div>

                                {/* EXPIRING */}

                                <div
                                    onClick={() => {
                                        setOpenCategory("expiring");
                                        setBirthdayView(null);
                                        setSelectedClient(null);
                                        setExpiringTab("1month");
                                    }}
                                    className={`flex-1 py-3 text-center text-sm font-semibold cursor-pointer ${
                                        openCategory === "expiring"
                                            ? "text-black border-b-2 border-[#1e4543]"
                                            : "text-black hover:text-gray-700"
                                    }`}
                                >
                                    Expiring
                                </div>

                            </div>
                        )}

                        {/* =================================
                            CLIENT DETAIL VIEW
                        ================================= */}

                        {selectedClient ? (

                            <div>

                                {/* CLIENT DETAILS */}

                                <div className="p-2 bg-gray-50 max-h-[350px] overflow-y-auto">

                                    {/* NAME */}

                                    <div className="bg-white rounded-lg p-2 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Client Name
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.client_name || "-"}
                                        </p>
                                    </div>

                                    {/* MEMBER ID */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Member ID
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.memberId ||
                                                selectedClient.member_id ||
                                                "-"}
                                        </p>
                                    </div>

                                    {/* MOBILE */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Mobile
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.mobile || "-"}
                                        </p>
                                    </div>

                                    {/* EMAIL */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Email
                                        </p>

                                        <p className="font-semibold text-gray-800 break-words">
                                            {selectedClient.email || "-"}
                                        </p>
                                    </div>

                                    {/* DOB */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Date of Birth
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.dob
                                                ? formatBirthdayDate(
                                                    selectedClient.dob
                                                )
                                                : "-"}
                                        </p>
                                    </div>

                                    {/* FROM DATE */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            From Date
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.from_date
                                                ? formatDate(
                                                    selectedClient.from_date
                                                )
                                                : "-"}
                                        </p>
                                    </div>

                                    {/* TO DATE */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            To Date
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.to_date
                                                ? formatDate(
                                                    selectedClient.to_date
                                                )
                                                : "-"}
                                        </p>
                                    </div>

                                    {/* CATEGORY */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Category
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.category_name ||
                                                selectedClient.category ||
                                                "-"}
                                        </p>
                                    </div>

                                    {/* ADDRESS */}

                                    <div className="bg-white rounded-lg p-3 mb-3">
                                        <p className="text-xs text-gray-500">
                                            Address
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.address || "-"}
                                        </p>
                                    </div>

                                    {/* AMOUNT */}

                                    <div className="bg-white rounded-lg p-3 mb-1">
                                        <p className="text-xs text-gray-500">
                                            Amount
                                        </p>

                                        <p className="font-semibold text-gray-800">
                                            {selectedClient.amount ?? "-"}
                                        </p>
                                    </div>

                                </div>
                            </div>

                        ) : birthdayView ? (

                            /* =================================
                                BIRTHDAY LIST VIEW
                            ================================= */

                            <div>

                                <div className="bg-gray-50">

                                    {notifications.birthdayUpcoming.length === 0 ? (

                                        <div className="px-5 py-5 text-sm text-black text-center">
                                            No birthdays found.
                                        </div>

                                    ) : (

                                        notifications.birthdayUpcoming.map(
                                            (client) => (

                                                <div
                                                    key={`birthday-${birthdayView}-${client.id}`}
                                                    className="
                                                        px-5 py-4
                                                        border-b
                                                        bg-white
                                                    "
                                                >

                                                    <div className="flex justify-between items-center gap-3">

                                                        {/* CLIENT NAME */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleClientClick(
                                                                    client
                                                                )
                                                            }
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-gray-800
                                                                hover:text-[#1e4543]
                                                                hover:underline
                                                                text-left
                                                            "
                                                        >
                                                            {client.client_name}
                                                        </button>

                                                        {/* BIRTHDAY DATE */}

                                                        <span
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                text-pink-600
                                                                whitespace-nowrap
                                                            "
                                                        >
                                                            {formatBirthdayDate(
                                                                client.birthdayDate
                                                            )}
                                                        </span>

                                                    </div>
                                                </div>
                                            )
                                        )
                                    )}

                                </div>
                            </div>

                        ) : openCategory === "expired" ? (

                            /* =================================
                                EXPIRED CLIENT LIST
                            ================================= */

                            <div className="max-h-[250px] overflow-y-auto">

                                {notifications.expired.length === 0 ? (

                                    <div className="px-5 py-5 text-sm text-black text-center">
                                        No expired clients found.
                                    </div>

                                ) : (

                                    notifications.expired.map((client) => (

                                        <div
                                            key={`expired-${client.id}`}
                                            className="
                                                px-5 py-4
                                                border-b
                                                bg-white
                                                flex justify-between
                                                items-center gap-3
                                            "
                                        >

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleClientClick(
                                                        client
                                                    )
                                                }
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-gray-800
                                                    hover:text-[#1e4543]
                                                    hover:underline
                                                    text-left
                                                "
                                            >
                                                {client.client_name}
                                            </button>

                                            <span className="text-xs text-red-600 whitespace-nowrap">
                                                Expired
                                            </span>

                                        </div>
                                    ))
                                )}

                            </div>

                        ) : openCategory === "expiring" ? (

                            /* =================================
                                EXPIRING CLIENT LIST
                            ================================= */

                            <div>

                                <div className="max-h-[250px] overflow-y-auto">

                                    {notifications.expiringOneMonth.length === 0 ? (

                                        <div className="px-5 py-5 text-sm text-gray-500 text-center">
                                            No expiring clients found.
                                        </div>

                                    ) : (

                                        notifications.expiringOneMonth.map(
                                            (client) => (

                                                <div
                                                    key={`expiring-month-${client.id}`}
                                                    className="
                                                        px-5 py-4
                                                        border-b
                                                        bg-white
                                                        flex justify-between
                                                        items-center gap-3
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleClientClick(
                                                                client
                                                            )
                                                        }
                                                        className="
                                                            text-sm
                                                            font-semibold
                                                            text-gray-800
                                                            hover:text-[#1e4543]
                                                            hover:underline
                                                            text-left
                                                        "
                                                    >
                                                        {client.client_name}
                                                    </button>

                                                    <span className="text-xs text-yellow-600 whitespace-nowrap">
                                                        {client.to_date
                                                            ? formatDate(
                                                                client.to_date
                                                            )
                                                            : "-"}
                                                    </span>

                                                </div>
                                            )
                                        )
                                    )}

                                </div>

                            </div>

                        ) : null}

                    </div>
                </>
            )}
        </div>
    );
};

export default Topbar;