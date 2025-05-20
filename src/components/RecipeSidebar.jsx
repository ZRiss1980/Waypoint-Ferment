// /src/components/RecipeSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useParametersStore } from "../store/parametersStore";
import useRecipeStore from "../store/useRecipeStore";
import useRecipeDevStore from "../store/useRecipeDevStore";
import { saveRecipeToFirestore } from "../lib/firestore/recipes"; // ✅ <- Add this
import "./RecipeSidebar.css";


function RecipeSidebar() {
  const parameters = useParametersStore((s) => s.parameters);
  const recipe = useRecipeStore((s) => s.recipe);
  const overwriteRecipeDev = useRecipeDevStore((s) => s.overwriteRecipeDev);

  const validateRecipe = (parameters, recipe) => {
    const errors = [];

    if (!parameters.beerName) errors.push("Beer Name is required.");
    if (!parameters.style) errors.push("BJCP Style must be selected.");
    if (!parameters.yeastStrain) errors.push("Yeast Strain is required.");
    if (!parameters.uniqueId) errors.push("Unique ID is missing.");
    if (!recipe.grainBill || recipe.grainBill.length === 0) errors.push("Grain bill cannot be empty.");
    if (!recipe.hopAdditions || recipe.hopAdditions.length === 0) errors.push("Hop schedule is missing.");
    if (!recipe.targetWaterProfile?.id) errors.push("Target Water Profile not set.");
    if (!recipe.waterSourceProfile?.id) errors.push("Water Source Profile not set.");
    if (recipe.calculatedIBU == null) errors.push("Calculated IBU is missing.");

    return errors;
  };

  const handleSaveRecipe = () => {
    console.log("🟡 Save Recipe clicked");

    const currentParameters = useParametersStore.getState().parameters;
    const currentRecipe = useRecipeStore.getState().recipe;

    const errors = validateRecipe(currentParameters, currentRecipe);
    if (errors.length > 0) {
      console.error("❌ Validation failed:", errors);
      alert("Cannot save recipe:\n\n" + errors.join("\n"));
      return;
    }

    const now = new Date().toISOString();

    const merged = {
      ...currentRecipe,
      ...currentParameters,
      createdAt: currentRecipe.createdAt || now,
      updatedAt: now,
      recipeVersion: "1.0.0",
    };

    overwriteRecipeDev(merged);
    saveRecipeToFirestore(merged)
    .then((id) => console.log("📥 Firestore doc ID:", id))
    .catch((err) => console.error("❌ Failed to save to Firestore:", err));

    useParametersStore.getState().markClean();

    console.log("✅ Saved to recipeDev store:", merged);
  };



  return (
    <nav className="recipe-sidebar">
      <ul>
        <li>
          <NavLink to="parameters" className={({ isActive }) => isActive ? "active" : ""}>
            1. Parameters
          </NavLink>
        </li>
        <li>
          <NavLink to="grain-selection" className={({ isActive }) => isActive ? "active" : ""}>
            2. Grain Selection
          </NavLink>
        </li>
        <li>
          <NavLink to="hop-selection" className={({ isActive }) => isActive ? "active" : ""}>
            3. Hop Selection
          </NavLink>
        </li>
        <li>
          <NavLink to="water-chemistry" className={({ isActive }) => isActive ? "active" : ""}>
            4. Water Chemistry
          </NavLink>
        </li>
        <li>
          <NavLink to="yeast-health" className={({ isActive }) => isActive ? "active" : ""}>
            5. Yeast Health
          </NavLink>
        </li>
      </ul>
      <button className="save-recipe-btn" onClick={handleSaveRecipe}>
        Save Recipe
      </button>
    </nav>
  );
}

export default RecipeSidebar;
