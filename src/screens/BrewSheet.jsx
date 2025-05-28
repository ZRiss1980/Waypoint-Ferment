// /src/screens/BrewSheet.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./BrewSheet.css";

function BrewSheet() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const planRef = doc(db, "userPlans", id);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        const planData = planSnap.data();
        setPlan(planData);

        if (planData.recipe) {
          const recipeRef = doc(db, "recipes", planData.recipe);
          const recipeSnap = await getDoc(recipeRef);
          if (recipeSnap.exists()) {
            setRecipe(recipeSnap.data());
          }
        }
      }
    };
    fetchData();
  }, [id]);

  if (!plan || !recipe) {
    return <div className="brewsheet"><p>Loading brew sheet...</p></div>;
  }

  return (
    <div className="brewsheet">
      <header className="brewsheet-header">
        <h1>{recipe.beerName} Brew Sheet</h1>
        <p>
          Style: {recipe.style || "Unknown"} — Batch Date: {new Date(plan.startDate).toLocaleDateString()}
        </p>
      </header>

      <section className="card">
        <h2>Batch Info</h2>
        <ul>
          <li>Batch Size: {plan.batchSize || "?"} BBL</li>
          <li>Fermenter: {plan.assignedFermenter || "Unassigned"}</li>
          <li>Target OG: {recipe.OG || "?"}</li>
          <li>Target TG: {recipe.TG || "?"}</li>
          <li>ABV: {recipe.targetABV || "?"}%</li>
          <li>SRM: {recipe.SRM || "?"}</li>
          <li>IBU: {recipe.targetIBU || "?"}</li>
          <li>Yeast Gen: {recipe.yeastGeneration || "?"}</li>
        </ul>
      </section>

      <section className="card">
        <h2>Grain Bill</h2>
        <table>
          <thead>
            <tr>
              <th>Malt</th>
              <th>Target (lbs)</th>
              <th>Actual (lbs)</th>
              <th>SRM</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.grainBill || []).map((grain, index) => (
              <tr key={index}>
                <td>{grain.name}</td>
                <td>{grain.targetLbs}</td>
                <td>{grain.actualLbs || "-"}</td>
                <td>{grain.srm || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Hop Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Hop</th>
              <th>Method</th>
              <th>Time / Temp</th>
              <th>Target lbs/BBL</th>
              <th>Actual lbs/BBL</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.hops || []).map((hop, index) => (
              <tr key={index}>
                <td>{hop.name}</td>
                <td>{hop.method}</td>
                <td>{hop.time || hop.temp}</td>
                <td>{hop.targetLbsPerBBL}</td>
                <td>{hop.actualLbsPerBBL || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Water Chemistry</h2>
        <p>Strike Volume: {recipe.strikeVolume || "?"} gal</p>
        <p>Mash pH Target: {recipe.mashPHTarget || "?"}</p>
        <p>Calcium: {recipe.calcium || "?"} ppm</p>
        <p>Chloride: {recipe.chloride || "?"} ppm</p>
        <p>Sulfate: {recipe.sulfate || "?"} ppm</p>
      </section>

      <section className="card">
        <h2>Gravity / pH Tracking</h2>
        <p>(Tracking UI coming soon...)</p>
      </section>

      <section className="card">
        <h2>Yeast Info</h2>
        <p>Strain: {recipe.yeastStrain || "?"}</p>
        <p>Generation: {recipe.yeastGeneration || "?"}</p>
      </section>

      <section className="card">
        <h2>Notes</h2>
        <textarea placeholder="Brew notes, deviations, observations..." rows={5} />
      </section>
    </div>
  );
}

export default BrewSheet;
