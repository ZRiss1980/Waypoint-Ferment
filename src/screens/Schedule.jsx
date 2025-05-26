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

      const tasksForToday = [];
      const tasksForWeek = [];
      const brewDatesList = [];

      const tasksSnapshot = await getDocs(collection(db, "userPlans", plan.id, "tasks"));
const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

for (const task of tasks) {
  if (!task.scheduledDate) continue;
  const taskDate = new Date(task.scheduledDate.toDate ? task.scheduledDate.toDate() : task.scheduledDate);

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
}


      setTodayTasks(tasksForToday);
      setWeekTasks(tasksForWeek);
      setBrewDates(brewDatesList);
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
            <li key={brew.beerName + brew.startDate}>
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
              <li key={task.id}>{task.beerName}: {task.taskTemplateId}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2>This Week’s Tasks</h2>
          <ul>
            {weekTasks.map(task => (
              <li key={task.id}>{task.beerName}: {task.taskTemplateId} on {task.scheduledDate.toLocaleDateString()}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Schedule;
