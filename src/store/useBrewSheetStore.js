import { create } from "zustand";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const useBrewSheetStore = create((set, get) => ({
  actualGrainWeights: [],
  setInitialGrainWeights: (grainBill = []) => {
    const weights = grainBill.map(() => "");
    set({ actualGrainWeights: weights });
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
        console.error("🔥 Firestore update error:", error);
      }
    }
  },
}));
