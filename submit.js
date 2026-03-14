import admin from "firebase-admin";
import fs from "fs";

// Load the service account key
const serviceAccount = JSON.parse(fs.readFileSync("./serviceaccount.json", "utf8"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Netlify Function handler
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, country } = JSON.parse(event.body);
    const timestamp = new Date().toISOString();

    await db.collection("submissions").add({ email, country, timestamp });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}