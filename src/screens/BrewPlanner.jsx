// /src/screens/BrewPlanner.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc } from "firebase/firestore";
import "./BrewPlanner.css";

function BrewPlanner() {
  const navigate = useNavigate();
  const [ setPlanScope] = useState("yearly");
  const [beerPlans, setBeerPlans] = useState([]);
  const [existingPlans, setExistingPlans] = useState([]);
  const [editedPlans, setEditedPlans] = useState({});

  const fetchPlans = async () => {
    const getCurrentQuarter = () => {
      const month = new Date().getMonth();
      if (month < 3) return "Q1";
      if (month < 6) return "Q2";
      if (month < 9) return "Q3";
      return "Q4";
    };

    try {
      const snapshot = await getDocs(collection(db, "userPlans"));
      const allPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const currentQuarter = getCurrentQuarter();

      const filtered = allPlans.filter(plan => {
        if (planScope === "yearly") return true;
        if (planScope === "quarterly") {
          return (
            plan.planQuarter === currentQuarter
          );
        }
        if (planScope === "monthly") {
          const now = new Date();
          const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return (
            plan.eventDueDate &&
            !isNaN(new Date(plan.eventDueDate)) &&
            new Date(plan.eventDueDate) >= now &&
            new Date(plan.eventDueDate) <= in30Days
          );
        }
        return false;
      });

      setExistingPlans(filtered);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [planScope]);

  const handleAddBeer = () => {
    setBeerPlans((prev) => [...prev, { beerName: "", recipe: "", flagType: "flagship", eventTag: "", eventDueDate: "", batchTarget: "", planQuarter: "Q1", notes: "" }]);
  };

  const handleInputChange = (index, field, value) => {
    setBeerPlans((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRemoveBeer = (index) => {
    setBeerPlans((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditChange = (id, field, value) => {
    setEditedPlans((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveEdit = async (id) => {
    const ref = doc(db, "userPlans", id);
    const snapshot = await getDocs(collection(db, "userPlans"));
    const current = snapshot.docs.find(doc => doc.id === id);
    console.log("Current plan data:", current?.data());
    const updates = editedPlans[id];
    if (!updates) return;
    console.log("Saving updates for", id, updates);
    try {
      const ref = doc(db, "userPlans", id);
      await updateDoc(ref, {
        ...updates,
        
      });
      alert("Brew plan saved!");
    } catch (error) {
      console.error("Error saving brew plan:", error);
      alert("Failed to save plan");
    }
  };

  const handleSubmit = async (e, index) => {
    e.preventDefault();
    const plan = beerPlans[index];
    try {
      await addDoc(collection(db, "userPlans"), {
        ...plan,
        planScope,
        createdAt: serverTimestamp(),
      });
      alert("Brew plan submitted!");
      setBeerPlans((prev) => prev.filter((_, i) => i !== index));
      fetchPlans();
    } catch (err) {
      console.error("Error adding brew plan:", err);
      alert("Failed to submit plan");
    }
  };

  return (
    <div className="brew-planner-screen">
      <h1>Plan a New Brew</h1>

      <div className="brew-planner-header-row">
        <button className="return-home-button" onClick={() => navigate("/schedule")}>← Return to Schedule</button>

        <div className="plan-scope-toggle">
          {["yearly", "quarterly", "monthly"].map((scope) => (
            <button
              key={scope}
              className={`toggle-button ${planScope === scope ? "active" : ""}`}
              onClick={() => setPlanScope(scope)}
            >
              {scope.charAt(0).toUpperCase() + scope.slice(1)}
            </button>
          ))}
        </div>

        <button className="add-beer-button" onClick={handleAddBeer}>
          + Add Beer to Plan
        </button>
      </div>

      {beerPlans.map((plan, index) => (
        <form key={index} className="brew-plan-form" onSubmit={(e) => handleSubmit(e, index)}>
          <label>
            Beer Name:
            <input type="text" name="beerName" value={plan.beerName} onChange={(e) => handleInputChange(index, "beerName", e.target.value)} required />
          </label>

          <label>
            Select Recipe:
            <select name="recipe" value={plan.recipe} onChange={(e) => handleInputChange(index, "recipe", e.target.value)}>
              <option value="">I don't have it yet</option>
              <option value="classic-saison">Classic Saison</option>
              <option value="guardiana-lager">Guardiana del Mictlán</option>
            </select>
          </label>

          <label>
            Plan Type:
            <select name="flagType" value={plan.flagType} onChange={(e) => handleInputChange(index, "flagType", e.target.value)}>
              <option value="flagship">Flagship</option>
              <option value="seasonal">Seasonal</option>
              <option value="one-off">One-Off</option>
            </select>
          </label>

          <label>
            Event Tag (optional):
            <input type="text" name="eventTag" value={plan.eventTag} onChange={(e) => handleInputChange(index, "eventTag", e.target.value)} />
          </label>

          <label>
            Event Due Date:
            <input type="date" name="eventDueDate" value={plan.eventDueDate} onChange={(e) => handleInputChange(index, "eventDueDate", e.target.value)} />
          </label>

          <label>
            Batch Target:
            <input type="number" name="batchTarget" value={plan.batchTarget} onChange={(e) => handleInputChange(index, "batchTarget", e.target.value)} />
          </label>

          <label>
            Preferred Quarter:
            <select name="planQuarter" value={plan.planQuarter} onChange={(e) => handleInputChange(index, "planQuarter", e.target.value)}>
              <option value="Q1">Q1</option>
              <option value="Q2">Q2</option>
              <option value="Q3">Q3</option>
              <option value="Q4">Q4</option>
            </select>
          </label>

          <label>
            Notes:
            <textarea name="notes" rows="4" value={plan.notes} onChange={(e) => handleInputChange(index, "notes", e.target.value)}></textarea>
          </label>

          <div className="form-actions">
            <button type="submit">Save Brew Plan</button>
            <button type="button" className="delete-button" onClick={() => handleRemoveBeer(index)}>Remove</button>
          </div>
        </form>
      ))}

      {existingPlans.length > 0 && (
        <div className="existing-plans-table">
          <h2>{planScope.charAt(0).toUpperCase() + planScope.slice(1)} Plan Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Beer</th>
                <th>Type</th>
                <th>Quarter</th>
                <th>Due Date</th>
                <th>Batch</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {existingPlans.map((plan) => (
                <tr key={plan.id} className={editedPlans[plan.id] ? "edited-row" : ""}>
                  <td>{plan.beerName}</td>
                  <td>{plan.flagType}</td>
                  <td>
                    <select
                      value={editedPlans[plan.id]?.planQuarter || plan.planQuarter}
                      onChange={(e) => handleEditChange(plan.id, "planQuarter", e.target.value)}
                    >
                      <option value="Q1">Q1</option>
                      <option value="Q2">Q2</option>
                      <option value="Q3">Q3</option>
                      <option value="Q4">Q4</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={editedPlans[plan.id]?.eventDueDate || plan.eventDueDate || ""}
                      onChange={(e) => handleEditChange(plan.id, "eventDueDate", e.target.value)}
                    />
                    {editedPlans[plan.id] && (
                      <button onClick={() => handleSaveEdit(plan.id)}>Save</button>
                    )}
                  </td>
                  <td>{plan.batchTarget}</td>
                  <td>{plan.notes}</td>
                  <td>
                    {editedPlans[plan.id] && (
                      <button onClick={() => handleSaveEdit(plan.id)}>Save</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BrewPlanner;
