// Inventory.jsx – Live Firestore + UI Add Button per Category with Vendor support

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDo