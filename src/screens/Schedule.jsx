// /src/screens/Schedule.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import "./Schedule.css";

function Schedule() {
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState([]);
  const [weekTasks, setWeekTasks] = useState([]);
  const [brewDates, setBrewDates] = useState([]);

  useEffect(() => {
    const getDuration = (type) => {
      return type === "lager" ? 42 : type === "hybrid" ? 21 : 14;
    };

    const addDays = (date, days) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    };

    const dateRangesOverlap = (startA, endA, startB, endB) => {
      return startA < endB && startB < endA;
    };

    const getPlanPriority = (plan) => {
      if (plan.flagType === "flagship") return 3;
      if (plan.flagType === "seasonal") return 2;
      if (plan.flagType === "one-off" && plan.eventDueDate) return 3;
      return 1;
    };

    const updateTaskDates = async (planId, newStartDate) => {
      const tasksRef = collection(db, `userPlans/${planId}/tasks`);
      const taskSnap = await getDocs(tasksRef);
      const newStart = new Date(newStartDate);

      for (const taskDoc of taskSnap.docs) {
        const task = taskDoc.data();
        if (task.anchorEvent === "brewDay") {
          const newDueDate = addDays(newStart, task.dayOffset);
          await updateDoc(doc(db, `userPlans/${planId}/tasks`, taskDoc.id), {
            scheduledDate: newDueDate.toISOString(),
          });
        }
      }
    };

    const fetchScheduleData = async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const [plansSnap, fermentersSnap] = await Promise.all([
        getDocs(collection(db, "userPlans")),
        getDocs(collection(db, "fermenters")),
      ]);

      const fermenters = fermentersSnap.docs.map((doc) => doc.id);
      const plans = plansSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Build current FV occupancy map
      const fvBookings = {};
      fermenters.forEach((fv) => (fvBookings[fv] = []));

      plans.forEach((plan) => {
        if (plan.assignedFermenter) {
          fvBookings[plan.assignedFermenter].push({
            start: new Date(plan.startDate),
            end: new Date(plan.endDate),
          });
        }
      });

      // Sort plans by priority
      plans.sort((a, b) => getPlanPriority(b) - getPlanPriority(a));

      for (const plan of plans) {
        if (!plan.assignedFermenter) {
          const duration = getDuration(plan.fermentationType);
          const originalStart = new Date(plan.startDate);
          let bestFV = null;
          let bestStart = null;

          for (const fv of fermenters) {
            let tryDate = new Date(originalStart);
            let conflict = true;

            while (conflict) {
              const tryEnd = addDays(tryDate, duration);
              conflict = fvBookings[fv].some((booking) =>
                dateRangesOverlap(tryDate, tryEnd, booking.start, booking.end)
              );

              if (!conflict) {
                bestFV = fv;
                bestStart = new Date(tryDate);
                break;
              }

              tryDate.setDate(tryDate.getDate() + 1);
            }
          }

          if (bestFV && bestStart) {
            const newEnd = addDays(bestStart, duration);
            plan.assignedFermenter = bestFV;
            plan.startDate = bestStart.toISOString();
            plan.endDate = newEnd.toISOString();

            // Push update to Firestore
            await updateDoc(doc(db, "userPlans", plan.id), {
              assignedFermenter: bestFV,
              startDate: plan.startDate,
              endDate: plan.endDate,
            });

            await updateTaskDates(plan.id, plan.startDate);

            fvBookings[bestFV].push({
              start: new Date(plan.startDate),
              end: new Date(plan.endDate),
            });
          }
        }
      }

      const tasksForToday = [];
      const tasksForWeek = [];
      const brewDatesList = [];

      for (const plan of plans) {
        const planStart = new Date(plan.startDate);
        brewDatesList.push({
          beerName: plan.beerName,
          startDate: planStart,
          assignedFermenter: plan.assignedFermenter || null,
        });

        const tasksSnap = await getDocs(
          collection(db, "userPlans", plan.id, "tasks")
        );
        const tasks = tasksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        tasks.forEach((task) => {
          if (!task.scheduledDate) return;

          const taskDate =
            task.scheduledDate instanceof Timestamp
              ? task.scheduledDate.toDate()
              : new Date(task.scheduledDate);

          const taskWithMeta = {
            ...task,
            planId: plan.id,
            beerName: plan.beerName,
            scheduledDate: taskDate,
          };

          const normalizedToday = new Date(today);
          normalizedToday.setHours(0, 0, 0, 0);

          const normalizedTask = new Date(taskDate);
          normalizedTask.setHours(0, 0, 0, 0);

          if (normalizedTask.getTime() === normalizedToday.getTime()) {
            tasksForToday.push(taskWithMeta);
          }

          const normalizedStart = new Date(startOfWeek);
          normalizedStart.setHours(0, 0, 0, 0);

          const normalizedEnd = new Date(endOfWeek);
          normalizedEnd.setHours(0, 0, 0, 0);

          if (
            normalizedTask >= normalizedStart &&
            normalizedTask <= normalizedEnd
          ) {
            tasksForWeek.push(taskWithMeta);
          }
        });
      }

      setTodayTasks(tasksForToday);
      setWeekTasks(tasksForWeek);
      setBrewDates(brewDatesList);
    };

    fetchScheduleData();
  }, []);

  const dayOfWeek = new Date().toLocaleDateString(undefined, {
    weekday: "long",
  });
  const thisMonth = new Date().toLocaleDateString(undefined, {
    month: "long",
  });

  return (
    <div className="schedule-screen">
      <h1>Schedule</h1>
      <button className="return-home-button" onClick={() => navigate("/")}>
        ← Return Home
      </button>
      <button className="return-home-button" onClick={() => navigate("/plan")}>
        Planning
      </button>

      <aside className="sidebar">
        <h2>{thisMonth} Brew Dates</h2>
        <ul>
          {brewDates.map((brew) => (
            <li key={brew.beerName + brew.startDate.toISOString()}>
              {brew.beerName} – {brew.startDate.toLocaleDateString()}
              {brew.assignedFermenter && (
                <> – {brew.assignedFermenter}</>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <main className="schedule-main">
        <section>
          <h2>{dayOfWeek}'s Tasks</h2>
          <ul>
            {todayTasks.map((task) => (
              <li key={task.id}>
                {task.beerName}: {task.taskName}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>This Week’s Tasks</h2>
          <ul>
            {weekTasks.map((task) => (
              <li key={task.id}>
                {task.beerName}: {task.taskName} on{" "}
                {task.scheduledDate.toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Schedule;
