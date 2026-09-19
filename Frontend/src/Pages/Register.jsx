import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../API/axiosInstance";

import {
  Briefcase,
  User,
  Mail,
  MapPin,
  Phone,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import gymBg from "../assets/gym-bg.png";
import Input from "../Components/UI/Input";

export default function Register() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    company_code: "",
    company_name: "",
    email: "",
    address: "",
    mobile_number: "",
    password: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("1. SUBMIT CLICKED");
  console.log("2. FORM DATA:", formData);

  try {
    const response = await axiosInstance.post(
      "/users/register",
      formData
    );

    console.log("3. REGISTER RESPONSE:", response.data);

    alert("Registration Success");
    navigate("/");
  } catch (error) {
    console.error(
      "4. REGISTER ERROR:",
      error.response?.data || error.message
    );

    alert("Registration Failed");
  }
};

  return (

    <div className="min-h-screen flex justify-center items-center" style={{
            backgroundImage: `url(${gymBg})`
          }}>
  <div className="absolute inset-0 bg-black/70"></div>
      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl w-[500px]">

        <h2 className="text-2xl font-bold text-center mb-6">
          Company Registration
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

          {/* Company Code */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-[38px] text-gray-400" size={18}/>
            <Input
              label="Company Code"
              name="company_code"
              placeholder="Company Code"
              value={formData.company_code}
              onChange={handleChange}
              required
            />
          </div>


          {/* Company Name */}
          <div className="relative">
            <User className="absolute left-3 top-[38px] text-gray-400" size={18}/>
            <Input
              label="Company Name"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>


          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-[38px] text-gray-400" size={18}/>
            <Input
              label="Email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>


          {/* Address */}
          <div className="relative ">
            <MapPin className="absolute left-3 top-[38px] text-gray-400" size={18}/>
            <Input
              label="Address"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>


          {/* Mobile */}
          <div className="relative">
            <Phone className="absolute left-3 top-[38px] text-gray-400" size={18}/>
            <Input
              label="Mobile Number"
              name="mobile_number"
              placeholder="Mobile Number"
              value={formData.mobile_number}
              onChange={handleChange}
              required
            />
          </div>


          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-[38px] text-gray-400" size={18}/>
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="absolute right-3 top-[38px]"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>


          <div className="col-span-2">
       <button
  type="submit"
  className="w-full bg-green-600 text-white py-3 rounded-xl"
>
  Register
</button>
          </div>

        </form>


        <p className="text-center mt-4">

          Already have account?

          <Link
            to="/"
            className="text-blue-600 ml-1 font-semibold"
          >
            Login
          </Link>

        </p>

      </div>

    </div>

  );

}
