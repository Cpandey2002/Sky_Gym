import React, { useState, useEffect } from 'react'
import Sidebar from '../Components/Sidebar'
import Topbar from '../Components/Topbar'
import Input from '../Components/UI/Input';
import Button from '../Components/UI/Button';
import SelectInput from '../Components/UI/SelectInput';
import Textarea from '../Components/UI/Textarea';
import { MapPin, UserRound, Calculator, PhoneCall, Mail, CalendarDays, IndianRupee, Timer } from 'lucide-react';
import { updateClient, getClientById } from '../API/Client';
import { getAllCategories } from '../API/Category';
import { useParams, useNavigate } from "react-router-dom";
import SweetAlert from '../Components/UI/SweetAlert';
import {
    validateName,
    validateAddress,
    validateMobile,
    validateEmail,
    validateNotFutureDate,
    validateDOB,
    validateAmount,
    validateSessions,
    validateDescription
} from "../utils/validators";
import { UPLOAD_URL } from "../API/config";


export default function UpdateClient() {

    const { id } = useParams(); // ✅ GET ID FROM URL
    const navigate = useNavigate();

    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        id: "",
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
        description: "",
         photo: null   // ✅ ADD THIS
    });



    const categoryOptions = category.map((item) => ({
        label: item.name,
        value: item.id,
    }));

    // ✅ Fetch Client By ID
    useEffect(() => {
        if (id) {
            fetchClientById(id);
        }
    }, [id]);

    const fetchClientById = async (clientId) => {
        try {
            const res = await getClientById(clientId);
            const data = res[0] || res;

            setFormData({
                id: data.id,
                reg_date: data.reg_date?.split("T")[0],
                client_name: data.client_name,
                member_id: data.member_id,
                mobile: data.mobile,
                address: data.address,
                category_id: data.category_id,
                from_date: data.from_date?.split("T")[0],
                to_date: data.to_date?.split("T")[0],
                duration: data.duration,
                dob: data.dob?.split("T")[0],
                sessions: data.sessions,
                email: data.email,
                amount: data.amount,
                description: data.description,
                 photo: data.photo,
            });
        } catch (error) {
            console.error("❌ Client Fetch Error:", error);
            Swal.fire("Error", "Failed to load client data", "error");
        }
    };

    // ✅ Auto calculate To Date
    // const handleChange = (e) => {
    //     const { name, value } = e.target;

    //     let updated = { ...formData, [name]: value };

    //     if (
    //         (name === "from_date" || name === "duration") &&
    //         updated.from_date &&
    //         updated.duration
    //     ) {
    //         const from = new Date(updated.from_date);
    //         const months = parseInt(updated.duration);

    //         const to = new Date(from);
    //         to.setMonth(to.getMonth() + months);

    //         updated.to_date = to.toISOString().split("T")[0];
    //     }

    //     setFormData(updated);

    //     // LIVE VALIDATION — remove error when corrected
    //     setErrors((prev) => ({
    //         ...prev,
    //         [name]: validateField(name, value),
    //     }));
    // };
    const handleChange = (e) => {
        const { name, value } = e.target;

        // 🔥 Sentence Case Function
        const toSentenceCase = (str = "") => {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1);
        };

        // Fields that should be in Sentence Case
        const sentenceFields = ["client_name", "address", "enquiry_received_from"];

        const finalValue = sentenceFields.includes(name)
            ? toSentenceCase(value)
            : value;

        let updated = { ...formData, [name]: finalValue };

        // ✅ AUTO CALCULATE TO DATE
        if (
            (name === "from_date" || name === "duration") &&
            updated.from_date &&
            updated.duration
        ) {
            const from = new Date(updated.from_date);
            const months = parseInt(updated.duration);

            const to = new Date(from);
            to.setMonth(to.getMonth() + months);

            updated.to_date = to.toISOString().split("T")[0];
        }

        // ✅ UPDATE STATE
        setFormData(updated);

        // 🔥 LIVE VALIDATION — validate using the formatted value
        setErrors((prev) => ({
            ...prev,
            [name]: validateField(name, finalValue),
        }));
    };


    const validateField = (name, value) => {
        switch (name) {
            case "client_name": return validateName(value);
            case "address": return validateAddress(value);
            case "mobile": return validateMobile(value);
            case "email": return validateEmail(value);
            case "dob": return validateDOB(value);
            case "amount": return validateAmount(value);
            case "sessions": return validateSessions(value);
            case "description": return validateDescription(value);
            default: return "";
        }
    };



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



