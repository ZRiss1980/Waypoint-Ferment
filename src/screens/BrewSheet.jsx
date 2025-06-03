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

  <div className="mash-field">
    <strong>Mash pH Target:</strong>{" "}
    {recipe.mashPHTarget ?? "—"}
    <input
      type="text"
      placeholder="Actual pH"
      value={mashPH || ""}
      onChange={(e) => updateField("mashPH", e.target.value)}
    />
  </div>

  <div className="mash-field">
    <strong>Liquor to Grist Ratio:</strong>{" "}
    {recipe.liquorToGristRatio ?? "—"} qt/lb
  </div>

  <div className="mash-field">
    <strong>Mash Temp Target:</strong>{" "}
    {recipe.mashTemp ?? "—"} °F
    <input
      type="text"
      placeholder="Actual Mash Temp"
      value={strikeTemp || ""}
      onChange={(e) => updateField("strikeTemp", e.target.value)}
    />
  </div>

  <div className="mash-field">
    <strong>Strike Volume (calc):</strong>{" "}
    {recipe.totalGristWeightLbs && recipe.liquorToGristRatio
      ? (recipe.totalGristWeightLbs * recipe.liquorToGristRatio).toFixed(2)
      : "—"} gal
  </div>

  <div className="mash-field">
    <strong>Strike Temp Estimate:</strong>{" "}
    {recipe.mashTemp
      ? (parseFloat(recipe.mashTemp) + 10).toFixed(1)
      : "—"} °F
    <input
      type="text"
      placeholder="Actual Strike Temp"
      value={spargeTemp || ""}
      onChange={(e) => updateField("spargeTemp", e.target.value)}
    />
  </div>
</section>


<section className="Vorlauf-section">
  <h2>Vorlauf Tracking</h2>
  <table>
    <thead>
      <tr>
        <th>Volume (L)</th>
        <th>Gravity (°P)</th>
        <th>pH</th>
      </tr>
    </thead>
    <tbody>
      {vorlaufData.map((row, index) => (
        <tr key={index}>
          <td>
            <input
              type="text"
              value={row.volume}
              onChange={(e) =>
                updateRow("vorlaufData", index, "volume", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="text"
              value={row.gravity}
              onChange={(e) =>
                updateRow("vorlaufData", index, "gravity", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="text"
              value={row.ph}
              onChange={(e) =>
                updateRow("vorlaufData", index, "ph", e.target.value)
              }
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <button onClick={() => addRow("vorlaufData")}>+ Add Row</button>
</section>

<section className="Runoff-section">
  <h2>Runoff Tracking</h2>
  <table>
    <thead>
      <tr>
        <th>Volume (L)</th>
        <th>Gravity (°P)</th>
        <th>pH</th>
      </tr>
    </thead>
    <tbody>
      {runoffData.map((row, index) => (
        <tr key={index}>
          <td>
            <input
              type="text"
              value={row.volume}
              onChange={(e) =>
                updateRow("runoffData", index, "volume", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="text"
              value={row.gravity}
              onChange={(e) =>
                updateRow("runoffData", index, "gravity", e.target.value)
              }
            />
          </td>
          <td>
            <input
              type="text"
              value={row.ph}
              onChange={(e) =>
                updateRow("runoffData", index, "ph", e.target.value)
              }
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <button onClick={() => addRow("runoffData")}>+ Add Row</button>
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
