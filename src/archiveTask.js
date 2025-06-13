// src/archiveTask.js

import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase"; // ✅ relative to where this file lives

export const archiveTask = async (planId, taskId, taskData) => {
  const batch = writeBatch(db);

  const taskRef = doc(db, "userPlans", planId, "tasks", taskId);
  const archiveRef = doc(db, "userPlans", planId, "archivedTasks", taskId);

  batch.set(archiveRef, {
    ...taskData,
    completedAt: serverTimestamp(),
  });

  batch.delete(taskRef);

  await batch.commit();
};
