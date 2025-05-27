// /src/screens/BrewSheet.jsx
import React from "react";
import "./BrewSheet.css";

function BrewSheet() {
  return (
    <div className="brewsheet">
      <header className="brewsheet-header">
        <h1>Brew Sheet</h1>
        <p>Live brew tracking with target and actual values.</p>
      </header>

      <section className="card">
        <h2>Batch Info</h2>
        {/* Recipe Name, Date, Batch Size, Style, FV, GTemp, OG/TG, ABV, SRM, IBU, Yeast Gen */}
      </section>

      <section className="card">
        <h2>Grain Bill</h2>
        <table>
          <thead>
            <tr>
              <th>Malt</th>
              <th>Target (lbs)</th>
              <th>Actual (lbs)</th>
              <th>SRM</th>
            </tr>
          </thead>
          <tbody>{/* dynamic rows */}</tbody>
        </table>
      </section>

      <section className="card">
        <h2>Hop Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Hop</th>
              <th>Method</th>
              <th>Time / Temp</th>
              <th>Target lbs/BBL</th>
              <th>Actual lbs/BBL</th>
            </tr>
          </thead>
          <tbody>{/* dynamic rows */}</tbody>
        </table>
      </section>

      <section className="card">
        <h2>Water Chemistry</h2>
        {/* Strike volume, salts, resulting profile, mash pH */}
      </section>

      <section className="card">
        <h2>Gravity / pH Tracking</h2>
        {/* Vorlauf, runoff, pre/post boil, knockout */}
      </section>

      <section className="card">
        <h2>Yeast Info</h2>
        {/* Strain, Gen, Viability, Volume, Pitch Rate */}
      </section>

      <section className="card">
        <h2>Notes</h2>
        <textarea placeholder="Brew notes, deviations, observations..." rows={5} />
      </section>
    </div>
  );
}

export default BrewSheet;
