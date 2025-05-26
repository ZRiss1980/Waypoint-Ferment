// NEW FILE BASED ON OVERHAUL PLAN
import React, { useMemo, useEffect } from "react";
import { useHopTypes } from "../../hooks/useHopTypes";
import useRecipeStore from "../../store/useRecipeStore";
import { useParametersStore } from "../../store/parametersStore";
import "./HopSelection.css";

const blankHop = (method) => ({
  name: "",
  method,
  time: "",
  temp: "",
  bitPerc: 0,
  flavPerc: 0,
  aromaPerc: 0,
  alphaOverride: "",
  totalWeightLbs: 0,
  lbsPerBBL: 0
});

const HopSelection = () => {
  const hopTypes = useHopTypes();
  const recipe = useRecipeStore((s) => s.recipe);
  const setHopAdditions = useRecipeStore((s) => s.setHopAdditions);
  const parameters = useParametersStore((s) => s.parameters);

  const additions = recipe.hopAdditions || [];
  const batchSizeBBL = recipe.batchSizeBBL || 15;
  const OG = recipe.OG || 12;
  const targetIBU = recipe.IBU || 25;
  const flavorOilTarget = parameters.flavorOilLoad || 0.3;
  const aromaOilTarget = parameters.aromaOilLoad || 0.4;

  const splitAdditions = {
    Boil: additions.filter((h) => h.method === "Boil"),
    Whirlpool: additions.filter((h) => h.method === "Whirlpool"),
    DryHop: additions.filter((h) => ["Active Dry Hop", "Terminal Dry Hop"].includes(h.method))
  };

  const updateHop = (index, key, value, method) => {
    const filteredList = splitAdditions[method];
    const globalIndex = additions.findIndex((h) => h === filteredList[index]);
    const updated = [...additions];

    const hop = {
      ...updated[globalIndex],
      [key]: key.includes("Perc") ? parseFloat(value) || 0 : value
    };

    hop.totalWeightLbs = parseFloat(calculateWeight(hop).toFixed(2));
    updated[globalIndex] = hop;
    setHopAdditions(updated);
  };

  const addHop = (method) => {
    setHopAdditions([...additions, blankHop(method)]);
  };

  const removeHop = (hopToRemove) => {
    const updated = additions.filter((hop) => hop !== hopToRemove);
    setHopAdditions(updated);
  };

  const calculateWeight = (hop) => {
    const hopMeta = hopTypes.find((h) => h.name === hop.name);
    if (!hopMeta) return 0;

    const alphaFrac = parseFloat(hop.alphaOverride) || hopMeta.alphaAcidAvg / 100 || 0.10;
    const totalOil = hopMeta.totalOil_mLPer100g || 1.5;
    const galPerBBL = 31;
    const ozPerLb = 16;
    const ibuConst = 7490;
    const gravity = 1 + OG / (258.6 - OG / 258.2);
    const boilTime = parseFloat(hop.time) || 60;
    const time = parseFloat(hop.time) || 20;
    const temp = parseFloat(hop.temp) || 150;
    const survival = calculateSurvivalFactor(hop.method, temp, time);

    if (hop.method === "Boil") {
      const bitShare = hop.bitPerc / 100 || 0;
      const bigness = 1.65 * Math.pow(0.000125, gravity - 1);
      const timeFactor = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
      const utilization = bigness * timeFactor;
      const ibuShare = targetIBU * bitShare;
      const lbsPerBBL = ibuShare * galPerBBL / (alphaFrac * utilization * ibuConst * ozPerLb);
      return lbsPerBBL * batchSizeBBL;
    }

    if (hop.method === "Whirlpool") {
      const flavShare = hop.flavPerc / 100;
      const aromaShare = hop.aromaPerc / 100;
      const oilPerGram = (totalOil * survival) / 100;
      const flavGrams = flavorOilTarget / (oilPerGram * flavShare || 1);
      const aromaGrams = aromaOilTarget / (oilPerGram * aromaShare || 1);
      const totalGrams = (flavGrams + aromaGrams) * batchSizeBBL;
      return totalGrams / 453.592;
    }

    if (["Active Dry Hop", "Terminal Dry Hop"].includes(hop.method)) {
      return (parseFloat(hop.lbsPerBBL) || 0) * batchSizeBBL;
    }

    return 0;
  };

  const calculateSurvivalFactor = (method, temp, time) => {
    let base = method === "Whirlpool" ? 0.15 : method.includes("Dry") ? 0.6 : 0.02;
    if (method === "Whirlpool" && temp > 170) {
      base *= Math.exp(-0.03 * (temp - 170)) * Math.exp(-0.03 * time);
    }
    return base;
  };

  const renderTable = (label, hops, methodKey) => (
    <div className="hop-table-section">
      <h3>{label}</h3>
      <table className="hop-table">
        <thead>
          <tr>
            <th>Hop</th>
            <th>Time</th>
            {methodKey === "Whirlpool" && <th>Temp</th>}
            {methodKey === "Boil" && <th>IBU%</th>}
            {methodKey === "Whirlpool" && <>
              <th>Flav%</th>
              <th>Aroma%</th>
            </>}
            {methodKey === "DryHop" && <th>lbs/BBL</th>}
            <th>AA%</th>
            <th>Total (lbs)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {hops.map((hop, i) => (
            <tr key={i}>
              <td>
                <select value={hop.name} onChange={(e) => updateHop(i, "name", e.target.value, methodKey)}>
                  <option value="">Select</option>
                  {hopTypes.map((h) => (
                    <option key={h.name} value={h.name}>{h.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input type="text" value={hop.time} onChange={(e) => updateHop(i, "time", e.target.value, methodKey)} />
              </td>
              {methodKey === "Whirlpool" && (
                <td>
                  <input type="text" value={hop.temp} onChange={(e) => updateHop(i, "temp", e.target.value, methodKey)} />
                </td>
              )}
              {methodKey === "Boil" && (
                <td>
                  <input type="number" value={hop.bitPerc} onChange={(e) => updateHop(i, "bitPerc", e.target.value, methodKey)} />
                </td>
              )}
              {methodKey === "Whirlpool" && (
                <>
                  <td>
                    <input type="number" value={hop.flavPerc} onChange={(e) => updateHop(i, "flavPerc", e.target.value, methodKey)} />
                  </td>
                  <td>
                    <input type="number" value={hop.aromaPerc} onChange={(e) => updateHop(i, "aromaPerc", e.target.value, methodKey)} />
                  </td>
                </>
              )}
              {methodKey === "DryHop" && (
                <td>
                  <input type="number" step="0.1" value={hop.lbsPerBBL || ""} onChange={(e) => updateHop(i, "lbsPerBBL", e.target.value, methodKey)} />
                </td>
              )}
              <td>
                <input type="number" step="0.1" value={hop.alphaOverride || ""} onChange={(e) => updateHop(i, "alphaOverride", e.target.value, methodKey)} />
              </td>
              <td>{calculateWeight(hop).toFixed(2)}</td>
              <td><button onClick={() => removeHop(hop)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-hop-btn" onClick={() => addHop(label === "Boil Hops" ? "Boil" : label === "Whirlpool Hops" ? "Whirlpool" : "Active Dry Hop")}>
        + Add Hop
      </button>
    </div>
  );

  return (
    <div className="hop-selection-container">
      <h2>Hop Additions</h2>
      {renderTable("Boil Hops", splitAdditions.Boil, "Boil")}
      {renderTable("Whirlpool Hops", splitAdditions.Whirlpool, "Whirlpool")}
      {renderTable("Dry Hop Additions", splitAdditions.DryHop, "DryHop")}
    </div>
  );
};

export default HopSelection;
