import { useEffect, useState } from "react";

export function useBrewSheetStore(recipe) {
  const [actualGrainWeights, setActualGrainWeights] = useState([]);

  useEffect(() => {
    if (recipe?.grainBill?.length) {
      setActualGrainWeights(recipe.grainBill.map(() => ""));
    }
  }, [recipe]);

  const updateGrainWeight = (index, value) => {
    setActualGrainWeights((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  return {
    actualGrainWeights,
    updateGrainWeight,
  };
}
