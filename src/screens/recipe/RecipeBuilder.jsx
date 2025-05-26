// /src/screens/recipe/RecipeBuilder.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import RecipeSidebar from "../../components/RecipeSidebar";
import "./RecipeBuilder.css";

function RecipeBuilder() {
  return (
    <div className="recipe-builder-layout">
      <RecipeSidebar />
      <div className="recipe-builder-content">
        <Outlet />
      </div>
    </div>
  );
}

export default RecipeBuilder;
