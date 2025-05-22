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
        <button className="add-fermenter-button" onClick={() => navigate("/plan")}>Beer Planning</button>
        <button className="add-fermenter-button" onClick={() => navigate("/brew-days")}>Brew Days</button>
        <button className="add-fermenter-button" onClick={() => navigate("/tasks")}>Task Overview</button>
      </div>

      <div className="brew-days-this-month">
        <h2>Brew Days This Month</h2>
        <ul>
          {brewDays.map(plan => (
            <li key={plan.id}>
              {plan.beerName} – {new Date(plan.startDate).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>

      <div className="brew-days-this-month">
        <h2>Brew Days This Month</h2>
        <ul>
          {brewDays.map(plan => (
            <li key={plan.id}>
              {plan.beerName} – {new Date(plan.startDate).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>

      <DailyScheduleGrid />

      <div className="weekly-tasks">
        <h2>Tasks This Week</h2>
        {Object.entries(groupTasksByDay(weeklyTasks)).map(([day, tasks]) => (
          <div key={day}>
            <h3>{day}</h3>
            <ul>
              {tasks.map(task => (
                <li key={task.id}>
                  {task.taskName} – {new Date(task.dueDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Schedule;
