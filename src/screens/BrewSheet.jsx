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
    actualHopWeights,
    vorlaufData,
    runoffData,
    preBoil,
    finalOG,
    notes,
    efficiencies,
    salts,
    mashPH,
    strikeTemp,
    spargeTemp,
    setInitialGrainWeights,
    setInitialHopWeights,
    setInitialSalts,
    updateGrainWeight,
    updateHopWeight,
    updateSalt,
    updateField,
    updateRow,
    addRow,
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
            setInitialHopWeights(recipeData.hopAdditions);
            setInitialSalts(recipeData.salts || []);
          }
        }
      }
    };
    fetchData();
  }, [id, setInitialGrainWeights, setInitialHopWeights, setInitialSalts]);

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
  <table>
    <thead>
      <tr>
        <th>Grain</th>
        <th>Target Weight (lbs)</th>
        <th>% of Grist</th>
        <th>Actual Weight (lbs)</th>
      </tr>
    </thead>
    <tbody>
      {(recipe.grainBill || []).map((grain, i) => {
        const totalWeight = recipe.grainBill.reduce(
          (sum, g) => sum + parseFloat(g.weightLbs || 0),
          0
        );
        const percent = totalWeight
          ? ((grain.weightLbs / totalWeight) * 100).toFixed(1)
          : "—";

        return (
          <tr key={i}>
            <td>{grain.grainId}</td>
            <td>{grain.weightLbs}</td>
            <td>{percent}%</td>
            <td>
              <input
                type="number"
                step="0.01"
                placeholder="lbs"
                className="compact-input"
                value={actualGrainWeights[i] || ""}
                onChange={(e) =>
                  updateGrainWeight(i, e.target.value, id)
                }
              />
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</section>


      <section className="hop-section">
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
                  <input
                    type="number"
                    step="0.01"
                    placeholder="lbs"
                    className="compact-input"
                    value={actualHopWeights[index] || ""}
                    onChange={(e) => updateHopWeight(index, e.target.value, id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      
  <section className="salt-section">
  <h2>Salt Additions</h2>
  <table>
    <thead>
      <tr>
        <th>Salt</th>
        <th>Corrects</th>
        <th>Total Grams</th>
      </tr>
    </thead>
    <tbody>
      {(recipe.saltRecommendations || []).map((salt, i) => (
        <tr key={i}>
          <td>{salt.salt}</td>
          <td>{salt.corrects}</td>
          <td>{salt.totalGrams}</td>
        </tr>
      ))}
    </tbody>
  </table>
</section>
<section className="water-chemistry-section">
  <h2>Water Chemistry Profile</h2>
  {recipe?.targetWaterProfile ? (
    <table>
      <thead>
        <tr>
          <th>Profile</th>
          <th>pH</th>
          <th>Calcium (Ca⁺⁺)</th>
          <th>Magnesium (Mg⁺⁺)</th>
          <th>Sodium (Na⁺)</th>
          <th>Chloride (Cl⁻)</th>
          <th>Sulfate (SO₄²⁻)</th>
          <th>Bicarbonate (HCO₃⁻)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{recipe.targetWaterProfile.profileName || "—"}</td>
          <td>{recipe.targetWaterProfile.ph ?? "—"}</td>
          <td>{recipe.targetWaterProfile.calcium ?? "—"}</td>
          <td>{recipe.targetWaterProfile.magnesium ?? "—"}</td>
          <td>{recipe.targetWaterProfile.sodium ?? "—"}</td>
          <td>{recipe.targetWaterProfile.chloride ?? "—"}</td>
          <td>{recipe.targetWaterProfile.sulfate ?? "—"}</td>
          <td>{recipe.targetWaterProfile.bicarbonate ?? "—"}</td>
        </tr>
      </tbody>
    </table>
  ) : (
    <p>No water profile data available.</p>
  )}
</section>



      <section className="MashIn-section">
        <h2>Mash In</h2>
        <label>
          Mash pH Target:
          <input
            type="text"
            value={mashPH || ""}
            onChange={(e) => updateField("mashPH", e.target.value)}
          />
        </label>
        <label>
          Strike Temp (°F):
          <input
            type="text"
            value={strikeTemp || ""}
            onChange={(e) => updateField("strikeTemp", e.target.value)}
          />
        </label>
        <label>
          Sparge Temp (°F):
          <input
            type="text"
            value={spargeTemp || ""}
            onChange={(e) => updateField("spargeTemp", e.target.value)}
          />
        </label>
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

      <section className="efficiency-section">
        <h2>Efficiencies</h2>
        <label>
          Mash Efficiency:
          <input
            type="number"
            placeholder="%"
            value={efficiencies?.mash || ""}
            onChange={(e) =>
              updateField("efficiencies", {
                ...efficiencies,
                mash: e.target.value,
              })
            }
          />
        </label>
        <label>
          Brewhouse Efficiency:
          <input
            type="number"
            placeholder="%"
            value={efficiencies?.brewhouse || ""}
            onChange={(e) =>
              updateField("efficiencies", {
                ...efficiencies,
                brewhouse: e.target.value,
              })
            }
          />
        </label>
      </section>
    </div>
  );
}

export default BrewSheet;
