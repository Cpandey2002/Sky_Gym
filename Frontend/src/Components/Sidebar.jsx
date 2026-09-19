import React, { useState } from "react";
import {
  BookUser,
  ShieldAlert,
  ReceiptText,
  Cake,
  Menu,
  X,
  User,
  NotebookPen,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { NavLink, useNavigate, useMatch } from "react-router-dom";
import Cookies from "js-cookie";
import Logo from "../assets/logo (2).png";
import CompanyLogo from "../Features/CompanyLogo";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);

  const company_code = localStorage.getItem("company_code") || "";
  const company_name = localStorage.getItem("company_name") || "";


  const toggleSidebar = () => setIsOpen(!isOpen);

  const matchUpdateClient = useMatch("/update-client/:id");
  const matchRenewClient = useMatch("/renew-client/:id");

  const menuItems = [
    {
  text: "Dashboard",
  path: "/dashboard",
  icon: <LayoutDashboard size={20} />
},
    { icon: <ShieldAlert size={20} />, text: "Enquiry", path: "/enquiry" },
    { icon: <ReceiptText size={20} />, text: "Registration", path: "/registration" },
    { icon: <BookUser size={20} />, text: "Client Details", path: "/clientdetails" },
    { icon: <BookUser size={20} />, text: "Icard", path: "/icard" },
    {
      icon: <NotebookPen size={20} />, text: "Attendance Report", path: "/attendance-report",
    },
    {
      icon: <NotebookPen size={20} />,
      text: "Master",
      submenu: [
        {
          text: "Category Master",
          path: "/category-master"
        }
      ]
    },
    { icon: <Cake size={20} />, text: "Birthday", path: "/birthdaylist" },
  ];

  const handleRouteClick = () => {
    if (isOpen) setIsOpen(false);
  };

  // const handleLogout = () => {
  //   localStorage.clear();
  //   Cookies.remove("authToken");
  //   navigate("/", { replace: true });
  // };
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };


  return (
    <div className="font-sans">

      {/* Mobile Toggle */}
      <button
        className="fixed top-2 right-4 z-70 p-1 bg-black rounded-lg text-white shadow-sm xl:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>


      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
    fixed inset-y-0 flex flex-col w-full max-w-[17rem] p-0 overflow-y-auto
    border-r border-[#434444] shadow-lg z-999 bg-black
    sidebar-slide
    ${isOpen ? "left-0" : "-left-full"} 
    xl:left-0
  `}
      >

        {/* Header */}

        <div className="flex items-center px-3 py-2 rounded-lg hover:bg-[#434444] ml-[10px] mb-[8px] mt-[20px]">
          <div className="w-10 h-10 bg-[#434444] rounded-full flex items-center justify-center">
            <User className="text-[#C2FC85]" size={18} />
          </div>

          <div className="ml-2">
            <p className="font-medium text-white capitalize">
              {company_code}
            </p>

            <p className="text-sm text-white capitalize">
              {company_name}
            </p>
          </div>

        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-scroll hide-scrollbar h-screen py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <li key={index}>

                {item.submenu ? (
                  <>
                    {/* Master */}
                    <button
                      onClick={() => setMasterOpen(!masterOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-white hover:bg-[#C2FC85] hover:text-[#434444]"
                    >
                      <div className="flex items-center">
                        <div className="bg-[#434444] w-9 h-9 rounded-xl flex items-center justify-center shadow-sm">
                          <div className="text-[#C2FC85]">
                            {item.icon}
                          </div>
                        </div>

                        <span className="ml-3 font-medium group-hover:font-semibold">
                          {item.text}
                        </span>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${masterOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Submenu */}
                    {masterOpen && (
                      <ul className="ml-10 mt-1 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <NavLink
                              to={subItem.path}
                              onClick={handleRouteClick}
                              className={({ isActive }) =>
                                `block px-4 py-2 rounded-lg text-base transition-all duration-200 ${isActive
                                  ? "bg-[#C2FC85] text-[#434444] font-semibold"
                                  : "text-white hover:bg-[#C2FC85] hover:text-[#434444]"
                                }`
                              }
                            >
                              {subItem.text}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  /* Normal Menu */
                  <NavLink
                    to={item.path}
                    onClick={handleRouteClick}
                    className={({ isActive }) => {
                      const finalActive =
                        isActive ||
                        (item.path === "/clientdetails" &&
                          (matchUpdateClient || matchRenewClient));

                      return `flex items-center px-4 py-2 rounded-xl transition-all duration-200 group
          ${finalActive
                          ? "bg-[#C2FC85] text-[#434444] font-semibold"
                          : "text-white hover:bg-[#C2FC85] hover:text-[#434444]"
                        }`;
                    }}
                  >
                    <div className="bg-[#434444] w-9 h-9 rounded-xl flex items-center justify-center shadow-sm">
                      <div className="text-[#C2FC85]">
                        {item.icon}
                      </div>
                    </div>

                    <span className="ml-3 font-medium group-hover:font-semibold">
                      {item.text}
                    </span>
                  </NavLink>
                )}

              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black">
          {/* <div className="flex items-center px-3 py-2 rounded-lg hover:bg-[#434444]">
            <div className="w-10 h-10 bg-[#434444] rounded-full flex items-center justify-center">
              <User className="text-[#C2FC85]" size={18} />
            </div>

            <div className="ml-2">
              <p className="font-medium text-white capitalize">
                {company_code}
              </p>

              <p className="text-sm text-white capitalize">
                {company_name}
              </p>
            </div>

          </div> */}


          <div className="mt-2 mx-3">
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full py-2.5 bg-[#C2FC85]
  text-[#434444] font-medium rounded-xl shadow-md
  hover:bg-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
};

export default Sidebar;
