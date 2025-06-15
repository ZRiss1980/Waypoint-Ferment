// /src/components/AppLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import { useAuth } from "../Auth/AuthProvider";


export default function AppLayout() {
  const isLogin = useLocation().pathname === "/login";
  const { logout } = useAuth(); 

  return (
    <>
      {!isLogin && <NavBar />}
      <main>
        <Outlet />
        <button onClick={logout}>Sign Out</button>
      </main>
    </>
  );
}
