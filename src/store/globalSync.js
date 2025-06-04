// /src/store/globalSync.js
import { create } from "zustand";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

// Global Zustand Store
const useGlobalSyncStore = create((set) => ({
  globalFermenters: [],
  globalUserPlans: [],
  setGlobalFermenters: (fermenters) => set({ globalFermenters: fermenters }),
  setGlobalUserPlans: (plans) => set({ globalUserPlans: plans }),
}));

// Subscribe to fermenters Firestore collection
export const subscribeToFermenters = () => {
  const fermentersRef = collection(db, "fermenters");
  console.log("📡 Subscribing to fermenters...");

  const unsubscribe = onSnapshot(fermentersRef, (snapshot) => {
    const fermenters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("📥 Fermenters updated:", fermenters);
    useGlobalSyncStore.getState().setGlobalFermenters(fermenters);
  });

  return unsubscribe;
};

// Subscribe to userPlans Firestore collection
export const subscribeToUserPlans = () => {
  const plansRef = collection(db, "userPlans");
  console.log("📡 Subscribing to user plans...");

  const unsubscribe = onSnapshot(plansRef, (snapshot) => {
    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("📥 User plans updated:", plans);
    console.log("📥 Fermenters updated:", fermenters);
      useGlobalSyncStore.getState().setGlobalFermenters(fermenters);

  });

  return unsubscribe;
};

export default useGlobalSyncStore;
