import React, { useState, useEffect } from 'react'
import Sidebar from '../Components/Sidebar'
import Topbar from '../Components/Topbar'
import Input from '../Components/UI/Input'
import Button from '../Components/UI/Button'
import { MapPin, UserRound, Calculator, Phone, Mail, CalendarDays, IndianRupee, Timer } from 'lucide-react'
import Table from '../Components/UI/Table'
import Modal from '../Components/UI/Model'
import SweetAlert from '../Components/UI/SweetAlert'
import { addEnquiry, getEnquiryAll } from '../API/Enquiry'
import {
    validateName,
    validateAddress,
    validateMobile,
    validateEmail,
    validateEnquiryDate,
    validateReceivedFrom
} from "../utils/validators";
import { useNavigate } from "react-router-dom";
import { getAllClients } from '../API/Client';   // ✅ ADD THIS LINE



export default function Enquiry() {
    const navigate = useNavigate(); 
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        client_name: "",
        address: "",
        mobile: "",
        email: "",
        enquiry_date: "",
        enquiry_received_from: ""
    });
    const [enquiryData, setEnquiryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);

    const [errors, setErrors] = useState({});
    const columns = [
        { header: "Sr No.", accessor: "sr" },
        { header: "Client Name", accessor: "client_name" },
        { header: "Mobile", accessor: "mobile" },
        { header: "Email", accessor: "email" },
        { header: "Enquiry Receved from", accessor: "enquiry_received_from" },
        { header: "Address", accessor: "address" },
        { header: "Enquiry Date", accessor: "enquiry_date" },
          {
    header: "Action",
    accessor: "action"
  }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 🔥 Convert to Sentence Case (ONLY for text fields)
        const toSentenceCase = (str = "") => {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        // Fields where you want Sentence Case
        const sentenceCaseFields = [
            "client_name",
            "address",
            "enquiry_received_from"
        ];

        const finalValue = sentenceCaseFields.includes(name)
            ? toSentenceCase(value)
            : value;

        // 🔥 Store final formatted value
        setFormData({
            ...formData,
            [name]: finalValue,
        });

        // 🔥 LIVE VALIDATION
        let fieldError = "";

        if (name === "client_name") fieldError = validateName(finalValue);
        if (name === "address") fieldError = validateAddress(finalValue);
        if (name === "mobile") fieldError = validateMobile(finalValue);
        if (name === "email") fieldError = validateEmail(finalValue);
        if (name === "enquiry_date") fieldError = validateEnquiryDate(finalValue);
        if (name === "enquiry_received_from") fieldError = validateReceivedFrom(finalValue);

        setErrors((prev) => ({
            ...prev,
            [name]: fieldError,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        let newErrors = {};

        newErrors.client_name = validateName(formData.client_name);
        newErrors.address = validateAddress(formData.address);
        newErrors.mobile = validateMobile(formData.mobile);
        newErrors.email = validateEmail(formData.email);
        newErrors.enquiry_date = validateEnquiryDate(formData.enquiry_date);
        newErrors.enquiry_received_from = validateReceivedFrom(formData.enquiry_received_from);

        setErrors(newErrors);

        // ❌ If any errors exist — stop submit
        if (Object.values(newErrors).some((err) => err !== "")) {
            return;
        }

        setLoading(true);
        // console.log("formData", formData)

        try {
            const response = await addEnquiry(formData); // ✅ AWAIT added

            // console.log("✅ Enquiry Added:", response);

            SweetAlert.success("Enquiry Added Successfully ✅");
            // ✅ Re-fetch latest data from DB
            await fetchEnquiries();

            // ✅ Reset using SAME field names
            setFormData({
                client_name: "",
                address: "",
                mobile: "",
                email: "",
                enquiry_date: "",
                enquiry_received_from: ""
            });

            setShowModal(false); // ✅ close modal after success
        } catch (error) {
            console.error("❌ Error adding enquiry:", error);
            SweetAlert.error("Failed to add enquiry ❌");
        }

        setLoading(false);

    };


    const capitalizeText = (text = "") => {
        return text
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    };

    // ✅ Fetch Enquiries
    useEffect(() => {
        fetchEnquiries();
    }, []);

const fetchEnquiries = async () => {

    setTableLoading(true);

    try {

        const enquiryResponse = await getEnquiryAll();

        const clientResponse = await getAllClients();

        // ✅ match using mobile number
        const registeredMobiles = clientResponse.map(
            client => client.mobile
        );

        const formattedData = enquiryResponse.map((item, index) => {

            const isRegistered =
                registeredMobiles.includes(item.mobile);

            return {

                sr: index + 1,

                client_name: (
                    <span className={
                        isRegistered
                            ? "text-green-600 font-semibold"
                            : ""
                    }>
                        {capitalizeText(item.client_name)}
                    </span>
                ),

                mobile: item.mobile,

                email: item.email,

                enquiry_received_from: item.enquiry_received_from,

                address: capitalizeText(item.address),

                enquiry_date: formatDate(item.enquiry_date),

                action: (
                    <Button
                        variant={isRegistered ? "secondary" : "success"}
                        size="sm"
                        disabled={isRegistered}
                        onClick={() =>
                            navigate("/registration", {
                                state: { enquiry: item }
                            })
                        }
                    >
                        {isRegistered
                            ? "Registered"
                            : "Register"}
                    </Button>
                )

            };

        });

        setEnquiryData(formattedData);

    } catch (error) {

        console.error("Fetch error:", error);

    } finally {

        setTableLoading(false);

    }

};



    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-20 overflow-x-auto">
                <Topbar />

                {/* Page Content */}

                <div className="flex justify-end p-4 mx-6">
                    <Button type="button" variant="success" onClick={() => setShowModal(true)}>
                        Add Enquiry
                    </Button>
                    <Modal isOpen={showModal} onClose={() => { setShowModal(false); setErrors({}); }} title="Enquiry Form">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Client Name */}
                            <div className="relative">
                                <UserRound className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Client Name"
                                    type="text"
                                    name="client_name"
                                    required
                                    placeholder="Enter Client Name"
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    error={errors.client_name}
                                />
                            </div>

                            {/* Address */}
                            <div className="relative">
                                <MapPin className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Address"
                                    name="address"
                                    placeholder="Enter Address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    error={errors.address}
                                />
                            </div>

                            {/* Mobile */}
                            <div className="relative">
                                <Phone className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Mobile"
                                    type="number"
                                    name="mobile"
                                    placeholder="Enter Mobile Number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    error={errors.mobile}
                                />
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    error={errors.email}
                                />
                            </div>

                            {/* Enquiry Date */}
                            <div className="relative">
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Enquiry Date"
                                    type="date"
                                    name="enquiry_date"
                                    placeholder="Enter Enquiry Date"
                                    value={formData.enquiry_date}
                                    onChange={handleChange}
                                    required
                                    error={errors.enquiry_date}
                                />
                            </div>

                            {/* Enquery Received From */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Enquiry From"
                                    type="text"
                                    name="enquiry_received_from"
                                    placeholder="Enquiry Received From"
                                    value={formData.enquiry_received_from}
                                    onChange={handleChange}
                                    required
                                    error={errors.enquiry_received_from}
                                />
                            </div>

                            {/* ✅ Buttons */}
                            <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                                <Button type="submit" variant="success" onClick={handleSubmit} disabled={loading}>
                                    {loading ? "Loading..." : "Submit"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="danger"
                                    disabled={loading}
                                    onClick={() => { setShowModal(false); setErrors({}); }}
                                >
                                    Cancel
                                </Button>
                            </div>

                        </div>
                    </Modal>
                </div>



                <div className="bg-white p-6 rounded-lg shadow-md">

                    <Table
                        tableTitle="Enquiry List"
                        columns={columns}
                        data={enquiryData}
                        loading={tableLoading}
                    />

                </div>

            </div>
        </div>
    )
}
