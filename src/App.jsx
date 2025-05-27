import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./screens/Home";
import BrewSheet from "./screens/BrewSheet";
import Fermentation from "./screens/Fermentation";
import Sensory from "./screens/Sensory";
import QAQC from "./screens/QAQC";
import Inventory from "./screens/Inventory";
import Scheduling from "./screens/Scheduling";
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


import Tanks from "./screens/Tanks"; // 🔥 the new unified tank screen

import "./App.css";

function App() {
  return (
    <Router>
      <NavBar />
      <main>
        <Routes>
          <Route path="/brewsheet/:id" element={<BrewSheet />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/plan" element={<BrewPlanner />} />
          <Route path="/brew-days" element={<BrewDays />} />
          <Route path="/tanks" element={<Tanks />} />
          <Route path="/" element={<Home />} />
          <Route path="/brew-sheet" element={<BrewSheet />} />
          <Route path="/fermentation" element={<Fermentation />} />
          <Route path="/sensory" element={<Sensory />} />
          <Route path="/qaqc" element={<QAQC />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/tasks" element={<Tasks />} />

          <Route path="/recipe" element={<RecipeBuilder />}>
            <Route index element={<Navigate to="parameters" />} />
            <Route path="parameters" element={<Parameters />} />
            <Route path="grain-selection" element={<GrainSelection />} />
            <Route path="hop-selection" element={<HopSelection />} />
            <Route path="water-chemistry" element={<WaterChemistry />} />
            <Route path="yeast-health" element={<YeastHealth />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
