import { startRegistration } from "@simplewebauthn/browser";

/**
 * Triggers biometric passkey registration.
 * This must be called after a user is logged in.
 * It uses a temporary static challenge for now — this will be replaced with a real Firebase Function.
 */
export async function registerPasskey(user) {
  if (!user || !user.uid || !user.email) {
    throw new Error("Invalid user object");
  }

  const options = {
    challenge: btoa("temporary-challenge-string"),
    rp: {
      name: "Waypoint Ferment App",
    },
    user: {
      id: user.uid,
      name: user.email,
      displayName: user.email,
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" },    // ES256
      { alg: -257, type: "public-key" },  // RS256
    ],
    timeout: 60000,
    attestation: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  };

  try {
    const credential = await startRegistration(options);
    console.log("✅ Passkey credential created:", credential);
    return credential;
  } catch (err) {
    console.error("❌ Passkey registration failed:", err);
    throw err;
  }
}
