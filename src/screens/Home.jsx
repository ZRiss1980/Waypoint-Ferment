// /src/screens/Home.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import useGlobalSyncStore from "../store/globalSync";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const fermenters = useGlobalSyncStore((state) => state.globalFermenters);
  const [monthlyBrewPlans, setMonthlyBrewPlans] = useState([]);

  useEffect(() => {
    const fetchMonthlyPlans = async () => {
      try {
        const snapshot = await getDocs(collection(db, "userPlans"));
        const allPlans = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const plansThisMonth = allPlans.filter((plan) => {
          if (!plan.startDate) return false;
          const date = new Date(plan.startDate);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        });

        setMonthlyBrewPlans(plansThisMonth);
      } catch (err) {
        console.error("Error loading monthly brew plans:", err);
      }
    };

    fetchMonthlyPlans();
  }, []);

  const handleNewRecipe = () => {
    navigate("/recipe/parameters");
  };

  return (
    <div className="home dashboard">
      <h1>Waypoint Ferment – Mission Control</h1>
      <p className="subheading">
        This dashboard will show fermenters, BTs, the weekly schedule, tasks,
        and active brews.
      </p>

      <div className="dashboard-grid">
        <section className="card">
          <h2
            className="home-link"
            onClick={() => navigate("/schedule")}
          >
            Brew Schedule
          </h2>
          {monthlyBrewPlans.length > 0 && fermenters.length > 0 && (
            <ul>
              {monthlyBrewPlans.map((plan) => {
                const match = fermenters.find(
                  (f) => f.firestoreId === plan.assignedFermenter
                );
                const assignedFV = match?.id;

                return (
                  <li key={plan.id}>
                    {plan.beerName} – Brew Day:{" "}
                    {new Date(plan.startDate).toLocaleDateString()} – FV:{" "}
                    {assignedFV || "unassigned"}
                  </li>
                );
              })}
            </ul>
          )}
          {monthlyBrewPlans.length === 0 && (
            <li>No brews scheduled this month</li>
          )}
        </section>

        <section className="card">
          <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/tanks")}>
            Fermenters
          </h2>
          <ul>
            {fermenters.length === 0 && <li>No active fermenters</li>}
            {fermenters.map((f) => {
              const name = f.beerName || "Unknown";
              const start = new Date(f.startDate);
              const today = new Date();
              const day =
                Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
              const total = f.fermentationDaysExpected || "–";
              const statusNote =
                f.currentStatus === "cold_crash" ? " (Cold Crash)" : "";
              return (
                <li key={f.id}>
                  {`${f.id}: ${name} – Day ${day}/${total}${statusNote}`}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <h2>Recent Recipes</h2>
          <ul>
            <li>Daybreak IPA (Thiolized)</li>
            <li>Hearthdeep Brown Ale</li>
          </ul>
        </section>

        <section className="card">
          <h2>Reminders</h2>
          <ul>
            <li>BT1 due for CIP</li>
            <li>Yeast WLP300 at gen 5</li>
          </ul>
        </section>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <button onClick={handleNewRecipe}>+ New Recipe</button>
        <button disabled>+ Brew Day Checklist</button>
        <button disabled>+ Schedule Task</button>
        <button disabled>+ PM Entry</button>
      </div>
    </div>
  );
}

export default Home;
