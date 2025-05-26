import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";





const useBJCPStyles = () => {
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "bjcpStyles"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStyles(data);
      } catch (err) {
        console.error("❌ Error fetching BJCP styles:", err);
      }
    };

    fetchStyles();
  }, []);

  return styles;
};

export default useBJCPStyles;
