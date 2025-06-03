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
        <h2>Mash In</h2>

        <h3>Grain Bill</h3>
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
                <td><input type="number" step="0.01" placeholder="lbs" className="compact-input" value={actualGrainWeights[index] ?? ""}
                  onChange={(e) => updateGrainWeight(index, e.target.value, plan?.id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h4>Vorlauf</h4>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>°P</th>
              <th>pH</th>
            </tr>
          </thead>
          <tbody>
            {vorlaufData.map((row, index) => (
              <tr key={index}>
                <td><input type="text" value={row.time} onChange={(e) => updateRow("vorlauf", index, "time", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.gravity} onChange={(e) => updateRow("vorlauf", index, "gravity", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.pH} onChange={(e) => updateRow("vorlauf", index, "pH", e.target.value)} className="compact-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={() => addRow("vorlauf")} className="add-row-button">+ Add Row</button>
      </section>

      <section className="card">
        <h4>Run Off</h4>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>°P</th>
              <th>pH</th>
            </tr>
          </thead>
          <tbody>
            {runoffData.map((row, index) => (
              <tr key={index}>
                <td><input type="text" value={row.time} onChange={(e) => updateRow("runoff", index, "time", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.gravity} onChange={(e) => updateRow("runoff", index, "gravity", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.pH} onChange={(e) => updateRow("runoff", index, "pH", e.target.value)} className="compact-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={() => addRow("runoff")} className="add-row-button">+ Add Row</button>
      </section>

      <section className="card">
        <h4>PreBoil</h4>
        <table>
          <thead>
            <tr>
              <th>°P</th>
              <th>pH</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="number" step="0.01" placeholder="°P" value={preBoil.gravity} onChange={(e) => updateField("preBoil", "gravity", e.target.value)} /></td>
              <td><input type="number" step="0.01" placeholder="pH" value={preBoil.pH} onChange={(e) => updateField("preBoil", "pH", e.target.value)} /></td>
              <td><input type="number" step="0.01" placeholder="BBL" value={preBoil.volume} onChange={(e) => updateField("preBoil", "volume", e.target.value)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Knockout & Fermentation Start</h2>
        <h4>Final OG</h4>
        <table>
          <thead>
            <tr>
              <th>°P</th>
              <th>pH</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="number" step="0.01" placeholder="°P" value={finalOG.gravity} onChange={(e) => updateField("finalOG", "gravity", e.target.value)} /></td>
              <td><input type="number" step="0.01" placeholder="pH" value={finalOG.pH} onChange={(e) => updateField("finalOG", "pH", e.target.value)} /></td>
              <td><input type="number" step="0.01" placeholder="BBL" value={finalOG.volume} onChange={(e) => updateField("finalOG", "volume", e.target.value)} /></td>
            </tr>
          </tbody>
        </table>
        <label>Notes:</label>
        <textarea rows={5} value={notes} onChange={(e) => updateField("notes", null, e.target.value)} placeholder="Brew notes, deviations, observations..." />
      </section>
    </div>
  );
}

export default BrewSheet;
