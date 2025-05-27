// /src/screens/Schedule.jsx
// Will render today's tasks, this week's tasks, and this month's brew dates with UI structure as described by the user.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import "./Schedule.css";

function Schedule() {
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState([]);
  const [weekTasks, setWeekTasks] = useState([]);
  const [brewDates, setBrewDates] = useState([]);
  

  useEffect(() => {
    const fetchScheduleData = async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const plansSnapshot = await getDocs(collection(db, "userPlans"));
      

      const plans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("🔍 All Plans:", plans);

      const tasksForToday = [];
      const tasksForWeek = [];
      const brewDatesList = [];

      await Promise.all(plans.map(async (plan) => {
  const planStart = new Date(plan.startDate);
  brewDatesList.push({ beerName: plan.beerName, startDate: planStart });

  const tasksSnapshot = await getDocs(collection(db, "userPlans", plan.id, "tasks"));
  const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  tasks.forEach((task) => {
  if (!task.scheduledDate) {
    console.warn("⚠️ Missing scheduledDate for task:", task.taskName || "Unnamed Task");
    return;
  }

  const taskDate = task.scheduledDate instanceof Timestamp
    ? task.scheduledDate.toDate()
    : new Date(task.scheduledDate);

  console.log("📆 Task Scheduled:", task.taskName, taskDate);

  const taskWithMeta = {
    ...task,
    planId: plan.id,
    beerName: plan.beerName,
    scheduledDate: taskDate
  };

  if (taskDate.toDateString() === today.toDateString()) {
    tasksForToday.push(taskWithMeta);
  }

  if (taskDate >= startOfWeek && taskDate <= endOfWeek) {
    tasksForWeek.push(taskWithMeta);
  }
  });
}));





      setTodayTasks(tasksForToday);
      setWeekTasks(tasksForWeek);
      setBrewDates(brewDatesList);
      console.log("🧪 Tasks for Today:", tasksForToday);
      console.log("🧪 Tasks for Week:", tasksForWeek);  
    };

    fetchScheduleData();
  }, []);

  const dayOfWeek = new Date().toLocaleDateString(undefined, { weekday: 'long' });
  const thisMonth = new Date().toLocaleDateString(undefined, { month: 'long' });

  return (
    <div className="schedule-screen">
      <h1>Schedule</h1>
      <button className="return-home-button" onClick={() => navigate('/')}>← Return Home</button>
      <button className="return-home-button" onClick={() => navigate('/plan')}>Planning</button>

      <aside className="sidebar">
        <h2>{thisMonth} Brew Dates</h2>
        <ul>
          {brewDates.map((brew) => (
            <li key={brew.beerName + brew.startDate.toISOString()}>
              {brew.beerName} – {brew.startDate.toLocaleDateString()}
            </li>
          ))}
        </ul>
      </aside>

      <main className="schedule-main">
        <section>
          <h2>{dayOfWeek}'s Tasks</h2>
          <ul>
            {todayTasks.map(task => (
              <li key={task.id}>{task.beerName}: {task.taskName}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>This Week’s Tasks</h2>
          <ul>
            {weekTasks.map(task => (
              <li key={task.id}>{task.beerName}: {task.taskName} on {task.scheduledDate.toLocaleDateString()}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Schedule;

