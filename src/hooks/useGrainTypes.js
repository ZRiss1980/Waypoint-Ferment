// /src/hooks/useGrainTypes.js

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";





const useGrainTypes = () => {
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrains = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "grainTypes"));
        const grainList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGrains(grainList);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchGrains();
  }, []);

  return { grains, loading, error };
};

export default useGrainTypes;
