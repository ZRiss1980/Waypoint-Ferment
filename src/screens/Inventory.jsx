// /src/screens/Inventory.jsx

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import "./Inventory.css";

const CATEGORIES = [
  "grain",
  "hops",
  "yeast",
  "waterSalt",
  "chemical",
  "enzyme",
  "other",
];

function Inventory() {
  const [items, setItems] = useState([]);
  const [editedFields, setEditedFields] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventoryItems"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    });
    return () => unsub();
  }, []);

  const handleChange = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setEditedFields((prev) => ({ ...prev, [`${itemId}-${field}`]: true }));
  };

  const handleBlur = async (itemId, field, value) => {
    try {
      const ref = doc(db, "inventoryItems", itemId);
      await updateDoc(ref, {
        [field]: field === "quantity" ? parseFloat(value) : value,
        lastUpdated: new Date().toISOString(),
      });
      setEditedFields((prev) => {
        const newState = { ...prev };
        delete newState[`${itemId}-${field}`];
        return newState;
      });
    } catch (err) {
      console.error("Failed to update Firestore:", err);
    }
  };

  const renderCategoryTable = (category) => {
    const filtered = items.filter((item) => item.category === category);
    if (filtered.length === 0) return null;

    return (
      <section className="inventory-card" key={category}>
        <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Vendor</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    value={item.name || ""}
                    onChange={(e) => handleChange(item.id, "name", e.target.value)}
                    onBlur={(e) => handleBlur(item.id, "name", e.target.value)}
                    className={editedFields[`${item.id}-name`] ? "edited" : ""}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.quantity || 0}
                    onChange={(e) => handleChange(item.id, "quantity", e.target.value)}
                    onBlur={(e) => handleBlur(item.id, "quantity", e.target.value)}
                    className={editedFields[`${item.id}-quantity`] ? "edited" : ""}
                  />
                </td>
                <td>
                  <input
                    value={item.unit || ""}
                    onChange={(e) => handleChange(item.id, "unit", e.target.value)}
                    onBlur={(e) => handleBlur(item.id, "unit", e.target.value)}
                    className={editedFields[`${item.id}-unit`] ? "edited" : ""}
                  />
                </td>
                <td>
                  <input
                    value={item.vendor || ""}
                    onChange={(e) => handleChange(item.id, "vendor", e.target.value)}
                    onBlur={(e) => handleBlur(item.id, "vendor", e.target.value)}
                    className={editedFields[`${item.id}-vendor`] ? "edited" : ""}
                  />
                </td>
                <td>
                  <input
                    value={item.notes || ""}
                    onChange={(e) => handleChange(item.id, "notes", e.target.value)}
                    onBlur={(e) => handleBlur(item.id, "notes", e.target.value)}
                    className={editedFields[`${item.id}-notes`] ? "edited" : ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    );
  };

  return (
    <div className="inventory-page">
      <h1>Inventory Management</h1>
      {CATEGORIES.map((cat) => renderCategoryTable(cat))}
    </div>
  );
}

export default Inventory;
