// Inventory.jsx – Live Firestore + UI Add Button per Category with Vendor support

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  where,
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
  const [vendors, setVendors] = useState({});
  const [showVendorModal, setShowVendorModal] = useState(null);
  const [showContactsModal, setShowContactsModal] = useState(null);
  const [newVendor, setNewVendor] = useState({ name: "", contacts: [{ type: "email", value: "", name: "" }] });

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

  const handleAddVendor = async (cat) => {
    if (!newVendor.name || newVendor.contacts.length === 0) return;
    const validContacts = newVendor.contacts.filter((c) => c.value);
    if (validContacts.length === 0) return;

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

  const renderVendorContacts = (vendor) => {
    return (
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
  };

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
        </div>

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
<button
  onClick={async () => {
    await handleAddVendor(showVendorModal);
    // Refresh vendors immediately after adding
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
  }}
>
  Save
</button>
            <button onClick={() => setShowVendorModal(null)}>Cancel</button>
          </div>
        </>
      )}

      {showContactsModal && renderVendorContacts(showContactsModal)}
    </div>
  );
}

export default Inventory;
