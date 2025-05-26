// /src/hooks/useUserWaterProfiles.js
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";





export default function useUserWaterProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserWaterProfiles = async () => {
      try {
        const colRef = collection(db, "userWaterProfiles");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(data);
      } catch (error) {
        console.error("Error fetching user water profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserWaterProfiles();
  }, []);

  return { profiles, loading };
}

