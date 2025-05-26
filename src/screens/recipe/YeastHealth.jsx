// /src/screens/yeast/YeastHealthScreen.jsx
import React, { useState, useEffect } from 'react';
import useRecipeStore from "../../store/useRecipeStore";
import "./YeastHealthScreen.css";

const YeastHealthScreen = () => {
  const { setRecipeField, recipe } = useRecipeStore();
  const [cellCount, setCellCount] = useState(0);
  const [viability, setViability] = useState(100);
  const [vitality, setVitality] = useState(100);
  const [isLager, setIsLager] = useState(false);
  const [hoseLength, setHoseLength] = useState(0);
  const [hoseDiameter, setHoseDiameter] = useState(0);

  const batchSize = recipe.batchSizeBBL || 15;
  const gravity = recipe.OG || 12;
  const expectedTG = recipe.expectedTG || "";

  const alePitchRate = 0.75e9;
  const lagerPitchRate = 1.5e9;
  const standardPitchRate = isLager ? lagerPitchRate : alePitchRate;

  const gramsPerML = 1.1;
  const gramsToLbs = 0.00220462;
  const litersPerBBL = 117.348;

  const adjustedCellCount = (cellCount > 0 && viability > 0 && vitality > 0)
    ? cellCount * (viability / 100) * (vitality / 100)
    : 0;

  const cellsPerML = gravity * standardPitchRate;
  const wortVolumeL = batchSize * litersPerBBL;
  const totalCellsNeeded = wortVolumeL * cellsPerML;
  const yeastToPitchML = adjustedCellCount > 0 ? totalCellsNeeded / adjustedCellCount : 0;
  const yeastToPitchGrams = yeastToPitchML * gramsPerML;
  const yeastToPitchLbs = (yeastToPitchGrams * gramsToLbs).toFixed(2);

  useEffect(() => {
    setRecipeField("cellCount", cellCount);
    setRecipeField("viability", viability);
    setRecipeField("vitality", vitality);
    setRecipeField("isLager", isLager);
    setRecipeField("hoseLength", hoseLength);
    setRecipeField("hoseDiameter", hoseDiameter);
    setRecipeField("yeastToPitchML", yeastToPitchML);
    setRecipeField("yeastToPitchGrams", yeastToPitchGrams);
    setRecipeField("yeastToPitchLbs", parseFloat(yeastToPitchLbs));
  }, [cellCount, viability, vitality, isLager, hoseLength, hoseDiameter, yeastToPitchML, yeastToPitchGrams, yeastToPitchLbs]);

  const cellCountWarning =
    cellCount < 1e9 || cellCount > 3e9
      ? "⚠️ Expected range for yeast slurry is typically between 1e9 and 3e9 cells/mL."
      : null;

  return (
    <div className="yeast-health-screen">
      <h2>Yeast Pitch</h2>

      <div className="summary-section">
        <p><strong>Batch Size:</strong> {batchSize} BBL</p>
        <p><strong>OG:</strong> {gravity} °P</p>
        <p><strong>Expected TG:</strong> {expectedTG} °P</p>
      </div>

      <div className="input-section">
        <label>
          Cell Count (cells/ml):
          <input
            type="number"
            value={cellCount || ""}
            onChange={(e) => setCellCount(parseFloat(e.target.value) || 0)}
          />
          <small style={{ color: "#c00", display: "block", marginTop: "4px" }}>{cellCountWarning}</small>
        </label>
        <label>
          Viability (%):
          <input
            type="number"
            value={viability || ""}
            onChange={(e) => setViability(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label>
          Vitality (%):
          <input
            type="number"
            value={vitality || ""}
            onChange={(e) => setVitality(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label>
          Lager Yeast?
          <select value={isLager} onChange={(e) => setIsLager(e.target.value === 'true')}>
            <option value="false">No (Ale)</option>
            <option value="true">Yes (Lager)</option>
          </select>
        </label>
        <label>
          Hose Length (ft):
          <input
            type="number"
            value={hoseLength || ""}
            onChange={(e) => setHoseLength(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label>
          Hose Diameter (in):
          <input
            type="number"
            value={hoseDiameter || ""}
            onChange={(e) => setHoseDiameter(parseFloat(e.target.value) || 0)}
          />
        </label>
      </div>

      <div className="results-section">
        <h3>Pitch Calculation</h3>
        {cellCount > 0 ? (
          <p><strong>Yeast to Pitch:</strong> {yeastToPitchLbs} lbs ({yeastToPitchGrams.toFixed(1)} g)</p>
        ) : (
          <p>Please enter a valid cell count to calculate pitch weight.</p>
        )}
      </div>
    </div>
  );
};

export default YeastHealthScreen;
