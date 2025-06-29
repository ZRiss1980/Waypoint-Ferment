// /src/lib/scheduler/applyScheduleUpdates.js

import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { assignBrewPlanDates } from "./assignBrewPlanDates";

export async function applyScheduleUpdates() {
  try {
    const [plansSnap, fermentersSnap] = await Promise.all([
      getDocs(collection(db, "userPlans")),
      getDocs(collection(db, "fermenters")),
    ]);

    const plans = plansSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const fermenters = fermentersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const updatedPlans = assignBrewPlanDates(plans, fermenters);

    for (const plan of updatedPlans) {
      const ref = doc(db, "userPlans", plan.id);
      await updateDoc(ref, {
        assignedFermenter: plan.assignedFermenter,
        startDate: plan.startDate,
        endDate: plan.endDate,
      });
      console.log(`🗓️ Updated plan "${plan.beerName}" with new schedule`);
    }

    return updatedPlans.length;

  } catch (err) {
    console.error("❌ Scheduler failed to apply updates:", err);
    throw err;
  }
}
