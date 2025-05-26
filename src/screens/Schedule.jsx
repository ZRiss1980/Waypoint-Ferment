import React, { useState, useEffect } from "react";
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

      for (const plan of plans) {
        const planStart = new Date(plan.startDate);
        brewDatesList.push({ beerName: plan.beerName, startDate: planStart });

        const tasksSnapshot = await getDocs(collection(db, "userPlans", plan.id, "scheduledTasks"));
        const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        for (const task of tasks) {
          const taskDate = new Date(planStart);
          taskDate.setDate(taskDate.getDate() + (task.dayOffset || 0));

          const taskWithMeta = {
            ...task,
            planId: plan.id,
            beerName: plan.beerName,
            scheduledDate: taskDate
          };

          if (
            taskDate.toDateString() === today.toDateString()
          ) {
            tasksForToday.push(taskWithMeta);
          }

          if (
            taskDate >= startOfWeek && taskDate <= endOfWeek
          ) {
            tasksForWeek.push(taskWithMeta);
          }
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
