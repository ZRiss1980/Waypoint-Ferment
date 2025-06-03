import { create } from "zustand";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useBrewSheetStore = create((set, get) => ({
  actualGrainWeights: [],
  actualHopWeights: [],
  vorlaufData: [],
  runoffData: [],
  salts: [],
  mashPH: "",
  strikeTemp: "",
  spargeTemp: "",
  efficiencies: { mash: "", brewhouse: "" },
  preBoil: "",
  finalOG: "",
  notes: "",

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

  updateGrainWeight: async (index, value, planId) => {
    const updated = [...get().actualGrainWeights];
    updated[index] = value;
    set({ actualGrainWeights: updated });

    if (planId) {
      try {
        const planRef = doc(db, "userPlans", planId);
        await updateDoc(planRef, { actualGrainWeights: updated });
      } catch (error) {
        console.error("🔥 Firestore update error (grain):", error);
      }
    }
  },

  updateHopWeight: async (index, value, planId) => {
    const updated = [...get().actualHopWeights];
    updated[index] = value;
    set({ actualHopWeights: updated });

    if (planId) {
      try {
        const planRef = doc(db, "userPlans", planId);
        await updateDoc(planRef, { actualHopWeights: updated });
      } catch (error) {
        console.error("🔥 Firestore update error (hop):", error);
      }
    }
  },

  updateSalt: (index, value) => {
    const updated = [...get().salts];
    if (!updated[index]) return;
    updated[index].actual = value;
    set({ salts: updated });
  },

  updateRow: (field, index, key, value) => {
    const data = [...get()[field]];
    if (!data[index]) return;
    data[index][key] = value;
    set({ [field]: data });
  },

  addRow: (field) => {
    const current = [...get()[field]];
    current.push({ volume: "", gravity: "", ph: "" });
    set({ [field]: current });
  },

  updateField: (field, value) => {
    set({ [field]: value });
  }
}));
