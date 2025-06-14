import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import "./theme.css";
import { AuthProvider } from "./Auth/AuthProvider"; 

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
