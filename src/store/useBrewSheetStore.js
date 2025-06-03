import { create } from "zustand";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useBrewSheetStore = create((set, get) => ({
  // Actuals state
  actualGrainWeights: [],
  actualHopWeights: [],
  vorlaufData: [],
  runoffData: [],
  salts: [],
  mashPH: "",            // Target
  actualMashPH: "",      // Actual
  strikeTemp: "",        // Target
  actualStrikeTemp: "",  // Actual
  spargeTemp: "",        // Target
  actualSpargeTemp: "",  // Actual
  efficiencies: { mash: "", brewhouse: "" },
  preBoil: "",
  finalOG: "",
  notes: "",

  // Used for routing writes
  recipeId: "",
  batchId: "",

  setRecipeAndBatch: (recipeId, batchId) => {
    set({ recipeId, batchId });
  },

  setInitialGrainWeights: (grainBill = []) => {
    const weights = grainBill.map(() => "");
    set({ actualGrainWeights: weights });
  },

  setInitialHopWeights: (hopAdditions = []) => {
    const weights = hopAdditions.map(() => "");
    set({ actualHopWeights: weights });
  },

  setInitialSalts: (saltAdditions = []) => {
    set({ salts: saltAdditions });
  },

  updateGrainWeight: (index, value) => {
    const { actualGrainWeights, recipeId, batchId } = get();
    const updated = [...actualGrainWeights];
    updated[index] = value;
    set({ actualGrainWeights: updated });
    writeActualsToFirestore({ actualGrainWeights: updated }, recipeId, batchId);
  },

  updateHopWeight: (index, value) => {
    const { actualHopWeights, recipeId, batchId } = get();
    const updated = [...actualHopWeights];
    updated[index] = value;
    set({ actualHopWeights: updated });
    writeActualsToFirestore({ actualHopWeights: updated }, recipeId, batchId);
  },

  updateSalt: (index, value) => {
    const { salts, recipeId, batchId } = get();
    const updated = [...salts];
    if (!updated[index]) return;
    updated[index].actual = value;
    set({ salts: updated });
    writeActualsToFirestore({ salts: updated }, recipeId, batchId);
  },

  updateRow: (field, index, key, value) => {
    const { recipeId, batchId } = get();
    const data = [...get()[field]];
    if (!data[index]) return;
    data[index][key] = value;
    set({ [field]: data });
    writeActualsToFirestore({ [field]: data }, recipeId, batchId);
  },

  addRow: (field) => {
    const current = [...get()[field]];
    current.push({ volume: "", gravity: "", ph: "" });
    set({ [field]: current });
  },

  updateField: (field, value) => {
    set({ [field]: value });
    const { recipeId, batchId } = get();
    writeActualsToFirestore({ [field]: value }, recipeId, batchId);
  }
}));

async function writeActualsToFirestore(data, recipeId, batchId) {
  if (!recipeId || !batchId) return;
  try {
    const ref = doc(db, `recipes/${recipeId}/actuals/${batchId}`);
    await setDoc(ref, data, { merge: true });
  } catch (err) {
    console.error("🔥 Firestore actuals write error:", err);
  }
}
