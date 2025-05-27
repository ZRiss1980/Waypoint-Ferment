import React, { useEffect, useState } from "react";
import { useFermenters } from "../hooks/useFermenters";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Home.css";

const calculateStartDate = (dueDateStr, fermentationType) => {
  if (!dueDateStr) return null;
  const dueDate = new Date(dueDateStr);
  let offsetDays = 0;
  switch (fermentationType) {
    case "ale": return new Date(dueDate.getTime() - 14 * 86400000);
    case "ale-hybrid": return new Date(dueDate.getTime() - 21 * 86400000);
    case "lager-hybrid": return new Date(dueDate.getTime() - 42 * 86400000);
    case "lager": return new Date(dueDate.getTime() - 56 * 86400000);
    default: return new Date(dueDate.getTime() - 14 * 86400000);
  }
};

function Home() {
  const navigate = useNavigate();
  const { fermenters, loading, error } = useFermenters();
  const [thisMonthsBrews, setThisMonthsBrews] = useState([]);

  useEffect(() => {
    const fetchBrewPlans = async () => {
      const snapshot = await getDocs(collection(db, "userPlans"));
      const plans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const brewsThisMonth = plans
        .map((plan) => {
          const startDate = calculateStartDate(plan.eventDueDate, plan.fermentationType);
          return {
            beerName: plan.beerName,
            startDate
          };
        })
        .filter(
          (brew) =>
            brew.startDate &&
            brew.startDate >= startOfMonth &&
            brew.startDate <= endOfMonth
        )
        .sort((a, b) => a.startDate - b.startDate);

      setThisMonthsBrews(brewsThisMonth);
    };

    fetchBrewPlans();
  }, []);

  const handleNewRecipe = () => navigate("/recipe/parameters");

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
            {thisMonthsBrews.length === 0 ? (
              <li>No brews scheduled this month</li>
            ) : (
              thisMonthsBrews.map((brew) => (
                <li key={brew.beerName + brew.startDate.toISOString()}>
                  {brew.beerName} – Brew Day {brew.startDate.toLocaleDateString()}
                </li>
              ))
            )}
          </ul>
        </section>

        {/* other sections unchanged */}
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
