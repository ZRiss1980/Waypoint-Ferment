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
import { archiveTask } from "../archiveTask";
import { applyScheduleUpdates } from "../lib/scheduler/applyScheduleUpdates.js";

function Schedule() {
  const navigate = useNavigate();
  const [todayTasks, setTodayTasks] = useState([]);
  const [weekTasks, setWeekTasks] = useState([]);
  const [brewDates, setBrewDates] = useState([]);
  const [fermenters, setFermenters] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState({});
  const [checkedTasks, setCheckedTasks] = useState({});

  const handleRunScheduler = async () => {
    try {
      const result = await applyScheduleUpdates();
      alert(`✅ Scheduler assigned ${result.length} plans.`);
      window.location.reload();
    } catch (err) {
      console.error("🔥 Scheduler error:", err);
      alert("❌ Scheduler failed. Check console for details.");
    }
  };

  useEffect(() => {
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

      const fetchedFermenters = fermentersSnap.docs.map((doc) => ({
        firestoreId: doc.id,
        id: doc.data().id || doc.id,
      }));
      setFermenters(fetchedFermenters);

      const plans = plansSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const tasksForToday = [];
      const tasksForWeek = [];
      const brewDatesList = [];

      for (const plan of plans) {
        const planStart = new Date(plan.startDate);
        brewDatesList.push({
          id: plan.id,
          recipe: plan.recipe || null,
          beerName: plan.beerName || "Untitled",
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

  useEffect(() => {
    const fetchRecipes = async () => {
      const snapshot = await getDocs(collection(db, "recipes"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().beerName || doc.id,
      }));
      setRecipes(data);
    };
    fetchRecipes();
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
      <button className="run-scheduler-button" onClick={handleRunScheduler}>
        🧠 Run Scheduler Engine
      </button>

      <aside className="sidebar">
        <h2>{thisMonth} Brew Dates</h2>
        <ul>
          {brewDates.map((brew) => {
            const startDate = new Date(brew.startDate);
            const matchedFV = fermenters.find(
              (f) => f.id === brew.assignedFermenter
            );
            const tankName = matchedFV?.id || "unassigned";
            const hasRecipe = !!brew.recipe;

            return (
              <li className="brew-date-item">
                <div className="brew-date-details">
                  <strong className="beer-name">{brew.beerName}</strong>
                  <span className="brew-meta">
                    Brew Date: {startDate.toLocaleDateString()} – FV: {tankName}
                  </span>
                  {hasRecipe ? (
                    <button
                      className="view-button"
                      onClick={() => navigate(`/brewsheet/${brew.id}`)}
                    >
                      View Brew Sheet
                    </button>
                  ) : (
                    <div className="assign-inline">
                      <select
                        value={selectedRecipes[brew.id] || ""}
                        onChange={(e) =>
                          setSelectedRecipes((prev) => ({
                            ...prev,
                            [brew.id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">-- Select Recipe --</option>
                        {recipes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>

                      <button
                        className="view-button"
                        onClick={async () => {
                          const recipeId = selectedRecipes[brew.id];
                          if (!recipeId) return;
                          await updateDoc(doc(db, "userPlans", brew.id), {
                            recipe: recipeId,
                          });
                          window.location.reload();
                        }}
                        disabled={!selectedRecipes[brew.id]}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="schedule-main">
        <section>
          <h2>{dayOfWeek}'s Tasks</h2>
          <ul>
            {todayTasks.map((task) => (
              <li key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() => {}}
                  />
                  {task.beerName}: {task.taskName}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>This Week’s Tasks</h2>
          <ul>
            {weekTasks.map((task) => (
              <li key={task.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={checkedTasks[task.id] || false}
                    onChange={async () => {
                      setCheckedTasks((prev) => ({
                        ...prev,
                        [task.id]: true,
                      }));
                      try {
                        await archiveTask(task.planId, task.id, task);
                        setWeekTasks((prev) =>
                          prev.filter((t) => t.id !== task.id)
                        );
                      } catch (err) {
                        console.error("❌ Failed to archive:", err);
                        setCheckedTasks((prev) => ({
                          ...prev,
                          [task.id]: false,
                        }));
                      }
                    }}
                  />
                  {task.beerName}: {task.taskName} on {task.scheduledDate.toLocaleDateString()}
                </label>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default Schedule;
