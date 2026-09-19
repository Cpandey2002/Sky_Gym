import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../Pages/Login";
import Enquiry from "../Features/Enquiry";
import Registration from "../Features/Registration";
import NotFound from "../Pages/NotFound";
import BirthdayList from "../Pages/BirthdayList";
import ClientDetails from "../Features/ClientDetails";
import UpdateClient from "../Features/UpdateClient";
import RenewClient from "../Features/RenewClient";

import RedirectIfLoggedIn from "./RedirectIfLoggedIn";
import ProtectedRoute from "./ProtectedRoute";
import AttendanceReport from "../Pages/AttendanceReport";
import Icard from "../Features/ICard";
import Register from "../Pages/Register";
import Profile from "../Pages/Profile";
import CategoryMaster from "../Pages/CategoryMaster";
import Dashboard from "../Pages/Dashboard";

export default function Routing() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ✅ PUBLIC ROUTE (LOGIN) */}
                <Route
                    path="/"
                    element={
                        <>
                            <RedirectIfLoggedIn />
                            <Login />
                        </>
                    }
                />
                <Route path="/register" element={<Register />} />

                {/* ✅ ALL PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route path="/enquiry" element={<Enquiry />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/clientdetails" element={<ClientDetails />} />
                    <Route path="/birthdaylist" element={<BirthdayList />} />
                    <Route path="/attendance-report" element={<AttendanceReport />} />
                    <Route path="/update-client/:id" element={<UpdateClient />} />
                    <Route path="/renew-client/:id" element={<RenewClient />} />
                    <Route
                        path="/category-master"
                        element={<CategoryMaster />}
                    />
                    <Route path="/icard" element={<Icard />} />
                    <Route path="/profile" element={<Profile />} />



                    {/*  */}

                </Route>

                {/* ✅ 404 PAGE */}
                <Route path="*" element={<NotFound />} />

            </Routes>
        </BrowserRouter>
    );
}
