// /src/store/useRecipeStore.js
import { create } from "zustand";

// Minimal default recipe — only parameter defaults included
const defaultRecipe = {
  // Identity
  id: "",
  uniqueId: "",
  beerName: "",
  style: "",
  flagType: "",
  styleCategory: "",
  brewDate: new Date().toISOString().slice(0, 10),

  // Batch Setup
  batchSizeBBL: 15,
  boilLossBBL: 1,
  whirlpoolLossBBL: 0.5,
  knockoutLossBBL: 0.5,
  boilTime: 90,

  // Core Parameters
  OG: 12,
  TG: 2,
  ABV: null,
  expectedTG: null,
  IBU: 25,
  SRM: null,
  attenuationAvg: null,
  finalPH: null,
  carbonationLevel: 2.4,
  tankDays: null,

  // Oil & Utilization
  kettleUtilization: 0.98,
  flavorOilLoad: 0.3,
  aromaOilLoad: 0.4,

  // Efficiency Settings
  mashEfficiency: 0.85,
  brewhouseEfficiency: 0.80,
  lauterEfficiency: 0.95,

  // Losses / Yields
  systemLossLiters: 75,
  finalWortYieldLiters: 75,

  // Mash Profile
  mashTemp: 150,
  liquorToGristRatio: 2.0,
  mashPHTarget: 5.2,
  grainAbsorptionRate: 0.5,

  // Fermentation
  fermentationTempTarget: 68,
  fermentationTempTargetC: 20,
  pressureFerment: false,
  fermentationDaysExpected: 7,
  maturationTimeDays: 3,

  // Water Profile
  waterSource: "",
  desiredTargetWaterProfile: "",

  // Yeast Info
  yeastStrain: "",
  yeastGeneration: 0,

  // TODO: hydrate from yeast DB
  // yeast: {
  //   id: "",
  //   attenuationRange: [74, 78],
  //   flocculation: "",
  //   tolerance: "",
  //   notes: ""
  // },

  // TODO: hydrate from water DB
  // waterProfile: {
  //   Ca: 0,
  //   Mg: 0,
  //   Na: 0,
  //   Cl: 0,
  //   SO4: 0,
  //   HCO3: 0
  // },

  // Ingredient Arrays
  grainBill: [],       // { grainId, percent, weightLbs }
  hopAdditions: [],    // { name, method, %, time, temp, alphaOverride, lbsPerBBL }

  // Misc
  notes: "",
  createdAt: new Date().toISOString(),
  version: "1.0.0"
};

const useRecipeStore = create((set, get) => ({
  recipe: { ...defaultRecipe },

  // Generic key update
  setRecipeField: (key, value) =>
    set((state) => ({
      recipe: {
        ...state.recipe,
        [key]: value
      }
    })),

  // Full recipe overwrite
  setRecipe: (newRecipe) => set({ recipe: { ...newRecipe } }),

  // Partial updates
  setGrainBill: (grainBill) =>
    set((state) => ({
      recipe: {
        ...state.recipe,
        grainBill
      }
    })),
  setHopAdditions: (hopAdditions) =>
    set((state) => ({
      recipe: {
        ...state.recipe,
        hopAdditions
      }
    })),

  // Wipe clean
  resetRecipe: () => set({ recipe: { ...defaultRecipe } })
}));

export default useRecipeStore;
