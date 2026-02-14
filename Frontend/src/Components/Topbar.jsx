import React, { useState, useEffect } from "react";
import { Bell, User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllClients } from "../API/Client";
import CompanyLogo from "../Features/CompanyLogo";

const Topbar = ({ rightContent }) => {

  const navigate = useNavigate();

  const [expiryNotifications, setExpiryNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const company_code = localStorage.getItem("company_code") || "";
const company_name = localStorage.getItem("company_name") || "Company";


  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getAllClients();
      filterExpiryNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filterExpiryNotifications = (clients) => {
    const today = new Date();
    const next5Days = new Date();
    next5Days.setDate(today.getDate() + 5);

    const upcoming = clients.filter(client => {
      const expiry = new Date(client.to_date);
      return expiry >= today && expiry <= next5Days;
    });

    setExpiryNotifications(upcoming);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (

    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#1e4543] px-4 py-3 flex justify-end items-center">

      <div className="relative flex items-center gap-4">

        {/* 🔔 Bell */}
        <div
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfileMenu(false);
          }}
          className="cursor-pointer p-2 rounded-full bg-[#C2FC85]"
        >
          <Bell size={22}/>
        </div>


        {/* 👤 Profile */}
        <div className="relative">

          <img
            src="/default-avatar.png"
            alt="profile"
            onClick={()=>{
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="w-10 h-10 rounded-full border-2 border-[#C2FC85] cursor-pointer"
          />
              {/* <CompanyLogo
                                    companyCode={company_code}
                                    className="h-14 mx-auto"
                                /> */}


          {/* DROPDOWN */}
          {showProfileMenu && (

            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl overflow-hidden">

              {/* HEADER */}
              {/* <div className="p-4 bg-gray-100 flex items-center gap-3">

                <img
                  src="/default-avatar.png"
                  className="w-12 h-12 rounded-full"
                />

                <div>
                  <p className="font-semibold">{company}</p>
               
                </div>

              </div> */}


              {/* PROFILE BUTTON */}
              <button
                onClick={()=>{
                  setShowProfileMenu(false);
                  navigate("/profile");
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100"
              >
                <User size={18}/>
                Profile
              </button>


              {/* MESSAGE BUTTON */}
              <button
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100"
              >
                <Mail size={18}/>
                My Messages
              </button>


              {/* LOGOUT */}
              <button
             onClick={handleLogout}
                className="w-full px-4 py-3 text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
                {/* <button
              onClick={handleLogout}
              className="cursor-pointer w-full py-2.5 bg-[#C2FC85]
  text-[#434444] font-medium rounded-xl shadow-md
  hover:bg-white transition-all duration-300"
            >
              Logout
            </button> */}

            </div>

          )}

        </div>

      </div>


      {/* NOTIFICATION PANEL */}
      {showNotifications && (

        <div className="absolute top-16 right-4 w-80 bg-white rounded-xl shadow-lg">

          <div className="p-4 font-semibold border-b">
            Expiry Notifications
          </div>

          {expiryNotifications.length === 0 ? (

            <div className="p-4 text-gray-500">
              No notifications
            </div>

          ) : (

            expiryNotifications.map(client=>(
              <div key={client.id} className="p-4 border-b">

                {client.client_name}

              </div>
            ))

          )}

        </div>

      )}

    </div>

  );
};

export default Topbar;
