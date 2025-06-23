// /src/lib/firestore/recipes.js
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";



export const saveRecipeToFirestore = async (recipeData) => {
  try {
    const docRef = doc(db, "recipes", recipeData.uniqueId);
    await setDoc(docRef, recipeData, { merge: true });
    console.log("📦 Recipe saved to Firestore with ID:", recipeData.uniqueId);
      return recipeData.uniqueId;
  } catch (error) {
    console.error("🔥 Error savi