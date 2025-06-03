import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "./BrewSheet.css";
import { useBrewSheetStore } from "../store/useBrewSheetStore";

function BrewSheet() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const {
    actualGrainWeights,
    vorlaufData,
    runoffData,
    preBoil,
    finalOG,
    notes,
    setInitialGrainWeights,
    updateGrainWeight,
    addRow,
    updateRow,
    updateField
  } = useBrewSheetStore();

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
            const recipeData = recipeSnap.data();
            setRecipe(recipeData);
            setInitialGrainWeights(recipeData.grainBill);
          }
        }
      }
    };
    fetchData();
  }, [id, setInitialGrainWeights]);

  if (!plan || !recipe) return <div>Loading...</div>;

  return (
    <div className="brewsheet">
      <header className="brewsheet-header">
        <h1>{recipe.beerName} Brew Sheet</h1>
        <p>Brew Date: {new Date(plan.startDate).toLocaleDateString()}</p>
        <p>Style: {recipe.style || "—"}</p>
      </header>

      <section className="grain-section">
        <h2>Grain Bill</h2>
        <ul>
          {recipe.grainBill.map((grain, i) => (
            <li key={i}>
              {grain.name}: {grain.amount} lbs
              <input
                type="text"
                placeholder="Actual Weight"
                value={actualGrainWeights[i] || ""}
                onChange={(e) => updateGrainWeight(i, e.target.value, id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="hop-section">
        <h2>Hop Schedule</h2>
        <ul>
          {recipe.hops && recipe.hops.map((hop, i) => (
            <li key={i}>
              {hop.name} — {hop.amount} oz — {hop.method} @ {hop.time} min — {hop.temp}°F
            </li>
          ))}
        </ul>
      </section>

      <section className="vorlauf-section">
        <h2>Vorlauf Tracking</h2>
        {vorlaufData.map((row, i) => (
          <div key={i}>
            <input
              placeholder="Volume"
              value={row.volume}
              onChange={(e) => updateRow("vorlaufData", i, "volume", e.target.value)}
            />
            <input
              placeholder="Gravity"
              value={row.gravity}
              onChange={(e) => updateRow("vorlaufData", i, "gravity", e.target.value)}
            />
            <input
              placeholder="pH"
              value={row.ph}
              onChange={(e) => updateRow("vorlaufData", i, "ph", e.target.value)}
            />
          </div>
        ))}
        <button onClick={() => addRow("vorlaufData")}>Add Vorlauf Row</button>
      </section>

      <section className="runoff-section">
        <h2>Runoff Tracking</h2>
        {runoffData.map((row, i) => (
          <div key={i}>
            <input
              placeholder="Volume"
              value={row.volume}
              onChange={(e) => updateRow("runoffData", i, "volume", e.target.value)}
            />
            <input
              placeholder="Gravity"
              value={row.gravity}
              onChange={(e) => updateRow("runoffData", i, "gravity", e.target.value)}
            />
            <input
              placeholder="pH"
              value={row.ph}
              onChange={(e) => updateRow("runoffData", i, "ph", e.target.value)}
            />
          </div>
        ))}
        <button onClick={() => addRow("runoffData")}>Add Runoff Row</button>
      </section>

      <section className="final-section">
        <h2>Final Readings</h2>
        <label>
          Pre-boil Gravity:
          <input
            value={preBoil}
            onChange={(e) => updateField("preBoil", e.target.value)}
          />
        </label>
        <label>
          Final OG:
          <input
            value={finalOG}
            onChange={(e) => updateField("finalOG", e.target.value)}
          />
        </label>
        <label>
          Notes:
          <textarea
            value={notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </label>
      </section>
    </div>
  );
}

export default BrewSheet;
