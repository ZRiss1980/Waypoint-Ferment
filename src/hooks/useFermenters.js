// /src/hooks/useFermenters.js
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

export function useFermenters() {
  const [fermenters, setFermenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "fermenters"), where("tankType", "==", "fermenter"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFermenters(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading fermenters:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { fermenters, loading, error };
}
