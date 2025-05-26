// /src/screens/Fermenters.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useFermenters } from "../hooks/useFermenters";
import { useBrightTanks } from "../hooks/useBrightTanks";
// TODO: Replace with useTanks() once bright tank logic is ready
import "./Tanks.css";

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Tanks() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const upperId = formData.id.trim().toUpperCase();

    if (!upperId || !formData.volumeBBL || !formData.psiRating) {
      alert("All fields are required.");
      return;
    }

    try {
      const existing = fermenters.find((f) => f.id === upperId);
      if (existing) {
        alert("A fermenter with this ID already exists.");
        return;
      }

      const collectionName = formData.tankType === "bright" ? "brights" : "fermenters";
      await addDoc(collection(db, collectionName), {
        ...formData,
        id: upperId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        tankType: formData.tankType
      });

      setShowForm(false);
      setFormData({
        id: "",
        volumeBBL: "",
        psiRating: "",
        pressureCapable: false,
        plaatoCapable: false,
        tankType: formData.tankType
      });

    } catch (err) {
      console.error("Error adding fermenter:", err);
      alert("Failed to add fermenter.");
    }
  };
  const { fermenters, loading: loadingFV, error: errorFV } = useFermenters();
  const { brights, loading: loadingBT, error: errorBT } = useBrightTanks();
  const [showForm, setShowForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    id: "",
    volumeBBL: "",
    psiRating: "",
    pressureCapable: false,
    plaatoCapable: false,
    tankType: "fermenter"
  });

  return (
    <div className="fermenters-screen">
      <h1>Tank Management</h1>
      <button className="return-home-button" onClick={() => navigate('/')}>
        ← Return Home
      </button>
      <div className="add-fermenter-wrapper">
        <button className="add-fermenter-button" onClick={() => {
          setShowForm(!showForm);
          setFormData({
            id: "",
            volumeBBL: "",
            psiRating: "",
            pressureCapable: false,
            plaatoCapable: false,
            tankType: "fermenter"
          });
        }}>
          {showForm && formData.tankType === "fermenter" ? "× Cancel" : "+ Add Fermenter"}
        </button>

        <button className="add-fermenter-button" onClick={() => {
          setShowForm(!showForm);
          setFormData({
            id: "",
            volumeBBL: "",
            psiRating: "",
            carbStone: false,
            tapMinderCapable: false,
            tankType: "bright"
          });
        }}>
          {showForm && formData.tankType === "bright" ? "× Cancel" : "+ Add Bright Tank"}
        </button>

        {showForm && (
          <form className="add-fermenter-form" onSubmit={handleSubmit}>
                        <label>
              Tank ID:
              <input type="text" name="id" required value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} />
            </label>
            <label>
              Volume (BBL):
              <input type="number" name="volumeBBL" step="0.1" required value={formData.volumeBBL} onChange={(e) => setFormData({ ...formData, volumeBBL: e.target.value })} />
            </label>
            <label>
              PSI Rating:
              <input type="number" name="psiRating" step="1" required value={formData.psiRating} onChange={(e) => setFormData({ ...formData, psiRating: e.target.value })} />
            </label>
            {formData.tankType === "fermenter" && (
            <label>
              Ferments Under Pressure:
              <input type="checkbox" name="pressureCapable" checked={formData.pressureCapable} onChange={(e) => setFormData({ ...formData, pressureCapable: e.target.checked })} />
            </label>
            )}
            {formData.tankType === "fermenter" && (
            <label>
              Plaato Connected:
              <input type="checkbox" name="plaatoCapable" checked={formData.plaatoCapable} onChange={(e) => setFormData({ ...formData, plaatoCapable: e.target.checked })} />
            </label>
            )}

            {formData.tankType === "bright" && (
              <>
                <label>
                  Carb Stone Installed:
                  <input type="checkbox" name="carbStone" checked={formData.carbStone || false} onChange={(e) => setFormData({ ...formData, carbStone: e.target.checked })} />
                </label>
                <label>
                  Connected to Tap Minder:
                  <input type="checkbox" name="tapMinderCapable" checked={formData.tapMinderCapable || false} onChange={(e) => setFormData({ ...formData, tapMinderCapable: e.target.checked })} />
                </label>
              </>
            )}
            <button type="submit">Submit</button>
          </form>
        )}
      </div>
      <p className="subheading">View and manage all tanks in your brewery.</p>

      <h2>Fermenters</h2>
      {loadingFV && <p>Loading fermenters...</p>}
      {errorFV && <p className="error">Error loading fermenters</p>}
      {!loadingFV && fermenters.length === 0 && <p>No fermenters found.</p>}

      <table className="fermenter-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Current Beer</th>
            <th>Start Date</th>
            <th>Expected Days</th>
            <th>Last CIP</th>
          </tr>
        </thead>
        <tbody>
          {fermenters.slice().sort((a, b) => a.id.localeCompare(b.id)).map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.currentStatus || "n/a"}</td>
              <td>{f.currentBatch?.beerName || "—"}</td>
              <td>{f.startDate || "—"}</td>
              <td>{f.fermentationDaysExpected || "—"}</td>
              <td>{f.lastCIP || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Bright Tanks</h2>
      {loadingBT && <p>Loading bright tanks...</p>}
      {errorBT && <p className="error">Error loading bright tanks</p>}
      {!loadingBT && brights.length === 0 && <p>No bright tanks found.</p>}

      <table className="fermenter-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Current Beer</th>
            <th>Start Date</th>
            <th>Expected Days</th>
            <th>Last CIP</th>
          </tr>
        </thead>
        <tbody>
          {brights.slice().sort((a, b) => a.id.localeCompare(b.id)).map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.currentStatus || "n/a"}</td>
              <td>{b.currentBatch?.beerName || "—"}</td>
              <td>{b.startDate || "—"}</td>
              <td>{b.fermentationDaysExpected || "—"}</td>
              <td>{b.lastCIP || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tanks;
