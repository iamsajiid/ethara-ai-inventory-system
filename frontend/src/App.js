import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";

import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";

function Sidebar() {
  const links = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/products", label: "Products", icon: <Package size={18} /> },
    { to: "/customers", label: "Customers", icon: <Users size={18} /> },
    { to: "/orders", label: "Orders", icon: <ShoppingCart size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>📦 InvenTrack</h2>
        <p>Inventory &amp; Orders</p>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}