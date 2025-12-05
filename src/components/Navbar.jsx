import React, { useState } from "react";
import { Navbar as RBNavbar, Container, Nav, Spinner, Image } from "react-bootstrap";
import { Icon, Button } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Navbar() {
  const { logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const imageUrl = "https://www.bphmigas.go.id/wp-content/uploads/2025/10/FA_Logo-BPH-MIGAS.png"

  const handleLogout = async () => {
    setLoading(true);
    try {
        await api.post("/logout", null, { withCredentials: true });
        logout
        setUser(null)
        navigate("/auth");
    } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed, please try again!");
    } finally {
        setLoading(false);
    }
  };

  return (
    <RBNavbar expand="lg" variant="dark" className="p-4" style={{ background: "linear-gradient(90deg, #003399 0%, #00AEEF 50%, #C2D500 100%)" }}>
      <Container>
        <RBNavbar.Brand href="#" className="fw-bold" style={{ fontSize: "1.5rem" }}>
          <Image
            src={imageUrl} 
            alt="BPH Migas Logo"
            width={40}
            height={40}
            className="me-2"
            rounded
          />
          BPH <span style={{ color: "#C2D500" }}>Shop</span>
        </RBNavbar.Brand>
        <RBNavbar.Toggle aria-controls="basic-navbar-nav" />
        <RBNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Button
              color="red"
              onClick={handleLogout}
              disabled={loading}
              style={{ display: "flex", alignItems: "center" }}
            >
              {loading ? <Spinner animation="border" size="sm" className="me-2" /> : <Icon name="sign-out" className="me-1" />}
              Logout
            </Button>
          </Nav>
        </RBNavbar.Collapse>
      </Container>
    </RBNavbar>
  );
}
