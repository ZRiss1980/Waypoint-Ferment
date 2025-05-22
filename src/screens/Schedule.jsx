import React from "react";
import DailyScheduleGrid from "../components/DailyScheduleGrid";
import { useNavigate } from "react-router-dom";
import "./Tanks.css";
import { useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";


  
const groupTasksByDay = (tasks) => {
  const days = {};
  tasks.forEach((task) => {
    const date = new Date(task.dueDate);
    const day = date.toLocaleDateString("en-US", { weekday: "long" });
    if (!days[day]) days[day] = [];
    days[day].push(task);
  });
  return days;
};

const Schedule = () => {
  const navigate = useNavigate();
  const [brewDays, setBrewDays] = React.useState([]);
  const [weeklyTasks, setWeeklyTasks] = React.useState([]);

  useEffect(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const oneWeekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const loadBrewDays = async () => {
      const snapshot = await getDocs(collection(db, "userPlans"));
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const thisMonthPlans = plans.filter(plan => {
        const date = new Date(plan.startDate);
        return !isNaN(date) && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });
      setBrewDays(thisMonthPlans);
    };

    const loadWeeklyTasks = async () => {
  const now = new Date();
  const oneWeekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const snapshot = await getDocs(collection(db, "taskTemplates"));
  const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const tasksThisWeek = templates
    .filter(t => t.anchorEvent === "daily" && !isNaN(parseInt(t.dayOffset)))
    .map(t => {
      const offset = parseInt(t.dayOffset, 10);
      const dueDate = new Date(now);
      dueDate.setDate(now.getDate() + offset);
      return {
        id: t.id,
        taskName: t.taskName,
        dueDate: dueDate.toISOString()
      };
    })
    .filter(t => {
      const d = new Date(t.dueDate);
      return d >= now && d <= oneWeekOut;
    });

  setWeeklyTasks(tasksThisWeek);
    };

    loadBrewDays();
    loadWeeklyTasks();
  }, []);

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
