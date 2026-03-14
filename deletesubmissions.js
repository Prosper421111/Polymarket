import admin from "firebase-admin";
import fs from "fs";

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync("./serviceaccount.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { id } = JSON.parse(event.body);
    await db.collection("submissions").doc(id).delete();
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}