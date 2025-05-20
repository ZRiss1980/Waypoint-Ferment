import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";





export default function useWaterProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaterProfiles = async () => {
      try {
        const colRef = collection(db, "waterProfiles");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfiles(data);
      } catch (error) {
        console.error("Error fetching water profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWaterProfiles();
  }, []);

  return { profiles, loading };
}
