import admin from "firebase-admin";
import fs from "fs";

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync("./serviceaccount.json", "utf8"));

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export async function handler() {
  try {
    const snapshot = await db.collection("submissions").orderBy("timestamp", "desc").get();
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { statusCode: 200, body: JSON.stringify(submissions) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}