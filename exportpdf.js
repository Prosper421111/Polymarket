import admin from "firebase-admin";
import fs from "fs";
import PDFDocument from "pdfkit";

// Load service account
const serviceAccount = JSON.parse(fs.readFileSync("./serviceaccount.json", "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

export async function handler() {
  try {
    const snapshot = await db.collection("submissions").orderBy("timestamp", "desc").get();
    const submissions = snapshot.docs.map(doc => doc.data());

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {});

    doc.fontSize(18).text("Submissions Log", { align: "center" });
    doc.moveDown();

    submissions.forEach((s, i) => {
      doc.fontSize(12).text(`${i + 1}. Email: ${s.email} | Country: ${s.country} | Date: ${s.timestamp}`);
      doc.moveDown(0.5);
    });

    doc.end();
    const pdfBuffer = await new Promise(resolve => {
      const chunks = [];
      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=submissions.pdf" },
      body: pdfBuffer.toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}