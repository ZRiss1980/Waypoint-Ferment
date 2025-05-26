// /src/lib/firestore/recipes.js
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";



export const saveRecipeToFirestore = async (recipeData) => {
  try {
    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    console.log("📦 Recipe saved to Firestore with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("🔥 Error saving recipe to Firestore:", error);
    throw error;
  }
};
