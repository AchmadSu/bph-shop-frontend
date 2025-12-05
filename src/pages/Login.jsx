import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import { Icon } from "semantic-ui-react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success("Login successfully");
      setTimeout(() => {
        navigate(`/${user.role}`, { replace: true });
      }, 800);
    } catch (err) {
      console.log(err)
      const message = err.response?.data.message
      toast.error(message ?? "Wrong credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="d-flex justify-content-center mt-5">
      <Card style={{ width: "26rem" }} className="shadow">
        <Card.Body>
          <h3 className="text-center mb-4">
            <Icon name="sign in alternate" />
            Login
          </h3>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Masukkan email"
                onChange={e => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Masukkan password"
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Loading...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Form>

        </Card.Body>
      </Card>

      {/* Toast Notification */}
      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
}
