// Inventory.jsx – Live Firestore + UI Add Button per Category

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import "./Inventory.css";

const CATEGORIES = [
  "grain",
  "hops",
  "yeast",
  "waterSalts",
  "chemicals",
  "enzymes",
];

function Inventory() {
  const [inventory, setInventory] = useState({});
  const [newItems, setNewItems] = useState({});

  useEffect(() => {
    const unsubscribers = CATEGORIES.map((cat) => {
      return onSnapshot(collection(db, cat), (snapshot) => {
        setInventory((prev) => ({
          ...prev,
          [cat]: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        }));
      });
    });
    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  const handleAddItem = async (cat) => {
    const input = newItems[cat];
    if (!input || input.trim() === "") return;
    try {
      await addDoc(collection(db, cat), { name: input.trim(), quantity: 1 });
      setNewItems((prev) => ({ ...prev, [cat]: "" }));
    } catch (err) {
      console.error("Failed to add item to", cat, err);
    }
  };

  const renderCategoryTable = (cat) => {
    const items = inventory[cat] || [];
    return (
      <section key={cat} className="inventory-category">
        <h2>{cat}</h2>
        {items.length === 0 ? (
          <p>No items in this category yet.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>{item.name} (Qty: {item.quantity || 1})</li>
            ))}
          </ul>
        )}
        <div className="add-item-row">
          <input
            type="text"
            placeholder={`Add new ${cat} item`}
            value={newItems[cat] || ""}
            onChange={(e) =>
              setNewItems((prev) => ({ ...prev, [cat]: e.target.value }))
            }
          />
          <button onClick={() => handleAddItem(cat)}>+ Add</button>
        </div>
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