// const handleSubmit = async (e) => {

//     e.preventDefault();

//     const newErrors = {
//         client_name: validateName(formData.client_name),
//         address: validateAddress(formData.address),
//         mobile: validateMobile(formData.mobile),
//         email: validateEmail(formData.email),
//         dob: validateDOB(formData.dob),
//         amount: validateAmount(formData.amount),
//         sessions: validateSessions(formData.sessions),
//     };

//     setErrors(newErrors);

//     if (Object.values(newErrors).some(err => err !== "")) return;

//     try {

//         setLoading(true);

//         const form = new FormData();

//         // ✅ append all fields
//         Object.keys(formData).forEach(key => {

//             // ❌ don't append string photo
//             if (key === "photo") {

//                 if (formData.photo instanceof File) {
//                     form.append("photo", formData.photo);
//                 }

//             } else {

//                 form.append(key, formData[key]);

//             }

//         });

//         // ✅ call API
//         const res = await updateClient(formData.id, form);

//         // ✅ update preview with new photo
//         if (res?.client?.photo) {

//             setFormData(prev => ({
//                 ...prev,
//                 photo: res.client.photo
//             }));

//         }

//         SweetAlert.success("Client Updated Successfully ✅");

//         navigate("/clientdetails");

//     } catch (error) {

//         console.error("❌ Update Error:", error);

//         SweetAlert.error("Failed to update client ❌");

//     } finally {

//         setLoading(false);

//     }

// };

const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = {
        client_name: validateName(formData.client_name),
        address: validateAddress(formData.address),
        mobile: validateMobile(formData.mobile),
        email: validateEmail(formData.email),
        dob: validateDOB(formData.dob),
        amount: validateAmount(formData.amount),
        sessions: validateSessions(formData.sessions),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err !== "")) return;

    try {

        setLoading(true);

        const form = new FormData();

        Object.keys(formData).forEach(key => {

            if (key === "photo") {

                if (formData.photo instanceof File) {
                    form.append("photo", formData.photo);
                }

            } else {

                form.append(key, formData[key]);

            }

        });

        await updateClient(formData.id, form);

        SweetAlert.success("Client Updated Successfully ");

        //  GO BACK TO PREVIOUS PAGE
        navigate(-1);

    } catch (error) {

        console.error(" Update Error:", error);

        SweetAlert.error("Failed to update client ");

    } finally {

        setLoading(false);

    }

};


    return (
        <div className="flex">
            <Sidebar />

            <div className="flex-1 xl:ml-[17rem] pt-18 overflow-x-auto">
                <Topbar />

                {/* Page Content */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-semibold mb-4">Client Details Update</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div >
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Reg. Date"
                                    type="date"
                                    name="reg_date"
                                    value={formData.reg_date}
                                    onChange={handleChange}
                                    placeholder='From Date'
                                    required
                                    error={errors.reg_date}
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
                                    onChange={handleChange}
                                    placeholder="Enter Member Id"
                                    required
                                    disabled
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
                                    placeholder="Enter Client Name"
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
                                <Input
                                    label="From Date"
                                    type="date"
                                    name="from_date"
                                    value={formData.from_date}
                                    onChange={handleChange}
                                    placeholder='From Date'
                                    required
                                    disabled
                                />
                            </div>
                        </div>

                        <div >
                            <div className="relative">
                                <PhoneCall className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Duration (Months)"
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleChange}
                                    placeholder="Enter Duration"
                                    required
                                    disabled
                                />
                            </div>
                        </div>


                        {/* To Date */}
                        <div >
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="To Date (Auto Calculated)"
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



                        {/* Date of Birth */}
                        <div>
                            <div className='relative'>
                                <CalendarDays className="absolute left-3 top-11 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    label="Date of Birth"
                                    type="date"
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
                                    disabled
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
                                    disabled
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

  <div className="flex items-start gap-6">

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
            <span className="text-gray-400 text-sm">
                No Image
            </span>
        )}

    </div>

</div>


                        {/* Submit Button */}
                        <div className={`md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-6 `}>
                            <Button type="submit" variant="success" disabled={loading}>
                                {loading ? "Updating..." : "Update"}
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => navigate("/clientdetails")}
                            >
                                Cancel
                            </Button>

                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}
