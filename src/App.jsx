// /src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import RequireAuth from "./Auth/RequireAuth";
import AppLayout from "./components/AppLayout";
import Login from "./Auth/Login";

import Home from "./screens/Home";
import Fermentation from "./screens/Fermentation";
import Sensory from "./screens/Sensory";
import QAQC from "./screens/QAQC";
import Inventory from "./screens/Inventory";
import Tasks from "./screens/Tasks";
import NotFound from "./screens/NotFound";
import BrewSheet from "./screens/BrewSheet";
import RecipeBuilder from "./screens/recipe/RecipeBuilder";
import Parameters from "./screens/recipe/Parameters";
import GrainSelection from "./screens/recipe/GrainSelection";
import HopSelection from "./screens/recipe/HopSelection";
import WaterChemistry from "./screens/recipe/WaterChemistry";
import YeastHealth from "./screens/recipe/YeastHealth";
import Schedule from "./screens/Schedule";
import BrewPlanner from "./screens/BrewPlanner";
import BrewDays from "./screens/BrewDays";
import Tanks from "./screens/Tanks";

import {
  subscribeToFermenters,
  subscribeToUserPlans,
  subscribeToRecipes,
} from "./store/globalSync";

import "./App.css";

export default function App() {
  useEffect(() => {
    console.log("✅ App mounted");
    const unsubFermenters = subscribeToFermenters();
    const unsubUserPlans = subscribeToUserPlans();
    const unsubRecipes = subscribeToRecipes();
    return () => {
      unsubFermenters();
      unsubUserPlans();
      unsubRecipes();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Home />} />
          <Route path="brewsheet/:id" element={<BrewSheet />} />
          <Route path="brew-sheet" element={<BrewSheet />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="plan" element={<BrewPlanner />} />
          <Route path="brew-days" element={<BrewDays />} />
          <Route path="tanks" element={<Tanks />} />
          <Route path="fermentation" element={<Fermentation />} />
          <Route path="sensory" element={<Sensory />} />
          <Route path="qaqc" element={<QAQC />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="tasks" element={<Tasks />} />

         
          <Route path="recipe" element={<RecipeBuilder />}>
            <Route path="parameters" element={<Parameters />} />
            <Route path="grain-selection" element={<GrainSelection />} />
            <Route path="hop-selection" element={<HopSelection />} />
            <Route path="water-chemistry" element={<WaterChemistry />} />
            <Route path="yeast-health" element={<YeastHealth />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
