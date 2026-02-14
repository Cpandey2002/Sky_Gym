import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import axiosInstance from "../API/axiosInstance";
import CompanyLogo from "../Features/CompanyLogo";

export default function Profile() {

  const [profile, setProfile] = useState({
    email: "",
    mobile_number: "",
    address: "",
    company_name: "",
    company_code: ""
  });

  const fileInputRef = useRef();

  const company_code = localStorage.getItem("company");

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get("/users/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Upload logo
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    await axiosInstance.post("/users/upload-logo", formData);

    fetchProfile(); // refresh profile

  };


  // ✅ Handle input change
  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });

  };

  // ✅ Save profile
  const handleSave = async () => {

    try {

      await axiosInstance.put("/users/update-profile", {
        email: profile.email,
        mobile_number: profile.mobile_number,
        address: profile.address
      });

      alert("Profile updated successfully");

      fetchProfile();

    } catch (err) {

      console.error(err);
      alert("Update failed");
    }
  };

  return (

    <div className="flex">

      <Sidebar />

      <div className="flex-1 xl:ml-[17rem] pt-18 p-6">

        <Topbar title="Profile" />

        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">

          {/* Logo Upload */}
          <div className="flex items-center gap-6 mb-6">

            <div
              onClick={handleUploadClick}
              className="w-24 h-24 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 overflow-hidden"
            >
            <CompanyLogo companyCode={profile.company_code} />
            </div>

            <p className="text-gray-500">
              Click to upload logo
            </p>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

          </div>


          {/* Form */}
          <div className="grid grid-cols-1 gap-5">

            {/* Company Name (readonly) */}
            <div>
              <label className="text-sm text-gray-600">
                Company Name
              </label>

              <input
                value={profile.company_name || ""}
                disabled
                className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
              />
            </div>


            {/* Company Code (readonly) */}
            <div>
              <label className="text-sm text-gray-600">
                Company Code
              </label>

              <input
                value={profile.company_code || ""}
                disabled
                className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
              />
            </div>


            {/* Email (editable) */}
            <div>
              <label className="text-sm text-gray-600">
                Email
              </label>

              <input
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>


            {/* Mobile (editable) */}
            <div>
              <label className="text-sm text-gray-600">
                Mobile Number
              </label>

              <input
                name="mobile_number"
                value={profile.mobile_number || ""}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>


            {/* Address (editable) */}
            <div>
              <label className="text-sm text-gray-600">
                Address
              </label>

              <input
                name="address"
                value={profile.address || ""}
                onChange={handleChange}
                className="w-full mt-1 p-3 border rounded-lg"
              />
            </div>


            {/* Save Button */}
            <div className="pt-4">

              <button
                onClick={handleSave}
                className="w-full bg-[#1e4543] text-white py-3 rounded-xl hover:bg-[#163332] transition"
              >
                Save Profile
              </button>

            </div>


          </div>

        </div>

      </div>

    </div>

  );

}
