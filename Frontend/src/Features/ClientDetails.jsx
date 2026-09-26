import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "../Components/Sidebar";
import Topbar from '../Components/Topbar';
import Table from '../Components/UI/Table';
import ActionButtons from '../Components/UI/ActionButtons';
import { UPLOAD_URL } from "../API/config";
import Modal from '../Components/UI/Model';
import { useLocation, useNavigate } from "react-router-dom";
import { getAllClients } from '../API/Client';
import {
    Funnel,
    ChevronUp,
    ChevronDown,
    PanelBottom,
    CalendarDays,
    MapPin,
    PhoneCall
} from "lucide-react";

export default function ClientDetails() {
    const printRef = useRef();
    const [openICardModal, setOpenICardModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [statusFilter, setStatusFilter] = useState("all"); // all | expired | expiring | active
    const [statusSort, setStatusSort] = useState("asc");    // asc | desc

    const [sortConfig, setSortConfig] = useState({
        key: null,
        order: "asc",
    });

    const company_code = localStorage.getItem("company_code") || "";
    // ================= PRINT =================
    const handlePrint = () => {
        document.body.classList.add("print-mode");

        setTimeout(() => {
            window.print();
            document.body.classList.remove("print-mode");
        }, 300);
    };

    const handleSort = (key) => {
        let order = "asc";

        if (sortConfig.key === key && sortConfig.order === "asc") {
            order = "desc";
        }

        setSortConfig({ key, order });
    };

    const [allClients, setAllClients] = useState([]);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [tableLoader, setTableLoader] = useState(false);

    // const handleView = (row) => {
    //     setSelectedRow(row);
    //     setOpenViewModal(true);  // Correct setter function
    // };

    const navigate = useNavigate();

    const location = useLocation();

    const selectedClientId = location.state?.clientId;

    const handleUpdate = (row) => {
        navigate(`/update-client/${row.id}`);
    };
    const handleRenew = (row) => {
        navigate(`/renew-client/${row.id}`);
    };
    const handleICard = (client) => {
        setSelectedClient(client);
        setOpenICardModal(true);
    };

    const columns = [
        // { header: "Sr. No", accessor: "sr" },
        { header: "Member ID", accessor: "member_id" },
        { header: "Photo", accessor: "photo" },

        { header: "Status", accessor: "status" },
        { header: "Renew", accessor: "action" },
        { header: "Update", accessor: "action1" },

        // { header: "Update", accessor: "action1" },
        {
            header: (
                <div className="flex items-center gap-1">
                    Client Name

                    <button
                        onClick={() => handleSort("client_name")}
                        className="p-1 rounded text-[#C2FC85]"
                    >
                        {/* Default state → Funnel icon */}
                        {sortConfig.key !== "client_name" && (
                            <Funnel size={14} />
                        )}

                        {/* Sorting ASC → Up arrow */}
                        {sortConfig.key === "client_name" && sortConfig.order === "asc" && (
                            <ChevronUp size={14} />
                        )}

                        {/* Sorting DESC → Down arrow */}
                        {sortConfig.key === "client_name" && sortConfig.order === "desc" && (
                            <ChevronDown size={14} />
                        )}
                    </button>
                </div>

            ),
            accessor: "client_name",
        },

        {
            header: (
                <div className="flex items-center gap-1">
                    Reg. Date

                    <button
                        onClick={() => handleSort("reg_date")}
                        className="p-1 rounded text-[#C2FC85]"
                    >
                        {sortConfig.key !== "reg_date" && (
                            <Funnel size={14} />
                        )}

                        {sortConfig.key === "reg_date" && sortConfig.order === "asc" && (
                            <ChevronUp size={14} />
                        )}

                        {sortConfig.key === "reg_date" && sortConfig.order === "desc" && (
                            <ChevronDown size={14} />
                        )}
                    </button>
                </div>

            ),
            accessor: "reg_date",
        },
        // FIXED
        { header: "Email", accessor: "email" },
        { header: "Mobile", accessor: "mobile" },
        { header: "Category", accessor: "category_name" },
        { header: "Date of Birth", accessor: "dob" },
        { header: "From Date", accessor: "from_date" },
        { header: "To Date", accessor: "to_date" },
        { header: "Sessions", accessor: "sessions" },
        { header: "Amount / Fees", accessor: "amount" },
        { header: "Description", accessor: "description" },
    ];

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };


    const getExpiryStatus = (toDate) => {
        const today = new Date();
        const expiry = new Date(toDate);

        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                // row: "bg-red-50 text-red-700 [&_td]:text-red-700",
                badge: "bg-red-100 text-red-700",
                label: "Expired",
            };
        }

        if (diffDays <= 7) {
            return {
                // row: "bg-yellow-50 text-yellow-800 [&_td]:text-yellow-800",
                badge: "bg-yellow-100 text-yellow-800",
                label: "Expiring Soon",
            };
        }

        return {
            // row: "bg-green-50 text-green-700 [&_td]:text-green-700",
            badge: "bg-green-100 text-green-700",
            label: "Active",
        };
    };


    const getExpiryPriority = (toDate) => {
        const today = new Date();
        const expiry = new Date(toDate);

        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 1;     // ✅ Expired → TOP
        if (diffDays <= 7) return 2;   // ✅ Expiring → MIDDLE
        return 3;                      // ✅ Active → LAST
    };

    const filteredAndSortedClients = selectedClientId
        ? allClients.filter(
            (client) => String(client.id) === String(selectedClientId)
        )
        : [...allClients];

    let sortedClients = [...filteredAndSortedClients];

    if (sortConfig.key === "reg_date") {
        sortedClients.sort((a, b) => {
            const dateA = new Date(a.reg_date);
            const dateB = new Date(b.reg_date);
            return sortConfig.order === "asc" ? dateA - dateB : dateB - dateA;
        });
    }

    if (sortConfig.key === "client_name") {
        sortedClients.sort((a, b) => {
            const nameA = a.client_name.toLowerCase();
            const nameB = b.client_name.toLowerCase();
            return sortConfig.order === "asc"
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }
    sortedClients = sortedClients
        .filter((item) => {
            const priority = getExpiryPriority(item.to_date);

            if (statusFilter === "expired") return priority === 1;
            if (statusFilter === "expiring") return priority === 2;
            if (statusFilter === "active") { return priority === 3 || priority === 3; }

            return true; // all
        })
        .sort((a, b) => {
            const diff =
                getExpiryPriority(a.to_date) - getExpiryPriority(b.to_date);

            return statusSort === "asc" ? diff : -diff;
        });

    const formattedClients = sortedClients.map((item, index) => {

        const expiryStatus = getExpiryStatus(item.to_date);

        return {
            ...item,
            // sr: index + 1,
            rowClass: expiryStatus.row,

            client_name: item.client_name?.trim(),
            category_name: item.category_name?.trim(),
            dob: formatDate(item.dob),
            from_date: formatDate(item.from_date),
            to_date: formatDate(item.to_date),
            reg_date: formatDate(item.reg_date),

            status: (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${expiryStatus.badge}`}>
                    {expiryStatus.label}
                </span>
            ),

            amount: `₹ ${item.amount}`,
        };
    });

    const expiredCount = allClients.filter(c => getExpiryPriority(c.to_date) === 1).length;
    const expiringCount = allClients.filter(c => getExpiryPriority(c.to_date) === 2).length;
    const activeCount = allClients.filter(c => getExpiryPriority(c.to_date) === 3).length;
    const totalCount = allClients.length;

    // const viewSessions = [
    //     { header: "Session No.", accessor: "no" },
    //     { header: "Session Date", accessor: "sessionDate" },
    // ];

    // const sessionData = Array.from({ length: 12 }).map((_, index) => ({
    //     no: `Session ${index + 1}`,
    //     sessionDate: new Date().toLocaleDateString(),
    // }));


    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setTableLoader(true);
        try {
            const data = await getAllClients();
            setAllClients(data);
            setTableLoader(false);
        } catch (error) {
            console.error("Error fetching clients:", error);
            setTableLoader(false);
        }
    };

    console.log("fetch clients", allClients);


    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-18 overflow-x-auto">
                <Topbar
                    title="Clients List"
                />

                <div className="bg-white p-4 rounded-lg shadow-md">

                    <Table
                        tableTitle="Clients Details"
                        columns={columns}
                        data={sortedClients.map((client) => ({
                            ...client,

                            dob: formatDate(client.dob),
                            from_date: formatDate(client.from_date),
                            to_date: formatDate(client.to_date),
                            reg_date: formatDate(client.reg_date),

                            status: (() => {
                                const expiryStatus = getExpiryStatus(client.to_date);
                                return (
                                    <span
                                        className={`inline-block min-w-max px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${expiryStatus.badge}`}
                                    >
                                        {expiryStatus.label}
                                    </span>
                                );
                            })(),


                            amount: `₹ ${client.amount}`,

                            action: (
                                <ActionButtons
                                    showRenew={true}
                                    onRenew={() => handleRenew(client)}
                                />
                            ),
                            photo: (
                                <div className="flex justify-center">
                                    <div className="w-10 h-10 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {client.photo ? (
                                            <img
                                                src={`${UPLOAD_URL}/${client.photo}`}
                                                alt="client"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                    e.currentTarget.nextElementSibling.style.display = "flex";
                                                }}
                                            />
                                        ) : null}

                                        <div
                                            className="w-full h-full items-center justify-center text-gray-600 font-semibold text-sm"
                                            style={{ display: client.photo ? "none" : "flex" }}
                                        >
                                            {(() => {
                                                const name = client.client_name?.trim().split(/\s+/) || [];
                                                const first = name[0]?.charAt(0) || "";
                                                const last =
                                                    name.length > 1
                                                        ? name[name.length - 1]?.charAt(0)
                                                        : "";

                                                return `${first}${last}`.toUpperCase();
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ),


                            action1: (
                                <ActionButtons
                                    showUpdate={true}
                                    onUpdate={() => handleUpdate(client)}
                                />
                            ),
                            // action: (
                            //     <ActionButtons
                            //         showRenew={true}
                            //         onRenew={() => handleRenew(client)}
                            //     />
                            // ),

                            // action1: (
                            //     <ActionButtons
                            //         showUpdate={true}
                            //         onUpdate={() => handleUpdate(client)}
                            //     />
                            // ),
                        }))}
                        loading={tableLoader}

                        headerActions={
                            <div className="grid grid-cols-2 min-[931px]:grid-cols-4 gap-2 w-full">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
          ${statusFilter === "all"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-100 text-gray-700"}`}
                                >
                                    All - {totalCount}
                                </button>

                                <button
                                    onClick={() => setStatusFilter("expired")}
                                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
          ${statusFilter === "expired"
                                            ? "bg-red-600 text-white"
                                            : "bg-red-100 text-red-700"}`}
                                >
                                    Expired - {expiredCount}
                                </button>

                                <button
                                    onClick={() => setStatusFilter("expiring")}
                                    className={`px-2 py-2 rounded-full text-sm font-medium whitespace-nowrap
          ${statusFilter === "expiring"
                                            ? "bg-yellow-500 text-white"
                                            : "bg-yellow-100 text-yellow-800"}`}
                                >
                                    Expiring - {expiringCount}
                                </button>

                                <button
                                    onClick={() => setStatusFilter("active")}
                                    className={`px-2 py-2 rounded-full text-sm font-medium whitespace-nowrap
          ${statusFilter === "active"
                                            ? "bg-green-600 text-white"
                                            : "bg-green-100 text-green-700"}`}
                                >
                                    Active - {activeCount + expiringCount}
                                </button>
                            </div>
                        }
                    />

                </div>
            </div>

        </div>

    )
}
