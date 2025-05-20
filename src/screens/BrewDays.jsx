// /src/screens/BrewDays.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./BrewDays.css";

function BrewDays() {
  const navigate = useNavigate();

  return (
    <div className="brew-days-screen">
      <h1>Scheduled Brew Days</h1>
      <button className="return-home-button" onClick={() => navigate("/")}>← Return Home</button>

      <button className="schedule-brew-button">+ Schedule Brew Day</button>

      <p className="subheading">View all upcoming brew days and scheduling conflicts.</p>

      <table className="brew-days-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Beer</th>
            <th>Tank</th>
            <th>Staff</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Placeholder row */}
          <tr>
            <td>2025-06-12</td>
            <td>Waypoint Hazy</td>
            <td>FV4</td>
            <td>Kelsey</td>
            <td>Scheduled</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BrewDays;
