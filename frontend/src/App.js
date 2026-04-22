import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import GuestRoute from "./components/Website/GuestRoute/GuestRoute";
import RoleRoute from "./components/Website/RoleRoute/RoleRoute";

import AdminDashboard from "./components/Staff/Admin/AdminDashboard/AdminDashboard";
import TechnicianDashboard from "./components/Staff/Technician/TechnicianDashboard/TechnicianDashboard";
import UserDashboard from "./components/Website/UserDashboard/UserDashboard";
import HomePage from "./components/Website/HomePage/HomePage";
import AboutUs from "./components/Website/AboutUs/AboutUs";
import ContactUs from "./components/Website/ContactUs/ContactUs";
import ResourceListPage from "./components/Website/ResourceListPage/ResourceListPage";
import ResourceDetailsPage from "./components/Website/ResourceDetailsPage/ResourceDetailsPage";
import AdminResourceManagement from "./components/Staff/Admin/AdminResourceManagement/AdminResourceManagement";
import AdminBookingManagement from "./components/Staff/Admin/AdminBookingManagement/AdminBookingManagement";
import AdminUserManagement from "./components/Staff/Admin/AdminUserManagement/AdminUserManagement";
import AdminStaffManagement from "./components/Staff/Admin/AdminStaffManagement/AdminStaffManagement";
import MyBookingsPage from "./components/Website/MyBookingsPage/MyBookingsPage";
import CreateTicketPage from "./components/Website/CreateTicketPage/CreateTicketPage";
import MyTicketsPage from "./components/Website/MyTicketsPage/MyTicketsPage";
import TicketDetailsPage from "./components/Website/TicketDetailsPage/TicketDetailsPage";
import AdminTicketManagement from "./components/Staff/Admin/AdminTicketManagement/AdminTicketManagement";
import TechnicianTicketsPage from "./components/Staff/Technician/TechnicianTicketsPage/TechnicianTicketsPage";
import UserProfilePage from "./components/Website/UserProfilePage/UserProfilePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/resources" element={<ResourceListPage />} />
      <Route path="/resources/:id" element={<ResourceDetailsPage />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RoleRoute allowedRole="ADMIN" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/resources" element={<AdminResourceManagement />} />
        <Route path="/admin/bookings" element={<AdminBookingManagement />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/staff" element={<AdminStaffManagement />} />
        <Route path="/admin/tickets" element={<AdminTicketManagement />} />
      </Route>

      <Route element={<RoleRoute allowedRole="TECHNICIAN" />}>
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
        <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
      </Route>

      <Route element={<RoleRoute allowedRole="USER" />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/create-ticket" element={<CreateTicketPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/my-tickets/:id" element={<TicketDetailsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}