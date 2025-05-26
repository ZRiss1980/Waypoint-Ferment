// /src/screens/Home.jsx
import React from "react";
import { useFermenters } from "../hooks/useFermenters";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { fermenters, loading, error } = useFermenters();


  

  const handleNewRecipe = () => {
    navigate("/recipe/parameters");
  };

  return (
    <div className="home dashboard">
      <h1>Waypoint Ferment – Mission Control</h1>
      <p className="subheading">
        This dashboard will show fermenters, BTs, the weekly schedule, tasks, and active brews.
      </p>

      <div className="dashboard-grid">
        <section className="card">
          <h2 className="home-link" onClick={() => navigate("/schedule")}>
            Brew Schedule
          </h2>

          <ul>
            <li>Hazy IPA – Mash-in @ 7:00 AM</li>
            <li className="alert">Saison – Transfer to BT overdue</li>
          </ul>
        </section>

        <section className="card">
          <h2 style={{ cursor: 'pointer' }} onClick={() => navigate('/tanks')}>
            Fermenters
          </h2>
          <ul>
            {loading && <li>Loading fermenters...</li>}
            {error && <li>Error loading tanks</li>}
            {!loading && fermenters.length === 0 && <li>No active fermenters</li>}
            {fermenters.map((f) => {
              const name = f.currentBatch?.beerName || "Unknown";
              const start = new Date(f.startDate);
              const today = new Date();
              const day = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
              const total = f.fermentationDaysExpected || "–";
              const statusNote = f.currentStatus === "cold_crash" ? " (Cold Crash)" : "";
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
