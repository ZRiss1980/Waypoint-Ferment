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
          <li>Batch Size: {recipe.batchSizeBBL} BBL</li>
          <li>Fermenter: {plan.assignedFermenter || "Unassigned"}</li>
          <li>Target OG: {recipe.OG}</li>
          <li>Target TG: {recipe.TG}</li>
          <li>ABV: {recipe.ABV}%</li>
          <li>SRM: {recipe.SRM}</li>
          <li>IBU: {recipe.IBU}</li>
          <li>Yeast Gen: {recipe.yeastGeneration}</li>
        </ul>
      </section>

      <section className="card">
        <h2>Grain Bill</h2>
        <table>
          <thead>
            <tr>
              <th>Malt</th>
              <th>Percent</th>
              <th>Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.grainBill || []).map((grain, index) => (
              <tr key={index}>
                <td>{grain.grainId}</td>
                <td>{grain.percent}%</td>
                <td>{grain.weightLbs.toFixed(2)}</td>
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
              <th>Total Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.hopAdditions || []).map((hop, index) => (
              <tr key={index}>
                <td>{hop.name}</td>
                <td>{hop.method}</td>
                <td>{hop.time || hop.temp}</td>
                <td>{hop.totalWeightLbs || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Water Chemistry</h2>
        <p>Water Source: {recipe.waterSource}</p>
        <p>Mash pH Target: {recipe.mashPHTarget}</p>
        <p>Chloride: {recipe.targetWaterProfile?.chloride} ppm</p>
        <p>Sulfate: {recipe.targetWaterProfile?.sulfate} ppm</p>
        <p>Calcium: {recipe.targetWaterProfile?.calcium} ppm</p>
      </section>
      <section className="card">
        <h2>Salt Additions</h2>
          <table>
            <thead>
              <tr>
                <th>Salt</th>
                <th>Corrects</th>
                <th>Total (g)</th>
              </tr>
            </thead>
          <tbody>
            {(recipe.saltRecommendations || []).map((salt, index) => (
              <tr key={index}>
              <td>{salt.salt}</td>
              <td>{salt.corrects}</td>
              <td>{salt.totalGrams}</td>
          </tr>
          ))}
          </tbody>
        </table>
      </section>


      <section className="card">
        <h2>Yeast Info</h2>
        <p>Strain: {recipe.yeastStrain}</p>
        <p>Generation: {recipe.yeastGeneration}</p>
        <p>Viability: {recipe.viability}%</p>
        <p>Vitality: {recipe.vitality}%</p>
        <p>To Pitch: {recipe.yeastToPitchLbs} lbs / {recipe.yeastToPitchML} mL</p>
      </section>
      
      <section className="card">
        <h2>Fermentation Profile</h2>
        <p>Type: {recipe.isLager ? "Lager" : "Ale"}</p>
        <p>Target Temp: {recipe.fermentationTempTarget}°F</p>
        <p>Expected Days: {recipe.fermentationDaysExpected}</p>
        <p>Pressure Ferment: {recipe.pressureFerment}</p>
        <p>Final pH: {recipe.finalPH ?? "—"}</p>
      </section>

      <section className="card">
        <h2>Losses & Efficiencies</h2>
        <p>Brewhouse Efficiency: {(recipe.brewhouseEfficiency * 100).toFixed(1)}%</p>
        <p>Mash Efficiency: {(recipe.mashEfficiency * 100).toFixed(1)}%</p>
        <p>Lauter Efficiency: {(recipe.lauterEfficiency * 100).toFixed(1)}%</p>
        <p>Boil Loss: {recipe.boilLossBBL} BBL</p>
        <p>Whirlpool Loss: {recipe.whirlpoolLossBBL} BBL</p>
        <p>Knockout Loss: {recipe.knockoutLossBBL} BBL</p>
      </section>

      
      <section className="card">
        <h2>Notes</h2>
        <textarea
          placeholder="Brew notes, deviations, observations..."
          rows={5}
          defaultValue={recipe.notes || ""}
        />
      </section>
    </div>
  );
}

export default BrewSheet;
