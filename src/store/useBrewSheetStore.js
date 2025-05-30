// src/stores/useBrewSheetStore.js
import { useState } from "react";

export function useBrewSheetStore(initialRecipe = {}) {
  const [actualGrainWeights, setActualGrainWeights] = useState(
    () => (initialRecipe.grainBill || []).map(() => "")
  );

  const updateGrainWeight = (index, value) => {
    const updated = [...actualGrainWeights];
    updated[index] = value;
    setActualGrainWeights(updated);
  };

  return {
    actualGrainWeights,
    updateGrainWeight,
  };
}
