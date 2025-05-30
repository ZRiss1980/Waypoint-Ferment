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
 