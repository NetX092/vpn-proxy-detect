import express from "express";
import fetch from "node-fetch";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

app.get("/check-ip", async (req, res) => {
  try {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "Missing UID" });

    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    console.log("Checking IP:", ip);

    // Call free IP detection API
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=proxy,hosting,query`);
    const data = await resp.json();
    console.log("IP Check Result:", data);

    const isProxy = data.proxy === true || data.hosting === true;

    if (isProxy) {
      // Mark user as banned in Firestore
      await admin.firestore().collection("users").doc(uid).set({
        banned: true,
        banReason: "VPN/Proxy detected",
        bannedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return res.json({ banned: true });
    }

    res.json({ banned: false });
  } catch (err) {
    console.error("Error checking IP:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("VPN Detection API is running ✅");
});

app.listen(3000, () => console.log("Server running on port 3000"));
