// /src/hooks/useYeastProfiles.js
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";





export default function useYeastProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYeastProfiles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "yeastVariables"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(data);
      } catch (error) {
        console.error("Error fetching yeast profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYeastProfiles();
  }, []);

  return { profiles, loading };
}
