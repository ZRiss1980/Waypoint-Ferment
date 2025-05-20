import React from "react";
import DailyScheduleGrid from "../components/DailyScheduleGrid";
import { useNavigate } from "react-router-dom";
import "./Tanks.css";

const Schedule = () => {
  const navigate = useNavigate();

  return (
    <div className="fermenters-screen">
      <h1>Brew Schedule</h1>
      <button className="return-home-button" onClick={() => navigate("/")}>← Return Home</button>
      <p className="subheading">Plan and manage all brew-related scheduling here.</p>

      <div className="add-fermenter-wrapper">
        <button className="add-fermenter-button" onClick={() => navigate("/plan")}>
          Beer Planning
        </button>
        <button className="add-fermenter-button" onClick={() => navigate("/brew-days")}>
          Brew Days
        </button>
        <button className="add-fermenter-button" onClick={() => navigate("/tasks")}>
          Task Overview
        </button>
      </div>

      <DailyScheduleGrid />
    </div>
  );
};

export default Schedule;
