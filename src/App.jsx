// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./context/AuthContext";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminDashboard from "./pages/AdminDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import CS1Dashboard from "./pages/CS1Dashboard";
import CS2Dashboard from "./pages/CS2Dashboard";
import MyOrders from "./pages/MyOrders";

export default function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
            <Routes>
            <Route path="/auth" element={<Login />} />
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
                path="/buyer"
                element={
                <ProtectedRoute allowedRoles={["buyer"]}>
                    <Layout>
                        <BuyerDashboard />
                    </Layout>
                </ProtectedRoute>
                }
            />
            <Route
                path="/my-orders"
                element={
                <ProtectedRoute allowedRoles={["buyer"]}>
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
            <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}
