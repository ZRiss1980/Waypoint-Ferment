// /src/screens/recipe/WaterChemistry.jsx
import React, { useEffect, useState } from "react";
import useUserWaterProfiles from "../../hooks/useUserWaterProfiles";
import { useParametersStore } from "../../store/parametersStore";
import useRecipeStore from "../../store/useRecipeStore";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

import "./WaterChemistry.css";

const WaterChemistry = () => {
  console.log("WaterChemistry rendered");
  const computeSaltRecommendations = (sourceData, targetData, flavorBalance, batchSize, ions) => {
    console.log("Running salt recommendation with flavorBalance:", flavorBalance);
    if (!sourceData || !targetData) return [];

    const deltas = ions.reduce((acc, ion) => {
      const s = sourceData[ion.key];
      const t = targetData[ion.key];
      if (typeof s === "number" && typeof t === "number") {
        const d = parseFloat((t - s).toFixed(1));
        if (Math.abs(d) > 0.1) acc[ion.key] = d;
      }
      return acc;
    }, {});

    const salts = [
      {
        name: "Gypsum",
        formula: "CaSO₄",
        adds: { calcium: 61.5, sulfate: 147.4 }
      },
      {
        name: "Calcium Chloride",
        formula: "CaCl₂",
        adds: { calcium: 72, chloride: 127 }
      },
      {
        name: "Table Salt",
        formula: "NaCl",
        adds: { sodium: 103, chloride: 160 }
      },
      {
        name: "Epsom Salt",
        formula: "MgSO₄",
        adds: { magnesium: 26, sulfate: 103 }
      },
      {
        name: "Chalk",
        formula: "CaCO₃",
        adds: { calcium: 105, bicarbonate: 158 }
      },
      {
        name: "Baking Soda",
        formula: "NaHCO₃",
        adds: { sodium: 72, bicarbonate: 191 }
      },
      {
        name: "Potassium Chloride",
        formula: "KCl",
        adds: { potassium: 98, chloride: 150 }
      }
    ];

    const results = [];
    const maxRounds = 3;

    for (let i = 0; i < maxRounds; i++) {
      let bestSalt = null;
      let bestScore = 0;

      for (const salt of salts) {
        console.log("Evaluating salt:", salt.name);
        let score = 0;
        for (const ion in salt.adds) {
          if (deltas[ion] && deltas[ion] > 0) {
            let weight = 1;
            if (flavorBalance === "malty" && ion === "chloride") {
              weight = 1.5;
            } else if (flavorBalance === "bitter" && ion === "sulfate") {
              weight = 1.5;
            }
            console.log(`Ion: ${ion}, Delta: ${deltas[ion]}, Flavor balance: ${flavorBalance}, Weight applied: ${weight}`);
            score += deltas[ion] * weight;
          }
        }
        if (score > bestScore) {
          console.log("New best salt:", salt.name, "with score:", score);
          bestScore = score;
          bestSalt = salt;
        }
      }

      if (!bestSalt) break;

      const primaryIon = Object.keys(bestSalt.adds).find(
        (ion) => deltas[ion] && deltas[ion] > 0
      );

      if (!primaryIon) break;

      const gPerGal = deltas[primaryIon] / bestSalt.adds[primaryIon];

      results.push({
        salt: bestSalt.name,
        gramsPerGal: gPerGal.toFixed(2),
        corrects: Object.keys(bestSalt.adds).join(", ")
      });

      for (const ion in bestSalt.adds) {
        if (deltas[ion]) {
          deltas[ion] -= bestSalt.adds[ion] * gPerGal;
          deltas[ion] = parseFloat(deltas[ion].toFixed(1));
          if (deltas[ion] <= 0.1) delete deltas[ion];
        }
      }

      salts.splice(salts.indexOf(bestSalt), 1);
    }

    const gallons = (batchSize || 0) * 31;
    console.log("Calculating total grams with batchSize:", batchSize, "gallons:", gallons);
    return results.map((r) => ({
      salt: r.salt,
      totalGrams: (r.gramsPerGal * gallons).toFixed(1),
      corrects: r.corrects
    }));
  };

    const [flavorBalance, setFlavorBalance] = useState("balanced");
  const { setRecipeField } = useRecipeStore();
  const [saltRecommendations, setSaltRecommendations] = useState([]);
  const { profiles: userWaterProfiles } = useUserWaterProfiles();
  const { parameters, setParameters } = useParametersStore();
  const [sources, setSources] = useState([]);
  const [targets, setTargets] = useState([]); // will load from helper DB later
  const [sourceData, setSourceData] = useState(null);
  const [targetData, setTargetData] = useState(null);

  useEffect(() => {
    setSources(userWaterProfiles);
  }, [userWaterProfiles]);

  useEffect(() => {
    if (sourceData && targetData) {
      const results = computeSaltRecommendations(sourceData, targetData, flavorBalance, parameters.batchSize, ions);
      setSaltRecommendations([...results]);
      setRecipeField("saltRecommendations", results);
      console.log("Salt Recommendations after set:", saltRecommendations);
    }
  }, [sourceData, targetData, flavorBalance, parameters.batchSize]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const targetSnap = await getDocs(collection(db, "waterProfiles"));
      const targetResults = targetSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTargets(targetResults);
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    console.log('parameters.desiredTargetWaterProfile:', parameters.desiredTargetWaterProfile);
    console.log('Available sources:', sources);
    console.log('Available targets:', targets);

    if (parameters.waterSource) {
      const match = sources.find((s) => s.id === parameters.waterSource);
      if (match) {
        setSourceData(match);
        setRecipeField("waterSourceProfile", match);
      }
    }
    if (parameters.desiredTargetWaterProfile) {
      console.log('Searching for targetData match with ID:', parameters.desiredTargetWaterProfile);
      const match = targets.find((t) => t.id === parameters.desiredTargetWaterProfile);
      console.log('Match found:', match);
      if (match) {
        setTargetData(match);
        setRecipeField("targetWaterProfile", match);
      }
    }
  }, [parameters.waterSource, parameters.desiredTargetWaterProfile, sources, targets]);

  const ions = [
    { label: "Calcium (Ca⁺⁺)", key: "calcium" },
    { label: "Magnesium (Mg⁺⁺)", key: "magnesium" },
    { label: "Sodium (Na⁺)", key: "sodium" },
    { label: "Chloride (Cl⁻)", key: "chloride" },
    { label: "Sulfate (SO₄⁻⁻)", key: "sulfate" },
    { label: "Bicarbonate (HCO₃⁻)", key: "bicarbonate" },
    { label: "pH", key: "ph" }
  ];

  const renderIonRow = (ion) => {
    const source = sourceData?.[ion.key] ?? "-";
    const target = targetData?.[ion.key] ?? "-";
    const delta =
      typeof source === "number" && typeof target === "number"
        ? (target - source).toFixed(1)
        : "-";
    return (
      <tr key={ion.key}>
        <td>{ion.label}</td>
        <td>{source}</td>
        <td>{target}</td>
        <td>{delta}</td>
      </tr>
    );
  };

  return (
    <div className="water-chemistry">
      <h2>Water Chemistry</h2>

      <div className="water-summary">
        {sourceData ? (
          <p><strong>Source Water:</strong> {sourceData.profileName}</p>
        ) : (
          <p className="warning">⚠️ No source water selected. Go to Parameters to set one.</p>
        )}
        {targetData ? (
          <p><strong>Target Water Profile:</strong> {targetData.profileName || targetData.id}</p>
        ) : (
          <p className="warning">⚠️ No target profile selected. Go to Parameters to set one.</p>
        )}
      </div>

      <table className="water-deltas">
        <thead>
          <tr>
            <th>Ion</th>
            <th>Source</th>
            <th>Target</th>
            <th>Delta</th>
          </tr>
        </thead>
        <tbody>{ions.map(renderIonRow)}</tbody>
      </table>

      <h3>Salt Recommendations</h3>
      <label style={{ display: 'block', margin: '10px 0' }}>
        Flavor Emphasis:
        <select value={flavorBalance} onChange={(e) => {
          const newValue = e.target.value;
          console.log("Flavor balance changed to:", newValue);
          setFlavorBalance(newValue);
          setRecipeField("flavorBalance", newValue);
        }}>
          <option value="balanced">Balanced</option>
          <option value="malty">Malty (favor chloride)</option>
          <option value="bitter">Dry/Bitter (favor sulfate)</option>
        </select>
      </label>
      <table className="salt-recommendation-table">
        <thead>
          <tr>
            <th>Salt</th>
            <th>Total Grams</th>
            <th>Corrects</th>
          </tr>
        </thead>
        <tbody>
          {saltRecommendations.map((r) => (
            <tr key={r.salt + "_iterative"}>
              <td>{r.salt}</td>
              <td>{r.totalGrams}</td>
              <td>{r.corrects}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WaterChemistry;
