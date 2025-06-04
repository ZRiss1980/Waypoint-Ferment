import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useBrewSheetStore } from "./useBrewSheetStore";

export function subscribeToFermenters() {
  const fermentersRef = collection(db, "fermenters");
  const unsub = onSnapshot(fermentersRef, (snapshot) => {
    const fermenters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    useBrewSheetStore.getState().setGlobalFermenters(fermenters);
  });
  return unsub;
}

export function subscribeToUserPlans() {
  const plansRef = collection(db, "userPlans");
  const unsub = onSnapshot(plansRef, (snapshot) => {
    const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    useBrewSheetStore.getState().setGlobalUserPlans(plans);
  });
  return unsub;
}
