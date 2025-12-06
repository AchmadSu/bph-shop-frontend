import React, { useState } from "react";
import {
  Navbar as RBNavbar,
  Container,
  Nav,
  Spinner,
  Image,
  Modal,
  Toast,
  Form as RBForm,
  Button as RBButton,
} from "react-bootstrap";
import { Icon, Button } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function Navbar() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const imageUrl =
    "https://www.bphmigas.go.id/wp-content/uploads/2025/10/FA_Logo-BPH-MIGAS.png";

  const handleLogin = async () => {
    setLoading(true);
    try {
      await api.post("/auth", formData, {
        withCredentials: true,
      });
      const me = await api.get("/me", { withCredentials: true });
      const newUser = me.data.data;
      setUser(newUser);
      setLoginModal(false);
      setFormData({ email: "", password: "" });
      if(newUser.role === "buyer") {
        navigate("/");
      } else {
        navigate(`/${newUser.role}`);
      }
      toast.success("Login successfully")
    } catch (err) {
      console.error(err);
      const message = err.response?.data.message;
      toast.error(message ?? "Wrong credentials!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/logout", null, { withCredentials: true });
      logout();
      setUser(null);
      navigate("/");
      toast.success("Logout successfully")
    } catch (err) {
      const message = err.response?.data.message
      toast.error(message ?? "Logout failed, please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RBNavbar
        expand="lg"
        variant="dark"
        className="p-4"
        style={{
          background:
            "linear-gradient(90deg, #003399 0%, #00AEEF 50%, #C2D500 100%)",
        }}
      >
        <Container>
          <RBNavbar.Brand
            href="/"
            className="fw-bold"
            style={{ fontSize: "1.5rem" }}
          >
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

              {/* MENU */}
              {user && (
                <Nav.Link
                  href="/my-orders"
                  className="mx-3 fw-semibold text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  My Orders
                </Nav.Link>
              )}

              {user?.role === "admin" && (
                <Nav.Link
                  href="/admin"
                  className="mx-3 fw-semibold text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  Master Product
                </Nav.Link>
              )}

              {user?.role === "cs2" && (
                <Nav.Link
                  href="/cs2"
                  className="mx-3 fw-semibold text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  Shipment
                </Nav.Link>
              )}

              {user?.role === "cs1" && (
                <Nav.Link
                  href="/cs1"
                  className="mx-3 fw-semibold text-white"
                  style={{ fontSize: "1.1rem" }}
                >
                  Payment Management
                </Nav.Link>
              )}

              {user ? (
                <Button
                  color="red"
                  onClick={handleLogout}
                  disabled={loading}
                  className="ms-3 d-flex align-items-center"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <Icon name="sign-out" className="me-1" />
                  )}
                  Logout
                </Button>
              ) : (
                <Button
                  color="blue"
                  onClick={() => setLoginModal(true)}
                  className="ms-3 d-flex align-items-center"
                >
                  <Icon name="sign-in" className="me-1" />
                  Login
                </Button>
              )}
            </Nav>
          </RBNavbar.Collapse>
        </Container>
      </RBNavbar>


      <Modal show={loginModal} onHide={() => setLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <RBForm>
            <RBForm.Group className="mb-3">
              <RBForm.Label>Email</RBForm.Label>
              <RBForm.Control
                type="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </RBForm.Group>

            <RBForm.Group className="mb-3">
              <RBForm.Label>Password</RBForm.Label>
              <RBForm.Control
                type="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </RBForm.Group>
          </RBForm>
        </Modal.Body>

        <Modal.Footer>
          <Button
            color="grey"
            onClick={() => setLoginModal(false)}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            color="blue"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
