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

  const brewSheetStore = useBrewSheetStore();
  const {
    actualGrainWeights,
    setInitialGrainWeights,
    updateGrainWeight,
    vorlaufData,
    runoffData,
    preBoil,
    finalOG,
    notes,
    addRow,
    updateRow,
    updateField
  } = brewSheetStore;

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
            if (recipeData.grainBill) {
              setInitialGrainWeights(recipeData.grainBill);
            }
          }
        }
      }
    };
    fetchData();
  }, [id]);

  if (!plan || !recipe) {
    return <div className="brewsheet"><p>Loading brew sheet...</p></div>;
  }

  const displayTG = typeof recipe.TG === "number" && recipe.TG !== 0 ? recipe.TG : "—";
  const srmColorHex = typeof recipe.SRMHex === "string" && recipe.SRMHex.trim() !== "" ? recipe.SRMHex : "#dddddd";

  return (
    <div className="brewsheet">
      <header className="brewsheet-header">
        <h1>{recipe.beerName} Brew Sheet</h1>
        <p>Brew Date: {new Date(plan.startDate).toLocaleDateString()}</p>
        <p>Style: {recipe.style || "—"}</p>
      </header>

      <section className="card">
        <h2>Batch Info</h2>
        <ul>
          <li>Batch Size: {recipe.batchSizeBBL} BBL</li>
          <li>Fermenter: {plan.assignedFermenter || "Unassigned"}</li>
          <li>Target OG: {recipe.OG}</li>
          <li>Target TG: {displayTG}</li>
          <li>ABV: {recipe.ABV}%</li>
          <li>SRM: {recipe.SRM} <span style={{ backgroundColor: srmColorHex, padding: "0 10px" }}></span></li>
          <li>IBU: {recipe.IBU}</li>
        </ul>
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
            <tr><th>Salt</th><th>Corrects</th><th>Total (g)</th></tr>
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
        <h2>Boil</h2>
        <h3>Hop Schedule</h3>
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
                  <input type="number" step="0.01" placeholder="lbs" className="compact-input" disabled />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <h2>Runoff Tracking</h2>
        <table>
          <thead>
            <tr>
              <th>Step</th>
              <th>Volume (gal)</th>
              <th>Gravity (°P)</th>
              <th>pH</th>
            </tr>
          </thead>
          <tbody>
            {runoffData.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td><input type="number" value={row.volume} onChange={(e) => updateRow("runoffData", index, "volume", e.target.value)} /></td>
                <td><input type="number" value={row.gravity} onChange={(e) => updateRow("runoffData", index, "gravity", e.target.value)} /></td>
                <td><input type="number" value={row.ph} onChange={(e) => updateRow("runoffData", index, "ph", e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => addRow("runoffData")}>Add Row</button>
      </section>

      <section className="card">
        <h2>Final Checks</h2>
        <p>Pre-Boil Gravity: <input type="number" value={preBoil} onChange={(e) => updateField("preBoil", e.target.value)} /></p>
        <p>Final OG: <input type="number" value={finalOG} onChange={(e) => updateField("finalOG", e.target.value)} /></p>
        <p>Notes:</p>
        <textarea value={notes} onChange={(e) => updateField("notes", e.target.value)} />
      </section>
    </div>
  );
}

export default BrewSheet;
