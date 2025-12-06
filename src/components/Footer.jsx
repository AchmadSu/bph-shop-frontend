import React from "react";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© {year} BPH - Shop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
