import React, { useState, useEffect } from 'react'
import Sidebar from '../Components/Sidebar'
import Topbar from '../Components/Topbar'
import Input from '../Components/UI/Input';
import Button from '../Components/UI/Button';
import Textarea from '../Components/UI/Textarea';
import SelectInput from '../Components/UI/SelectInput';
import { MapPin, UserRound, Calculator, PhoneCall, Mail, CalendarDays, IndianRupee, Timer } from 'lucide-react';
import { getAllCategories } from '../API/Category';
import { addClient, checkMemberIdExists } from '../API/Client';
import SweetAlert from '../Components/UI/SweetAlert';
import {
    validateName,
    validateAddress,
    validateMobile,
    validateEmail,
    validateNotFutureDate,
    validateReceivedFrom,
    validateFromDate,
    validateDuration,
    validateDOB,
    validateAmount,
    validateSessions,
    validateDescription
} from "../utils/validators";
import { useLocation } from "react-router-dom";
import { UPLOAD_URL } from "../API/config";
import DateField from '../Components/UI/DateField';


export default function Registration() {
    const location = useLocation();
    const enquiry = location.state?.enquiry;

    const [category, setCategory] = useState([]);
    const [formData, setFormData] = useState({
        enquiry_id: "",
        reg_date: "",
        client_name: "",
        member_id: "",
        address: "",
        mobile: "",
        category_id: "",
        from_date: "",
        to_date: "",
        duration: "",
        dob: "",
        sessions: "",
        email: "",
        amount: "",
        discount: "",
        discount_price: "",
        description: "",
        enquiry_received_from: "",
        photo: null   // ✅ ADD THIS
    });


    useEffect(() => {
        if (enquiry) {

            const generatedId = generateMemberId(
                enquiry.client_name || "",
                enquiry.mobile || ""
            );


            setFormData((prev) => ({
                ...prev,
                enquiry_id: enquiry.id,
                client_name: enquiry.client_name || "",
                mobile: enquiry.mobile || "",
                email: enquiry.email || "",
                address: enquiry.address || "",
                enquiry_received_from: enquiry.enquiry_received_from || "",
                member_id: generatedId   // ✅ FIX HERE
            }));
        }
    }, [enquiry]);


    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);


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
        label: item.name,   // ✅ What user sees
        value: item.id,     // ✅ What gets submitted
    }));

    const handleChange = (e) => {
        const { name, value } = e.target;

        const toSentenceCase = (str = "") => {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const sentenceFields = [
            "client_name",
            "address",
            "enquiry_received_from"
        ];

        const finalValue = sentenceFields.includes(name)
            ? toSentenceCase(value)
            : value;

        let updatedData = {
            ...formData,
            [name]: finalValue
        };

        // =========================
        // MEMBER ID
        // =========================
        if (name === "client_name" || name === "mobile") {
            updatedData.member_id = generateMemberId(
                updatedData.client_name,
                updatedData.mobile
            );
        }

        // =========================
        // TO DATE
        // =========================
        if (
            (name === "from_date" || name === "duration") &&
            updatedData.from_date &&
            updatedData.duration
        ) {
            const from = new Date(updatedData.from_date);
            const months = parseInt(updatedData.duration);

            if (!isNaN(from.getTime()) && !isNaN(months)) {
                const toDate = new Date(from);
                toDate.setMonth(toDate.getMonth() + months);

                updatedData.to_date = toDate
                    .toISOString()
                    .split("T")[0];
            }
        }

        // =========================
        // CATEGORY → AMOUNT
        // =========================
        if (name === "category_id") {
            const selected = category.find(
                (cat) => String(cat.id) === String(value)
            );

            if (selected) {
                updatedData.amount = String(selected.amount ?? "");
            }
        }

        // =========================
        // DISCOUNT / FINAL AMOUNT
        // =========================
        if (
            name === "discount" ||
            name === "amount" ||
            name === "category_id"
        ) {
            const amount = Number(updatedData.amount || 0);
            const discount = Number(updatedData.discount || 0);

            const finalAmount = amount - discount;

            updatedData.discount_price =
                finalAmount >= 0
                    ? finalAmount.toFixed(2)
                    : "0.00";
        }

        // =========================
        // SET FORM DATA ONLY ONCE
        // =========================
        setFormData(updatedData);

        // =========================
        // CLEAR DOB ERROR
        // =========================
        if (name === "dob") {
            setErrors((prev) => ({
                ...prev,
                dob: ""
            }));
            return;
        }

        // =========================
        // VALIDATE CURRENT FIELD
        // =========================
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, finalValue)
        }));
    };




    const validateField = (name, value) => {
        switch (name) {
            case "client_name": return validateName(value);
            case "address": return validateAddress(value);
            case "mobile": return validateMobile(value);
            case "email": return validateEmail(value);
            // case "enquiry_received_from": return validateReceivedFrom(value);
            case "enquiry_date": return validateNotFutureDate(value);
            case "reg_date": return validateNotFutureDate(value);
            case "from_date": return validateFromDate(value);
            case "duration": return validateDuration(value);
            case "dob": return validateDOB(value);
            case "amount": return validateAmount(value);
            case "sessions": return validateSessions(value);
            // case "category_id": return validateCategory(value);
            case "description": return validateDescription(value);
            default: return "";
        }
    };

    // const generateMemberId = (clientName, mobile) => {
    //     if (!clientName || !mobile) return "";

    //     const firstName = clientName.trim().split(" ")[0]; // First name only
    //     const namePart = firstName.substring(0, 4).toUpperCase(); // First 4 letters
    //     const mobilePart = mobile.substring(0, 4); // First 4 digits

    //    return `${companyPart}/${namePart}/${mobilePart}`;
    // };

    const generateMemberId = (clientName, mobile) => {
        const company_code = localStorage.getItem("company_code") || "";
        if (!company_code || !clientName || !mobile) return "";

        const companyPart = company_code
            .replace(/\s+/g, "")
            .substring(0, 4)
            .toUpperCase();

        const firstName = clientName.trim().split(" ")[0];
        const namePart = firstName.substring(0, 4).toUpperCase();

        const mobilePart = mobile.substring(0, 4);

        return `${companyPart}/${namePart}/${mobilePart}`;
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const newErrors = {};

        Object.keys(formData).forEach((key) => {

            // Direct registration me enquiry_received_from optional hai
            if (key === "enquiry_received_from") return;

            const err = validateField(key, formData[key]);

            if (err) {
                newErrors[key] = err;
                console.log("❌ Validation Error:", key, "=>", err);
            }
        });

        console.log("🔴 ALL VALIDATION ERRORS:", newErrors);

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            console.log("⛔ SUBMIT STOPPED DUE TO VALIDATION");
            setLoading(false);
            return;
        }

        console.log("✅ VALIDATION PASSED");

        setLoading(true);

        try {

            // ✅ Check member id
            const exists = await checkMemberIdExists(formData.member_id);

            if (exists) {

                SweetAlert.error("Member ID already exists ❌");

                setLoading(false);
                return;
            }

            // ✅ Save client
            const form = new FormData();

            Object.keys(formData).forEach((key) => {
                let value = formData[key];

                if (
                    key === "amount" ||
                    key === "discount" ||
                    key === "discount_price"
                ) {
                    value = value === "" ? 0 : Number(value);
                }

                form.append(key, value);
            });

            await addClient(form);

            // ✅ SHOW SUCCESS MESSAGE
            SweetAlert.success("Client Registration Added Successfully ✅");

            // ✅ Reset complete form
            setFormData({
                enquiry_id: "",
                reg_date: "",
                client_name: "",
                member_id: "",
                address: "",
                mobile: "",
                category_id: "",
                from_date: "",
                to_date: "",
                duration: "",
                dob: "",
                sessions: "",
                email: "",
                amount: "",
                discount: "",
                discount_price: "",
                description: "",
                enquiry_received_from: "",
                photo: null
            });

            // ✅ Clear validation errors
            setErrors({});

        } catch (error) {
            console.error("❌ Registration Error:", error);
            SweetAlert.error("Failed to add client registration ❌");
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-16 overflow-x-auto">
                <Topbar />

                {/* Page Content */}
               <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm m-4">
                    {/* <h2 className="text-2xl font-semibold mb-4">Client Registration</h2> */}
                    <form
                        onSubmit={(e) => {
                            console.log("🔥 FORM SUBMIT EVENT");
                            handleSubmit(e);
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >

                        <div >
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <DateField
                                    label="Reg. Date"
                                    name="reg_date"
                                    value={formData.reg_date}
                                    onChange={handleChange}
                                    placeholder="dd/MM/yyyy"
                                    required
                                    error={errors.reg_date}
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
                                    onChange={handleChange}
                                    options={categoryOptions}
                                    error={errors.category_id}
                                    required
                                />


                            </div>
                        </div>
                        <div >
                            <div className="relative">
                                <UserRound className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Member Id"
                                    type="text"
                                    name="member_id"
                                    value={formData.member_id}
                                    placeholder="Auto Generated"
                                    disabled
                                    required
                                    error={errors.member_id}
                                    className='cursor-not-allowed'
                                />

                            </div>
                        </div>
                        {/* Client Name */}
                        <div>
                            <div className="relative">
                                {/* Icon */}
                                <UserRound className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {/* Input field */}
                                <Input
                                    label="Client Name"
                                    type="text"
                                    name="client_name"
                                    placeholder="Enter Name"
                                    required
                                    value={formData.client_name}
                                    onChange={handleChange}
                                    error={errors.client_name}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="relative">
                                {/* Icon */}
                                <MapPin className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {/* Input field */}
                                <Input
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                    required
                                    error={errors.address}
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
                                    error={errors.mobile}
                                />
                            </div>
                        </div>



                        {/* From Date */}
                        <div >
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <DateField
                                    label="From Date"
                                    
                                    name="from_date"
                                    value={formData.from_date}
                                    onChange={handleChange}
                                    placeholder="dd/MM/yyy"
                                    required
                                    error={errors.from_date}
                                />
                            </div>
                        </div>

                        <div >
                            <div className="relative">
                                <Timer className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Duration (in months)"
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
                                <DateField
                                    label="To Date"
                                    name="to_date"
                                    value={formData.to_date}
                                    onChange={handleChange}
                                    placeholder="dd/MM/yyy"
                                    required
                                    disabled
                                    className='cursor-not-allowed'
                                />
                            </div>
                        </div>



                        {/* Date of Birth */}
                        <div>
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <DateField
                                    label="Date of Birth"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    placeholder='DOB'
                                    required
                                    error={errors.dob}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div >
                            <div className="relative">
                                <Mail className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email address"
                                    required
                                    error={errors.email}
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
                                // disabled
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
                            <div className="relative">
                                <Mail className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Enquiry Received From"
                                    name="enquiry_received_from"
                                    value={formData.enquiry_received_from}
                                    onChange={handleChange}


                                />
                            </div>
                        </div>


                        {/* Description */}
                        <div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter description"
                                    error={errors.description}
                                    rows={1}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-6">

                            {/* LEFT SIDE → FILE INPUT */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Photo
                                </label>

                                <input
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            photo: e.target.files[0]
                                        })
                                    }
                                    className="border rounded px-3 py-2 w-full"
                                />
                            </div>


                            {/* RIGHT SIDE → IMAGE PREVIEW */}
                            <div className="w-20 h-20 border rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">

                                {formData.photo ? (

                                    typeof formData.photo === "string" ? (

                                        // existing image from server
                                        <img
                                            src={`${UPLOAD_URL}/${formData.photo}`}
                                            alt="client"
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (

                                        <img
                                            src={URL.createObjectURL(formData.photo)}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                        />
                                    )

                                ) : (

                                    <span className="text-gray-400 text-xs">
                                        No Image
                                    </span>

                                )}

                            </div>

                        </div>



                        {/* <label className="block text-sm font-medium mb-1">
                                Upload Photo
                            </label> */}




                        {/* Submit Button */}
                        <div className={`md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-1 `}>
                            <Button className='text-white' type="submit" variant="success" disabled={loading}>
                                {loading ? "Loading..." : "Submit Registration"}
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={() =>
                                    setFormData({
                                        reg_date: "",
                                        client_name: "",
                                        member_id: "",
                                        mobile: "",
                                        address: "",
                                        category_id: "",
                                        from_date: "",
                                        to_date: "",
                                        duration: "",
                                        dob: "",
                                        sessions: "",
                                        email: "",
                                        amount: "",
                                        description: "",
                                    })
                                }
                            >
                                Reset
                            </Button>

                        </div>

                    </form>
                </div>
            </div>
        </div>

    )
}
