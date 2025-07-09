// Inventory.jsx – Live Firestore + UI Add Button per Category with Vendor and Item Modal Support

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import "./Inventory.css";

const CATEGORIES = ["grain", "hops", "yeast"];
const UNITS = ["lbs", "kg", "g", "oz", "L", "gal", "bbl", "bags"];

function Inventory() {
  const [inventory, setInventory] = useState({});
  const [vendors, setVendors] = useState({});
  const [showVendorModal, setShowVendorModal] = useState(null);
  const [showContactsModal, setShowContactsModal] = useState(null);
  const [newVendor, setNewVendor] = useState({ name: "", contacts: [{ type: "email", value: "", name: "" }] });
  const [showAddItemModal, setShowAddItemModal] = useState(null);
  const [helperData, setHelperData] = useState({});
  const [newItem, setNewItem] = useState({
    type: "",
    name: "",
    quantity: "",
    unit: "lbs",
    lot: "",
    notes: "",
    inheritFrom: "",
  });

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

  useEffect(() => {
    const fetchVendors = async () => {
      const snap = await getDocs(collection(db, "vendors"));
      const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const byCategory = {};
      all.forEach((v) => {
        v.categories.forEach((cat) => {
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(v);
        });
      });
      setVendors(byCategory);
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    const fetchHelperData = async () => {
      const result = {};
      for (let cat of CATEGORIES) {
        const snap = await getDocs(collection(db, `${cat}Types`));
        result[cat] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      console.log("🔍 Helper data loaded:", result);
      setHelperData(result);
    };
    fetchHelperData();
  }, []);

  const handleAddVendor = async (cat) => {
    const validContacts = newVendor.contacts.filter((c) => c.value);
    if (!newVendor.name || validContacts.length === 0) return;
    try {
      await addDoc(collection(db, "vendors"), {
        vendorName: newVendor.name,
        categories: [cat],
        contacts: validContacts,
      });
      setShowVendorModal(null);
      setNewVendor({ name: "", contacts: [{ type: "email", value: "", name: "" }] });
    } catch (err) {
      console.error("Error adding vendor", err);
    }
  };

  const handleAddInventoryItem = async () => {
    const { type, name, quantity, unit, lot, notes, inheritFrom } = newItem;
    if (!type || !name || !quantity || !unit) return;

    let itemData = {
      name,
      quantity: parseFloat(quantity),
      unit,
      lot: lot || "",
      notes: notes || "",
    };

    if (inheritFrom) {
      const match = helperData[type].find((d) => d.id === inheritFrom);
      if (match) itemData = { ...itemData, ...match };
    }

    try {
      await addDoc(collection(db, type), itemData);
      setShowAddItemModal(null);
      setNewItem({ type: "", name: "", quantity: "", unit: "lbs", lot: "", notes: "", inheritFrom: "" });
    } catch (err) {
      console.error("Error adding item", err);
    }
  };

  const renderVendorContacts = (vendor) => (
    <>
      <div className="modal-overlay" />
      <div className="modal">
        <h3>{vendor.vendorName} Contacts</h3>
        <ul>
          {vendor.contacts.map((c, i) => (
            <li key={i}>
              {c.name && <strong>{c.name}: </strong>}
              {c.type === "email" && <a href={`mailto:${c.value}`}>{c.value}</a>}
              {c.type === "phone" && <a href={`tel:${c.value}`}>{c.value}</a>}
              {c.type === "website" && <a href={c.value} target="_blank" rel="noreferrer">Website</a>}
              {c.type === "other" && <span>{c.value}</span>}
            </li>
          ))}
        </ul>
        <button onClick={() => setShowContactsModal(null)}>Close</button>
      </div>
    </>
  );

  const renderCategoryTable = (cat) => {
    const items = inventory[cat] || [];
    const catVendors = vendors[cat] || [];

    return (
      <section key={cat} className="inventory-category">
        <h2>{cat}</h2>

        <div className="vendor-section">
          <strong>Vendors: </strong>
          {catVendors.map((v) => (
            <button
              key={v.id}
              className="vendor-link"
              onClick={() =>
                v.contacts.length === 1
                  ? window.open(
                      v.contacts[0].type === "email"
                        ? `mailto:${v.contacts[0].value}`
                        : v.contacts[0].type === "phone"
                        ? `tel:${v.contacts[0].value}`
                        : v.contacts[0].value,
                      "_blank"
                    )
                  : setShowContactsModal(v)
              }
            >
              {v.vendorName}
            </button>
          ))}
          <button onClick={() => setShowVendorModal(cat)}>+ Add Vendor</button>
          <button onClick={() => setShowAddItemModal(cat)}>+ Add {cat}</button>
        </div>

        {items.length === 0 ? (
          <p>No items in this category yet.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>{item.name} – {item.quantity} {item.unit || "units"}</li>
            ))}
          </ul>
        )}
      </section>
    );
  };

  return (
    <div className="inventory-page">
      <h1>Inventory Management</h1>
      {CATEGORIES.map((cat) => renderCategoryTable(cat))}

      {showVendorModal && (
        <>
          <div className="modal-overlay" />
          <div className="modal">
            <h3>Add Vendor for {showVendorModal}</h3>
            <input
              type="text"
              placeholder="Vendor Name"
              value={newVendor.name}
              onChange={(e) =>
                setNewVendor((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            {newVendor.contacts.map((contact, i) => (
              <div key={i} className="contact-row">
                <select
                  value={contact.type}
                  onChange={(e) => {
                    const updated = [...newVendor.contacts];
                    updated[i].type = e.target.value;
                    setNewVendor((prev) => ({ ...prev, contacts: updated }));
                  }}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="website">Website</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Contact value"
                  value={contact.value}
                  onChange={(e) => {
                    const updated = [...newVendor.contacts];
                    updated[i].value = e.target.value;
                    setNewVendor((prev) => ({ ...prev, contacts: updated }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Name (optional)"
                  value={contact.name || ""}
                  onChange={(e) => {
                    const updated = [...newVendor.contacts];
                    updated[i].name = e.target.value;
                    setNewVendor((prev) => ({ ...prev, contacts: updated }));
                  }}
                />
              </div>
            ))}
            <button
              onClick={() =>
                setNewVendor((prev) => ({
                  ...prev,
                  contacts: [...prev.contacts, { type: "email", value: "", name: "" }],
                }))
              }
            >
              + Add Another Contact
            </button>
            <br />
            <button onClick={() => handleAddVendor(showVendorModal)}>Save</button>
            <button onClick={() => setShowVendorModal(null)}>Cancel</button>
          </div>
        </>
      )}

      {showAddItemModal && (
        <>
          <div className="modal-overlay" />
          <div className="modal">
            <h3>Add {showAddItemModal} to Inventory</h3>
            <label>Select existing type:</label>
            <select
              value={newItem.inheritFrom}
              onChange={(e) =>
                setNewItem((prev) => ({ ...prev, inheritFrom: e.target.value, type: showAddItemModal }))
              }
            >
              <option value="">-- None --</option>
              {(helperData[showAddItemModal] || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem((prev) => ({ ...prev, unit: e.target.value }))}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Lot number (optional)"
              value={newItem.lot}
              onChange={(e) => setNewItem((prev) => ({ ...prev, lot: e.target.value }))}
            />
            <textarea
              placeholder="Notes (optional)"
              value={newItem.notes}
              onChange={(e) => setNewItem((prev) => ({ ...prev, notes: e.target.value }))}
            />
            <button onClick={handleAddInventoryItem}>Save</button>
            <button onClick={() => setShowAddItemModal(null)}>Cancel</button>
          </div>
        </>
      )}

      {showContactsModal && renderVendorContacts(showContactsModal)}
    </div>
  );
}

export default Inventory;
