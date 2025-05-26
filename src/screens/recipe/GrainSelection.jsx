// /src/screens/recipe/GrainSelection.jsx
import React, { useMemo, useEffect } from "react";
import useGrainTypes from "../../hooks/useGrainTypes";
import useRecipeStore from "../../store/useRecipeStore";
import "./GrainSelection.css";

const GrainSelection = () => {
  const { grains, loading, error } = useGrainTypes();
  const recipe = useRecipeStore((s) => s.recipe);
  const setGrainBill = useRecipeStore((s) => s.setGrainBill);
  const setRecipeField = useRecipeStore((s) => s.setRecipeField);

  const grainBill = recipe.grainBill || [];

  const batchSizeBBL = recipe.batchSizeBBL || 15;
  const mashEfficiency = recipe.mashEfficiency || 0.85;
  const OG = recipe.OG || 12;

  const handleGrainChange = (id, field, value) => {
    const updated = grainBill.map((row) => {
      if (row.id !== id) return row;
      return {
        ...row,
        [field]: field === "percent" ? parseFloat(value) || 0 : value
      };
    });
    setGrainBill(updated);
  };

  const handleAddGrain = () => {
    const newGrain = {
      id: crypto.randomUUID(),
      grainId: "",
      percent: 0,
      weightLbs: 0
    };
    setGrainBill([...grainBill, newGrain]);
  };

  const handleRemoveGrain = (id) => {
    setGrainBill(grainBill.filter((g) => g.id !== id));
  };

  const totalPercent = useMemo(() => {
    return grainBill.reduce((sum, g) => sum + (g.percent || 0), 0);
  }, [grainBill]);

  const isValid = totalPercent === 100;

  const calculated = useMemo(() => {
    if (!isValid) return { rows: [], totalWeight: null, srm: null };

    const sg = 1 + OG / (258.6 - OG / 258.2);
    const gp = (sg - 1) * 1000;
    const volumeGal = batchSizeBBL * 31;
    const totalGravityPoints = volumeGal * gp;
    const ppg = 37;
    const totalGristWeightLbs = totalGravityPoints / (ppg * mashEfficiency);

    let srmNumerator = 0;

    const rows = grainBill.map((g) => {
      const grain = grains.find((gr) => gr.id === g.grainId);
      if (!grain) return { ...g, weightLbs: 0 };

      const weight = (g.percent / 100) * totalGristWeightLbs;
      const color = parseFloat(grain.Lovibond);
      if (!isNaN(color)) {
        srmNumerator += weight * color;
      }

      return { ...g, weightLbs: weight };
    });

    const mcu = srmNumerator / volumeGal;
    const estimatedSRM = +(1.4922 * Math.pow(mcu, 0.6859)).toFixed(1);

    return {
      rows,
      totalWeight: +totalGristWeightLbs.toFixed(2),
      srm: estimatedSRM || "-"
    };
  }, [grainBill, isValid, grains, batchSizeBBL, mashEfficiency, OG]);

  useEffect(() => {
    if (!isValid) return;

    const withWeights = calculated.rows.map((row) => ({
      ...row,
      weightLbs: row.weightLbs || 0
    }));

    const isDifferent = withWeights.some((row, idx) => {
      const current = grainBill[idx];
      return (
        current &&
        (current.weightLbs ?? 0).toFixed(2) !==
          (row.weightLbs ?? 0).toFixed(2)
      );
    });

    if (isDifferent) {
      setGrainBill(withWeights);
    }

    // ✅ Save calculated SRM + total grist weight to recipe object
    setRecipeField("SRM", calculated.srm);
    setRecipeField("totalGristWeightLbs", calculated.totalWeight);
  }, [isValid, calculated.rows, calculated.srm, calculated.totalWeight, grainBill, setGrainBill, setRecipeField]);

  if (loading) return <div className="grain-loader">Loading grain DB...</div>;
  if (error)
    return (
      <div className="grain-loader error">
        Error loading grains: {error.message}
      </div>
    );

  return (
    <div className="grain-selection">
      <h2>Grain Bill</h2>

      <table className="grain-table">
        <thead>
          <tr>
            <th className="grain-col">Grain</th>
            <th className="percent-col">%</th>
            <th className="weight-col">Weight (lbs)</th>
            <th className="remove-col"></th>
          </tr>
        </thead>
        <tbody>
          {grainBill.map((row) => (
            <tr key={row.id}>
              <td className="grain-col">
                <select
                  value={row.grainId}
                  onChange={(e) =>
                    handleGrainChange(row.id, "grainId", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {grains.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="percent-col">
                <input
                  type="number"
                  value={row.percent}
                  onChange={(e) =>
                    handleGrainChange(row.id, "percent", e.target.value)
                  }
                />
              </td>
              <td className="weight-col">
                {isValid && row.weightLbs
                  ? row.weightLbs.toFixed(2)
                  : "-"}
              </td>
              <td className="remove-col">
                <button onClick={() => handleRemoveGrain(row.id)}>✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleAddGrain}>+ Add Grain</button>

      <div className="grain-summary">
        <p>
          <strong>Total %:</strong> {totalPercent}%
        </p>
        {isValid ? (
          <>
            <p>
              <strong>Total Grist Weight:</strong> {calculated.totalWeight} lbs
            </p>
            <p>
              <strong>Estimated SRM:</strong> {calculated.srm}
            </p>
            <p>
              <strong>Target SRM:</strong> {recipe.SRM || "-"}
            </p>
          </>
        ) : (
          <p className="warning">
            ⚠️ Grain percentages must total 100% before calculation.
          </p>
        )}
      </div>
    </div>
  );
};

export default GrainSelection;
