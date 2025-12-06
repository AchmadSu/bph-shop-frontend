// components/Layout.jsx
import React from "react";
import { Container } from "react-bootstrap";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <div className="layout">
        <div className="main-content">
          <Navbar />
          <Container className="mt-4">
            {children}
          </Container>
        </div>
        <Footer/>
      </div>
    </>
  );
}
