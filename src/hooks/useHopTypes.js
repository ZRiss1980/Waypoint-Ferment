// /src/hooks/useHopTypes.js
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";





export const useHopTypes = () => {
  const [hops, setHops] = useState([]);

  useEffect(() => {
    const fetchHops = async () => {
      try {
        const snapshot = await getDocs(collection(db, "hops"));
        const hopsData = snapshot.docs.map((doc) => doc.data());
        setHops(hopsData);
      } catch (err) {
        console.error("Failed to load hops:", err);
      }
    };

    fetchHops();
  }, []);

  return hops;
};
