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

  const displayTG = recipe.TG && recipe.TG !== 0 ? recipe.TG : "—";
  const srmColorHex = recipe.SRMHex || "#dddddd";//need to add srmHex db in firestore

  return (
    <div className="brewsheet">
      <header className="brewsheet-header">
        <h1>{recipe.beerName} Brew Sheet</h1>
        <p>
          Brew Date: {new Date(plan.startDate).toLocaleDateString()}
        </p>
        <p> Style:{recipe.style || "—"}</p>
      </header>

      <section className="card">
        <h2>Batch Info</h2>
        <ul>
          <li>Batch Size: {recipe.batchSizeBBL} BBL</li>
          <li>Fermenter: {plan.assignedFermenter || "Unassigned"}</li>
          <li>Target OG: {recipe.OG}</li>
          <li>Target TG: {displayTG}</li>
          <li>ABV: {recipe.ABV}%</li>
          <li>
            SRM: {recipe.SRM} <span style={{ backgroundColor: srmColorHex, padding: "0 10px" }}></span>
          </li>
          <li>IBU: {recipe.IBU}</li>
        </ul>
      </section>

      <section className="card">
        <h2>Grain Bill</h2>
        <table>
          <thead>
            <tr>
              <th>Malt</th>
              <th>Percent</th>
              <th>Target Weight (lbs)</th>
              <th>Actual Weights (lbs)</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.grainBill || []).map((grain, index) => (
              <tr key={index}>
                <td>{grain.grainId}</td>
                <td>{grain.percent}%</td>
                <td>{grain.weightLbs.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="lbs"
                    className="compact-input"
                    onChange={() => {}}
                    disabled/>
                </td>
              </tr>

            ))}
          </tbody>
        </table>
<section className="card">
  <h4>Grist Temp</h4>
  <div className="grist-temp-row">
    <div>
      <label>Measured (°F): </label>
      <input
        type="number"
        value={recipe.gristTempF || ""}
        className="compact-input"
        onChange={() => {}}
        disabled
      />
    </div>
    <div>
      <label>Measured (°C): </label>
      <p>
        <strong>
          {recipe.gristTempF
            ? ((recipe.gristTempF - 32) * 5 / 9).toFixed(1)
            : "—"}
          °C
        </strong>
      </p>
    </div>
  </div>
</section>

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
              <th>Actual Weight (lbs)</th>
            </tr>
          </thead>
          <tbody>
            {(recipe.hopAdditions || []).map((hop, index) => (
              <tr key={index}>
                <td>{hop.name}</td>
                <td>{hop.method}</td>
                <td>{hop.time || hop.temp}</td>
                <td>{hop.totalWeightLbs || "-"}</td>
                <td>
                  <div className="weight-cell">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="lbs"
                      className="compact-input"
                      onChange={() => {}}
                      disabled/>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Strike Water</h2>
        <div className="brewsheet-row">
          <div>
            <label>Grain Temp (°F):</label>
            <input
              type="number"
              value={recipe.gristTempF || ""}
              className="compact-input"
              onChange={() => {}}
              disabled
            />
          </div>
          <div>
            <label>Grain Temp (°C):</label>
            <p><strong>{recipe.gristTempF ? ((recipe.gristTempF - 32) * 5 / 9).toFixed(1) : "—"} °C</strong></p>
          </div>
          <div>
            <label>Strike Volume (L):</label>
            <p><strong>{recipe.strikeWaterVolumeL ?? "—"} L</strong></p>
          </div>
          <div>
            <label>Strike Temp (°C):</label>
            <p><strong>{recipe.strikeTempC ?? "—"} °C</strong></p>
          </div>
          <div>
            <label>Strike Volume (BBL):</label>
            <p><strong>{recipe.strikeWaterVolumeL ? (recipe.strikeWaterVolumeL / 117.3478).toFixed(2) : "—"} BBL</strong></p>
          </div>
          <div>
            <label>Strike Temp (°F):</label>
            <p><strong>{recipe.strikeTempC ? ((recipe.strikeTempC * 9) / 5 + 32).toFixed(1) : "—"} °F</strong></p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>To Add: Vorlauf, Runoff, Gravity, Knockout</h2>
        <p>// Placeholder for future sections to be implemented</p>
      </section>

      <section className="card">
        <h2>Water Chemistry</h2>
        <p>Water Source: {recipe.waterSource}</p>
        <p>Mash pH Target: {recipe.mashPHTarget}</p>
        <p>Chloride: {recipe.targetWaterProfile?.chloride} ppm</p>
        <p>Sulfate: {recipe.targetWaterProfile?.sulfate} ppm</p>
        <p>Calcium: {recipe.targetWaterProfile?.calcium} ppm</p>
        <p>Magnesium: {recipe.targetWaterProfile?.magnesium} ppm</p>
        <p>Sodium: {recipe.targetWaterProfile?.sodium} ppm</p>
        <p>Potassium: {recipe.targetWaterProfile?.potassium} ppm</p>
        <p>Bicarbonate: {recipe.targetWaterProfile?.bicarbonate} ppm</p>
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

     