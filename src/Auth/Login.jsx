import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";
import { registerPasskey } from "../Auth/passkeyUtils";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password); // ✅ direct user return from login()

      if (!user || !user.uid) {
        console.error("❌ Login returned invalid user:", user);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        console.error("No user doc found after login");
        return;
      }

      const userData = userSnap.data();

      if (!userData.passkeyRegistered) {
        console.log("🔐 Registering biometric passkey now...");
        const credential = await registerPasskey(user);

        await updateDoc(userDocRef, {
          passkeyRegistered: true,
          lastPasskeyCreatedAt: new Date().toISOString(),
        });

        console.log("✅ Passkey successfully registered:", credential);
      }

      console.log("✅ Login complete");
      // Optional redirect
      // navigate("/");
    } catch (error) {
      console.error("❌ Login or passkey registration failed:", error.message);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}
