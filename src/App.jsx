// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import CS1Dashboard from "./pages/CS1Dashboard";
import CS2Dashboard from "./pages/CS2Dashboard";
import MyOrders from "./pages/MyOrders";

export default function App() {
  return (
    <>
    <Routes>
        <Route
            path="/admin"
            element={
            <ProtectedRoute allowedRoles={["admin"]}>
                <Layout>
                    <AdminDashboard />
                </Layout>
            </ProtectedRoute>
            }
        />
        <Route
            path="/"
            element={
                <Layout>
                    <BuyerDashboard />
                </Layout>
            }
        />
        <Route
            path="/my-orders"
            element={
            <ProtectedRoute allowedRoles={["buyer", "admin", "cs1", "cs2"]}>
                <Layout>
                    <MyOrders />
                </Layout>
            </ProtectedRoute>
            }
        />
        <Route
            path="/cs1"
            element={
            <ProtectedRoute allowedRoles={["cs1"]}>
                <Layout>
                    <CS1Dashboard />
                </Layout>
            </ProtectedRoute>
            }
        />
        <Route
            path="/cs2"
            element={
            <ProtectedRoute allowedRoles={["cs2"]}>
                <Layout>
                    <CS2Dashboard />
                </Layout>
            </ProtectedRoute>
            }
        />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <ToastContainer
        position="top-right"
        autoClose={2000}
    />
    </>
  );
}
