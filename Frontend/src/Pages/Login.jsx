import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Authentication } from "../API/Login";
import { Lock, Briefcase, Eye, EyeOff } from "lucide-react";
import Input from "../Components/UI/Input";
import gymBg from "../assets/gym-bg.png";

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company_code: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await Authentication(formData);

    localStorage.setItem("authToken", res.token);
    localStorage.setItem("company_code", res.user.company_code);
    localStorage.setItem("company_name", res.user.company_name);

      navigate("/enquiry");

    } catch {

      alert("Invalid Company Code or Password");

    }

  };

  return (

<div className="min-h-screen flex justify-center items-center"   style={{
        backgroundImage: `url(${gymBg})`
      }}>
  <div className="absolute inset-0 bg-black/70"></div>

      <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Company Code */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-[38px] text-gray-400" size={18} />

            <Input
              label="Company Code"
              name="company_code"
              placeholder="Enter Company Code"
              value={formData.company_code}
              onChange={handleChange}
              required
            />
          </div>


          {/* Password */}
          <div className="relative">

            <Lock className="absolute left-3 top-[38px] text-gray-400" size={18} />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter Password"
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


          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Login
          </button>

        </form>


        <p className="text-center mt-4">

          Don’t have account?

          <Link
            to="/register"
            className="text-blue-600 ml-1 font-semibold"
          >
            Sign up
          </Link>

        </p>

      </div>

    </div>

  );

}
