import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase.js"; 
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "Users", result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      role: "user",
      createdAt: new Date().toISOString(),
    });
    return result.user;
  };

  const login = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
