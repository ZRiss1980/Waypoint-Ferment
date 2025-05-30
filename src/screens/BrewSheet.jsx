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
  const [vorlaufData, setVorlaufData] = useState([]);
  const [runoffData, setRunoffData] = useState([]);
  const store = useBrewSheetStore(recipe);


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

  const handleAddRow = (type) => {
    const newRow = { time: "", gravity: "", pH: "" };
    if (type === "vorlauf") {
      setVorlaufData([...vorlaufData, newRow]);
    } else {
      setRunoffData([...runoffData, newRow]);
    }
  };

  const handleRowChange = (type, index, field, value) => {
    const data = type === "vorlauf" ? [...vorlaufData] : [...runoffData];
    data[index][field] = value;
    type === "vorlauf" ? setVorlaufData(data) : setRunoffData(data);
  };
  

  if (!plan || !recipe ) {
    return <div className="brewsheet"><p>Loading brew sheet...</p></div>;
  }

  const { actualGrainWeights, updateGrainWeight } = store;
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
                <td><input type="number" step="0.01" placeholder="lbs" className="compact-input"value={actualGrainWeights[index]}
                    onChange={(e) => updateGrainWeight(index, e.target.value)}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Strike Water</h3>
        <div className="brewsheet-row strike-water-group">
          <div className="strike-grouped">
            <label>Grain Temp (°F):</label>
            <input
              type="number"
              className="compact-input"
              value={recipe.strikeTempF || ""}
              onChange={() => {}}
              disabled
            />
            <span className="subinline">
              {recipe.strikeTempC ? `${recipe.strikeTempC} °C` : "— °C"}
            </span>
          </div>

          <div className="strike-grouped">
            <p>Strike Volume:</p>
            <span className="subinline">
              {recipe.strikeWaterVolumeL ?? "—"} L /
              {recipe.strikeWaterVolumeL
                ? ` ${(recipe.strikeWaterVolumeL / 117.3478).toFixed(2)} BBL`
                : " — BBL"}
            </span>
          </div>

          <div className="strike-grouped">
            <p>Strike Temp:</p>
            <span className="subinline">
              {recipe.strikeTempC ?? "—"} °C /
              {recipe.strikeTempC
                ? ` ${((recipe.strikeTempC * 9) / 5 + 32).toFixed(1)} °F`
                : " — °F"}
            </span>
          </div>
        </div>
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
                <td><input type="text" value={row.time} onChange={(e) => handleRowChange("vorlauf", index, "time", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.gravity} onChange={(e) => handleRowChange("vorlauf", index, "gravity", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.pH} onChange={(e) => handleRowChange("vorlauf", index, "pH", e.target.value)} className="compact-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={() => handleAddRow("vorlauf")} className="add-row-button">+ Add Row</button>
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
                <td><input type="text" value={row.time} onChange={(e) => handleRowChange("runoff", index, "time", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.gravity} onChange={(e) => handleRowChange("runoff", index, "gravity", e.target.value)} className="compact-input" /></td>
                <td><input type="number" step="0.01" value={row.pH} onChange={(e) => handleRowChange("runoff", index, "pH", e.target.value)} className="compact-input" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={() => handleAddRow("runoff")}
          className="add-row-button">
          + Add Row
        </button>

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
            <input
              type="number"
              step="0.01"
              placeholder="lbs"
              className="compact-input"
              disabled
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
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
          <td><input type="number" step="0.01" placeholder="°P" /></td>
          <td><input type="number" step="0.01" placeholder="pH" /></td>
          <td><input type="number" step="0.01" placeholder="BBL" /></td>
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
          <td><input type="number" step="0.01" placeholder="°P" /></td>
          <td><input type="number" step="0.01" placeholder="pH" /></td>
          <td><input type="number" step="0.01" placeholder="BBL" /></td>
        </tr>
      </tbody>
    </table>
  <label>Knockout Volume (gal): <input type="number" className="compact-input" disabled /></label>
  <label>Knockout Temp (°F): <input type="number" className="compact-input" disabled /></label>
  <label>O₂ Rate (L/min): <input type="number" step="0.1" className="compact-input" disabled /></label>
  <label>Pitch Temp (°F): <input type="number" className="compact-input" disabled /></label>
  <label>Pressure Ferment?: <input type="text" className="compact-input" disabled /></label>
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
  <h2>Yeast & Fermentation</h2>
  <p>Strain: {recipe.yeastStrain}</p>
  <p>Generation: {recipe.yeastGeneration}</p>
  <p>Viability: {recipe.viability}%</p>
  <p>Vitality: {recipe.vitality}%</p>
  <p>To Pitch: {recipe.yeastToPitchLbs} lbs / {recipe.yeastToPitchML} mL</p>

  <h3>Fermentation Profile</h3>
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
  <textarea placeholder="Brew notes, deviations, observations..." rows={5} defaultValue={recipe.notes || ""} />
</section>

</div>
  );
}

export default BrewSheet;





