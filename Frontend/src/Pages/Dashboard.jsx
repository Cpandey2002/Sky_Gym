import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Topbar from "../Components/Topbar";
import DashboardCard from "../DashboardCard";
import { getAllClients } from "../API/Client";
import { getEnquiryAll } from "../API/Enquiry";
import Table from "../Components/UI/Table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [totalClients, setTotalClients] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [expiredMembers, setExpiredMembers] = useState(0);
  const [expiringSoon, setExpiringSoon] = useState(0);
  const [todayBirthdays, setTodayBirthdays] = useState(0);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [todayEnquiries, setTodayEnquiries] = useState([]);
  const [enquiryChartData, setEnquiryChartData] = useState([]);

  const memberChartData = [
    {
      name: "Active Members",
      value: activeMembers,
    },
    {
      name: "Expired Members",
      value: expiredMembers,
    },
    {
      name: "Expiring Soon",
      value: expiringSoon,
    },
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clients = await getAllClients();
        const enquiries = await getEnquiryAll();

        const enquiryResponse = enquiries;

        const enquiryToday = new Date();

        const todayData = enquiryResponse.filter((enquiry) => {
          if (!enquiry.enquiry_date) return false;

          const enquiryDate = new Date(enquiry.enquiry_date);

          return (
            enquiryDate.getDate() === enquiryToday.getDate() &&
            enquiryDate.getMonth() === enquiryToday.getMonth() &&
            enquiryDate.getFullYear() === enquiryToday.getFullYear()
          );
        });

        setTodayEnquiries(todayData);

        setTotalClients(clients.length);
        setTotalEnquiries(enquiries.length);

        const today = new Date();

        const active = clients.filter((client) => {
          const fromDate = new Date(client.from_date);
          const toDate = new Date(client.to_date);

          return fromDate <= today && today <= toDate;
        });

        setActiveMembers(active.length);

        const expired = clients.filter((client) => {
          const toDate = new Date(client.to_date);

          return toDate < today;
        });

        setExpiredMembers(expired.length);

        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const expiring = clients.filter((client) => {
          const toDate = new Date(client.to_date);

          return toDate >= today && toDate <= sevenDaysLater;
        });

        setExpiringSoon(expiring.length);

        const birthdays = clients.filter((client) => {
          if (!client.dob) return false;

          const dob = new Date(client.dob);

          return (
            dob.getMonth() === today.getMonth() &&
            dob.getDate() === today.getDate()
          );
        });

        setTodayBirthdays(birthdays.length);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };


    fetchClients();
  }, []);

  const enquiryColumns = [
    { header: "Name", accessor: "client_name" },
    { header: "Mobile", accessor: "mobile" },
    { header: "Email", accessor: "email" },
    { header: "Enquiry From", accessor: "enquiry_received_from" },
  ];


  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <div className="xl:ml-[17rem]">
        <Topbar />

        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-6">
            Dashboard
          </h1>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 w-full">
            <DashboardCard
              title="Total Clients"
              value={totalClients}
            />

            <DashboardCard
              title="Active Members"
              value={activeMembers}
            />

            <DashboardCard
              title="Expired Members"
              value={expiredMembers}
            />

            <DashboardCard
              title="Expiring Soon"
              value={expiringSoon}
            />

            <DashboardCard
              title="Today's Birthdays"
              value={todayBirthdays}
            />

            <DashboardCard
              title="Total Enquiries"
              value={totalEnquiries}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">

            {/* Left - Today's Enquiries */}
            <div className=" bg-white rounded-lg shadow-md min-w-0">
              <Table
                tableTitle="Today's Enquiries"
                columns={enquiryColumns}
                data={todayEnquiries}
                loading={false}
                showSearch={false}
                showExport={false}
                hideHeaderGap={true}
                tableHeight="h-[400px]"
              />
            </div>

            {/* Right - Dummy Pie Chart */}
            {/* Right - Members Overview */}
            <div className="bg-white p-4 rounded-lg shadow-md">

              <h2 className="text-2xl font-semibold mb-4">
                Members Overview
              </h2>

              <div className="w-full h-[250px]">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>

                    <Pie
                      data={memberChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="35%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={2}
                      label
                    >
                      {memberChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            "#22C55E",
                            "#EF4444",
                            "#F59E0B",
                          ][index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      height={20}
                    />

                  </PieChart>
                </ResponsiveContainer>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;