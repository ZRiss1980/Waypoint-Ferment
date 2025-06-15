// /src/components/AppLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
  const isLogin = useLocation().pathname === "/login";

  return (
    <>
      {!isLogin && <NavBar />}
      <main>
        <Outlet />
      </main>
    </>
  );
}
