// /src/hooks/useBrightTanks.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export const useBrightTanks = () => {
  const [brights, setBrights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "brights"),
      (snapshot) => {
        const tanks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBrights(tanks);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading bright tanks:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { brights, loading, error };
};
