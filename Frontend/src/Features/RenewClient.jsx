import React, { useState, useEffect } from 'react'
import Sidebar from '../Components/Sidebar'
import Topbar from '../Components/Topbar'
import Input from '../Components/UI/Input';
import Button from '../Components/UI/Button';
import SelectInput from '../Components/UI/SelectInput';
import Textarea from '../Components/UI/Textarea';
import { MapPin, UserRound, Calculator, PhoneCall, Mail, CalendarDays, IndianRupee, Timer } from 'lucide-react';
import Table from '../Components/UI/Table';
import { getAllCategories } from '../API/Category';
import { getClientById } from '../API/Client';
import { renewClient, getAllRenewals } from '../API/Renew';
import { useParams, useNavigate, data } from "react-router-dom";
import SweetAlert from '../Components/UI/SweetAlert';
import {
    validateDuration,
    validateAmount,
    validateSessions
} from "../utils/validators";


export default function RenewClient() {


    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [client, setClient] = useState(null);
    const [renewData, setRenewData] = useState([]);

    const [formData, setFormData] = useState({
        id: "",
        category_id: "",
        client_name: "",   // ✅ THIS WAS MISSING (MAIN BUG)
        from_date: "",
        to_date: "",
        duration: "",
        discount: "",
        discount_price: "",
        sessions: "",
        amount: "",
    });


    // ✅ Auto calculate To Date
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            let updatedData = { ...prev, [name]: value };

            // -------------------------
            // 1️⃣ Auto-fill amount on category change
            // -------------------------
            if (name === "category_id") {
                const selected = category.find((cat) => cat.id == value);
                if (selected) {
                    updatedData.amount = selected.amount;
                }
            }

            // -------------------------
            // 2️⃣ Auto calculate to_date from duration
            // -------------------------
            if (name === "duration" && updatedData.from_date) {
                updatedData.to_date = addMonths(updatedData.from_date, value);
            }

            // -------------------------
            // 3️⃣ Auto calculate final price (amount - discount)
            // -------------------------
            if (name === "discount" || name === "amount" || name === "category_id") {
                const discount = Number(updatedData.discount || 0);
                const amount = Number(updatedData.amount || 0);

                const finalAmount = amount - discount;

                updatedData.discount_price = finalAmount >= 0 ? finalAmount : 0;
            }

            return updatedData;
        });
        // LIVE VALIDATION — remove error when corrected
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, value),
        }));
    };



    const { id } = useParams(); // ✅ GET ID FROM URL
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategorys();
    }, []);

    const fetchCategorys = async () => {
        try {
            const data = await getAllCategories();
            setCategory(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    console.log("fetch category", category);
    const categoryOptions = category.map((item) => ({
        label: item.name,
        value: item.id,
    }));

    const getCategoryNameById = (id) => {
        const found = category.find((cat) => cat.id === id);
        return found ? found.name : "N/A";
    };

    const fetchClient = async () => {
        try {
            const data = await getClientById(id);
            setClient(data);
        } catch (error) {
            console.error("Error fetching client:", error);
        }
    };

    useEffect(() => {
        fetchClient();
    }, [id]);



    const fetchRenewByClient = async () => {
        try {
            const data = await getAllRenewals(id);

            console.log("✅ RENEW DATA (CLIENT ID WISE):", data); // ✅ THIS IS WHAT YOU WANT

            setRenewData(data); // optional if you want to show later in UI
        } catch (error) {
            console.error("❌ Error fetching renew data:", error);
        }
    };

    useEffect(() => {
        fetchRenewByClient();
    }, [id]);

    const renewalColumns = [
        { accessor: "sr", header: "Sr No" },
        { accessor: "client_name", header: "Client Name" },
        { accessor: "from_date", header: "From Date" },
        { accessor: "to_date", header: "To Date" },
        { accessor: "duration", header: "Duration (Months)" },
        { accessor: "sessions", header: "Sessions" },
        { accessor: "amount", header: "Amount" },
        { accessor: "discount", header: "Discount" },
        { accessor: "discount_price", header: "Final Amount" },
        { accessor: "category_name", header: "Category" },
    ];

    // ✅ Convert ISO date to input format (yyyy-mm-dd)
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const renewalTableData = renewData.map((item, index) => ({
        sr: index + 1,
        client_name: item.client_name,
        from_date: formatDate(item.from_date),
        to_date: formatDate(item.to_date),
        duration: item.duration,
        sessions: item.sessions,
        amount: item.amount,
        discount: item.discount,
        discount_price: item.discount_price,
        // ✅ SHOW CATEGORY NAME INSTEAD OF ID
        category_name: getCategoryNameById(item.category_id),
    }));


    const addDays = (dateString, days) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date.toISOString().split("T")[0];
    };

    const addMonths = (dateString, months) => {
        const date = new Date(dateString);
        date.setMonth(date.getMonth() + Number(months));
        return date.toISOString().split("T")[0];
    };




    useEffect(() => {
        if (client) {
            const newFromDate = client.to_date
                ? addDays(client.to_date, 1)
                : "";

            setFormData((prev) => ({
                ...prev,
                member_id: client.member_id || "",
                category_id: client.category_id || "",
                client_name: client.client_name || "", // ✅ HERE
                mobile: client.mobile || "",
                from_date: newFromDate,
                duration: "",
                to_date: "",
            }));
        }
    }, [client]);


    const handleRenew = async (e) => {
        e.preventDefault();

        const newErrors = {
            duration: validateDuration(formData.duration),
            amount: validateAmount(formData.amount),
            sessions: validateSessions(formData.sessions)
        };

        setErrors(newErrors);

        // Stop if any error exist
        if (Object.values(newErrors).some((err) => err !== "")) {
            // SweetAlert.error("Please fix the errors before updating.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                client_id: id, // ✅ ID FROM URL
                category_id: formData.category_id,
                from_date: formData.from_date,
                to_date: formData.to_date,
                duration: formData.duration,
                sessions: formData.sessions,
                amount: formData.amount,
                discount: formData.discount,
                discount_price: formData.discount_price,
            };

            console.log("✅ RENEW POST PAYLOAD:", payload);

            await renewClient(payload); // ✅ POST METHOD

            SweetAlert.success("Client Renewed Successfully ✅");
            navigate("/clientdetails");
        } catch (error) {
            console.error("❌ Renew Error:", error);
            SweetAlert.error("Failed to renew client ❌");
        } finally {
            setLoading(false);
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case "duration": return validateDuration(value);
            case "amount": return validateAmount(value);
            case "sessions": return validateSessions(value);
            default: return "";
        }
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-18 overflow-x-auto">
                <Topbar />

                {/* Page Content */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Renew Client Membership</h2>
                    <form onSubmit={handleRenew} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Member id*/}
                        <div>
                            <div className="relative">
                                {/* Icon */}
                                <UserRound className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {/* Input field */}
                                <Input
                                    label="Member ID"
                                    type="text"
                                    name="member_id"
                                    placeholder="Enter Client Name"
                                    required
                                    value={formData.member_id}
                                    onChange={handleChange}
                                    error={errors?.member_id}
                                    disabled
                                    className='cursor-not-allowed'
                                />
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                {/* Icon */}
                                <UserRound className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {/* Input field */}
                                <Input
                                    label="Client Name"
                                    type="text"
                                    name="client_name"
                                    placeholder="Enter Client Name"
                                    required
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    error={errors?.client_name}
                                    disabled
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div >
                            <div className="relative">
                                <PhoneCall className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Mobile Number"
                                    type="number"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Enter mobile number"
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        {/* From Date */}
                        <div >
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="From Date"
                                    type="date"
                                    name="from_date"
                                    value={formData.from_date}
                                    onChange={handleChange}
                                    placeholder='From Date'
                                    required
                                // disabled
                                />
                            </div>
                        </div>

                        <div >
                            <div className="relative">
                                <Timer className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Duration (Months)"
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="Enter Duration"
                                    required
                                    error={errors.duration}
                                />
                            </div>
                        </div>


                        {/* To Date */}
                        <div >
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="To Date (Auto set)"
                                    type="date"
                                    name="to_date"
                                    value={formData.to_date}
                                    onChange={handleChange}
                                    placeholder='To Date'
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        <div >
                            <div className="relative">
                                {/* <Mail className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                                <SelectInput
                                    label="Choose Category"
                                    name="category_id"
                                    value={formData.category_id}
                                    options={categoryOptions}
                                    onChange={handleChange}
                                    required
                                />

                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Timer className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Sessions"
                                    type="number"
                                    name="sessions"
                                    value={formData.sessions}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter sessions"
                                    error={errors.sessions}
                                />
                            </div>
                        </div>

                        {/* Amount / Fees */}
                        <div>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Amount / Fees"
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter amount"
                                    error={errors.amount}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Discount"
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleChange}
                                    placeholder="Enter discount"
                                    required
                                    error={errors.discount}
                                />

                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Final Amount"
                                    type="number"
                                    name="discount_price"
                                    value={formData.discount_price}
                                    disabled
                                    placeholder="Auto Calculated"
                                    error={errors.discount_price}
                                    className='cursor-not-allowed'
                                />

                            </div>
                        </div>


                        <div>
                            {/* Submit Button */}
                            <div className={`md:col-span-2 lg:col-span-3 flex justify-start gap-2 mt-6 `}>
                                <Button type="submit" variant="success" disabled={loading}>
                                    {loading ? "Renewing..." : "Renew"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={() => navigate("/clientdetails")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <Table
                        tableTitle="Renewal History"
                        columns={renewalColumns}
                        data={renewalTableData}
                    />
                </div>
            </div>
        </div>
    )
}
