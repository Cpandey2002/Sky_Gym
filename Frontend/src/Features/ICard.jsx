import React, { useState, useEffect, useRef } from 'react';
import Sidebar from "../Components/Sidebar";
import Topbar from '../Components/Topbar';
import Table from '../Components/UI/Table2';
import ActionButtons from '../Components/UI/ActionButtons';
import Modal from '../Components/UI/Model';
import { useNavigate } from 'react-router-dom';
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
import { QRCodeCanvas } from "qrcode.react";
import '../App.css'
import ClientPhoto from './ClientPhoto';
import { loadProtectedImage } from "../API/loadProtectedImage";
import CompanyLogo from './CompanyLogo';


export default function Icard() {

    const [selectedClients, setSelectedClients] = useState([]);
    const printRef = useRef();
    const [openICardModal, setOpenICardModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientPhoto, setClientPhoto] = useState("/default-avatar.png");

    const [statusFilter, setStatusFilter] = useState("all"); // all | expired | expiring | active
    const [statusSort, setStatusSort] = useState("asc");    // asc | desc

    const [sortConfig, setSortConfig] = useState({
        key: null,
        order: "asc",
    });

    const company_code = localStorage.getItem("company_code") || "";
    // ================= PRINT =================
    const handlePrint = (type = "multiple") => {

        document.body.classList.add("print-mode");

        if (type === "single") {
            document.getElementById("print-area-single")?.classList.remove("d-none");
            document.getElementById("print-area-multiple")?.classList.add("d-none");
        } else {
            document.getElementById("print-area-multiple")?.classList.remove("d-none");
            document.getElementById("print-area-single")?.classList.add("d-none");
        }

        window.print();

        setTimeout(() => {
            document.body.classList.remove("print-mode");
        }, 500);
    };

    useEffect(() => {

        const fetchPhoto = async () => {

            if (!selectedClient?.member_id) {
                setClientPhoto("/default-avatar.png");
                return;
            }

            const path = `/uploads/client/${selectedClient.member_id.replace(/\//g, "")}.png`;

            const url = await loadProtectedImage(path);

            setClientPhoto(url || "/default-avatar.png");

        };

        fetchPhoto();

    }, [selectedClient]);



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
    const filteredAndSortedClients = [...allClients];

    // let sortedClients = [...filteredAndSortedClients];

    // if (sortConfig.key === "reg_date") {
    //     sortedClients.sort((a, b) => {
    //         const dateA = new Date(a.reg_date);
    //         const dateB = new Date(b.reg_date);
    //         return sortConfig.order === "asc" ? dateA - dateB : dateB - dateA;
    //     });
    // }
    let sortedClients = [...filteredAndSortedClients].filter(client => {
        const today = new Date();
        const expiry = new Date(client.to_date);

        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        return diffDays > 7; // Only ACTIVE clients
    });

    if (sortConfig.key === "client_name") {
        sortedClients.sort((a, b) => {
            const nameA = (a.client_name || "").toLowerCase();
            const nameB = (b.client_name || "").toLowerCase();
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
            if (statusFilter === "active") return priority === 2 || priority === 3;

            return true;
        })
        .sort((a, b) => {
            const diff =
                getExpiryPriority(a.to_date) -
                getExpiryPriority(b.to_date);

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
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${expiryStatus.badge}`}>
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
    // ✅ SELECT ONE CLIENT
    const handleSelectClient = (client) => {
        setSelectedClients(prev => {
            const exists = prev.find(c => c.id === client.id);

            if (exists) {
                return prev.filter(c => c.id !== client.id);
            } else {
                return [...prev, client];
            }
        });
    };


    // ✅ SELECT ALL CLIENTS
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedClients(sortedClients);
        } else {
            setSelectedClients([]);
        }
    };

    const columns = [
        // { header: "Sr. No", accessor: "sr" },

        {
            header:
                <input
                    type="checkbox"
                    checked={
                        selectedClients.length === sortedClients.length &&
                        sortedClients.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />,
            accessor: "select",
            sticky: "left",
            left: "0px"
        },

        {
            header: "I-Card",
            accessor: "icard",
            sticky: "left",
            left: "60px"
        },

        {
            header: "Update",
            accessor: "action1",
            sticky: "left",
            left: "140px"
        },

        { header: "Member ID", accessor: "member_id" },
        { header: "Photo", accessor: "photo" },
        { header: "Status", accessor: "status" },

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
        // { header: "Amount / Fees", accessor: "amount" },
        // { header: "Description", accessor: "description" },

    ];

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-18 overflow-x-auto">
                <Topbar
                    title="Clients List"
                />

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">

                    <Table
                        tableTitle="ICard Details"
                        columns={columns}
                        data={sortedClients.map((client) => ({
                            ...client,


                            select: (
                                <input
                                    type="checkbox"
                                    checked={selectedClients.some(c => c.id === client.id)}
                                    onChange={() => handleSelectClient(client)}
                                />
                            ),

                            dob: formatDate(client.dob),
                            from_date: formatDate(client.from_date),
                            to_date: formatDate(client.to_date),
                            reg_date: formatDate(client.reg_date),

                            status: (() => {
                                const expiryStatus = getExpiryStatus(client.to_date);

                                return (
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${expiryStatus.badge}`}
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
                                    <ClientPhoto memberId={client.member_id} />
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

                            action1: (
                                <ActionButtons
                                    showUpdate={true}
                                    onUpdate={() => handleUpdate(client)}
                                />
                            ),

                            icard: (
                                <button
                                    onClick={() => handleICard(client)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    I-Card
                                </button>
                            ),

                        }))}
                        loading={tableLoader}

                        headerActions={
                            <>
                                {/* <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-5 py-2 rounded-full text-sm font-medium
          ${statusFilter === "all"
                                            ? "bg-gray-700 text-white"
                                            : "bg-gray-100 text-gray-700"}`}
                                >
                                    All - {totalCount}
                                </button> */}

                                {/* <button
                                    onClick={() => setStatusFilter("expired")}
                                    className={`px-5 py-2 rounded-full text-sm font-medium
          ${statusFilter === "expired"
                                            ? "bg-red-600 text-white"
                                            : "bg-red-100 text-red-700"}`}
                                >
                                    Expired - {expiredCount}
                                </button> */}

                                {/* <button
                                    onClick={() => setStatusFilter("expiring")}
                                    className={`px-5 py-2 rounded-full text-sm font-medium
          ${statusFilter === "expiring"
                                            ? "bg-yellow-500 text-white"
                                            : "bg-yellow-100 text-yellow-800"}`}
                                >
                                    Expiring - {expiringCount}
                                </button> */}

                                {/* <button
                                    onClick={() => setStatusFilter("active")}
                                    className={`px-5 py-2 rounded-full text-sm font-medium
          ${statusFilter === "active"
                                            ? "bg-green-600 text-white"
                                            : "bg-green-100 text-green-700"}`}
                                >
                                    Active - {activeCount + expiringCount}
                                </button> */}
                                <button
                                    type="button"
                                    onClick={() => handlePrint("multiple")}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-full"
                                >
                                    Print Selected ({selectedClients.length})
                                </button>
                            </>
                        }
                    />

                </div>
            </div>

            {/* ================= I-CARD MODAL ================= */}
            {openICardModal && selectedClient && (
                <Modal
                    isOpen={openICardModal}
                    onClose={() => setOpenICardModal(false)}
                    title="I-Card Preview"
                >

                    {/* ================= PREVIEW ================= */}
                    <div id="print-area-single" className="print-grid d-none" ref={printRef}>


                        {/* FRONT SIDE */}
                        <div className="w-[55mm] h-[85mm] bg-white rounded-3xl overflow-hidden border relative">

                            {/* Logo */}

                            <div className="bg-white h-[40%] p-3 text-center justify-items-center
">    <div>
                                    <CompanyLogo
                                        companyCode={company_code}
                                        className="h-14 mx-auto"
                                    />


                                </div>
                                {selectedClient.member_id && (
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white absolute top-18">
                                        <ClientPhoto
                                            memberId={selectedClient.member_id}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Blue Body */}
                            <div
                                className="text-white pb-2 px-2 h-[60%] rounded-3xl bg-blue-900 flex flex-col items-center"
                                style={{
                                    borderTopLeftRadius: "40px",
                                    borderTopRightRadius: "40px"
                                }}
                            >

                                {/* Name */}
                                <div className="mt-10 text-center">
                                    <h2 className="text-[18px] font-semibold tracking-wide">
                                        {selectedClient.client_name}
                                    </h2>
                                </div>

                                {/* QR */}
                                {selectedClient.member_id && (
                                    <div className="mt-2 bg-white p-1 rounded shadow-lg">
                                        <QRCodeCanvas
                                            value={selectedClient.member_id}
                                            size={90}
                                        />
                                    </div>
                                )}

                            </div>
                        </div>


                        {/* BACK SIDE */}
                        <div className="w-[55mm] h-[85mm] bg-blue-900 rounded-3xl shadow-2xl overflow-hidden border relative">

                            {/* Logo */}
                            <div className="bg-white h-[25%] p-3 text-center" style={{
                                borderBottomLeftRadius: "40px",
                                borderBottomRightRadius: "40px"
                            }}>
                                <CompanyLogo
                                    companyCode={company_code}
                                    className="h-14 mx-auto object-contain"
                                />

                            </div>

                            {/* Name & Member ID */}
                            {/* <div className="mt-5 text-center text-white">
                                <h2 className="text-[18px] font-semibold">
                                    {selectedClient.client_name}
                                </h2> */}

                             {/* Name & Member ID */}
                            <div className="mt-5 text-center text-white">
                                <h2 className="text-[18px] font-semibold">
                                    {selectedClient.client_name}
                                </h2>

                                <h3 className="text-[14px]">
                                    {selectedClient.member_id}
                                </h3>
                            </div>

                            {/* Details */}
                            <div className="text-white px-4 py-5 text-[11px] space-y-2">

                                {selectedClient.category_name && (
                                    <div className="flex items-center gap-2">
                                        <PanelBottom size={14} />
                                        <span>{selectedClient.category_name}</span>
                                    </div>
                                )}

                                {selectedClient.dob && (
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={14} />
                                        <span>{formatDate(selectedClient.dob)}</span>
                                    </div>
                                )}

                                {selectedClient.mobile && (
                                    <div className="flex items-center gap-2">
                                        <PhoneCall size={14} />
                                        <span>{selectedClient.mobile}</span>
                                    </div>
                                )}

                                {selectedClient.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        <span>{selectedClient.address}</span>
                                    </div>
                                )}

                            </div>

                            {/* Email */}
                            <div className="text-center pb-3">
                                <span className="text-[13px] text-white">
                                    {selectedClient.email}
                                </span>
                            </div>

                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => handlePrint("single")}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl shadow-md py-3"
                    >
                        Print ID Card
                    </button>

                </Modal>
            )}




            <div id="print-area-multiple" className="print-grid d-none">

                {/* ===== FRONT SIDE (ALL CLIENTS) ===== */}
                {selectedClients.map(client => (
                    <div key={`front-${client.id}`} className="print-card">

                        {/* FRONT DESIGN */}
                        <div className="icard-front w-[55mm] h-[85mm] bg-white rounded-3xl overflow-hidden border relative">


                            <div className="bg-white h-[40%] p-3 text-center">
                                {/* <div className="bg-white h-[35%] flex items-center justify-center"> */}

                                <CompanyLogo
                                    companyCode={company_code}
                                    className="h-14 mx-auto"
                                />



                                {/* </div> */}

                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white absolute top-18 left-1/2 -translate-x-1/2">
                                    <ClientPhoto
                                        memberId={client.member_id}
                                        className="w-full h-full object-cover rounded-full"
                                    />

                                </div>
                            </div>

                            <div className="text-white pb-2 px-2 h-[60%] rounded-3xl bg-blue-900 flex flex-col items-center">

                                <div className="mt-10 text-center">
                                    <h2 className="text-[18px] font-semibold">
                                        {client.client_name}
                                    </h2>
                                </div>

                                <div className="mt-4 bg-white p-1 rounded">
                                    <QRCodeCanvas value={client.member_id} size={90} />
                                </div>

                            </div>

                        </div>

                    </div>
                ))}

                {/* ===== BACK SIDE (ALL CLIENTS) ===== */}
                {selectedClients.map(client => (
                    <div key={`back-${client.id}`} className="print-card">

                        {/* BACK DESIGN */}
                        <div className="icard-back w-[55mm] h-[85mm] bg-blue-900 rounded-3xl overflow-hidden border relative">

                            {/* Logo */}
                            <div className="bg-white h-[25%] p-3 text-center rounded-3xl">
                                <CompanyLogo
                                    companyCode={company_code}
                                    className="h-14 mx-auto"
                                />

                            </div>

                            {/* Name & Member ID */}
                            <div className="mt-5 text-center text-white">
                                <h2 className="text-[18px] font-semibold">
                                    {client.client_name}
                                </h2>

                                <h3 className="text-[14px]">
                                    {client.member_id}
                                </h3>
                            </div>

                            {/* Details */}
                            <div className="text-white px-4 py-5 text-[11px] space-y-2">

                                {client.category_name && (
                                    <div className="flex items-center gap-2">
                                        <PanelBottom size={14} />
                                        <span>{client.category_name}</span>
                                    </div>
                                )}

                                {client.dob && (
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={14} />
                                        <span>{formatDate(client.dob)}</span>
                                    </div>
                                )}

                                {client.mobile && (
                                    <div className="flex items-center gap-2">
                                        <PhoneCall size={14} />
                                        <span>{client.mobile}</span>
                                    </div>
                                )}

                                {client.address && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} />
                                        <span>{client.address}</span>
                                    </div>
                                )}

                            </div>

                            {/* Email */}
                            {client.email && (
                                <div className="text-center pb-3 text-white text-[12px]">
                                    {client.email}
                                </div>
                            )}

                        </div>

                    </div>
                ))}

            </div>

        </div>

    )
}
