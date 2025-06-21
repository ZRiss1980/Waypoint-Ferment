// /src/components/NavBar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../Auth/AuthProvider"; 
import "./NavBar.css";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth(); 

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-header">
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
        <h1 className="app-title">WayPoint Ferment</h1>
      </div>
      <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>Home</NavLink>
        <NavLink to="/inventory" onClick={closeMenu}>Inventory</NavLink>
        <NavLink to="/scheduling" onClick={closeMenu}>Scheduling</NavLink>
        <NavLink to="/tasks" onClick={closeMenu}>Tasks</NavLink>
        <button onClick={logout} className="logout-btn">Sign Out</button> 
      </nav>
    </header>
  );
}

export default NavBar;
