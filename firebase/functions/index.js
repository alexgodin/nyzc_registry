const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");

initializeApp();

// ID from the sheet URL: docs.google.com/spreadsheets/d/<SHEET_ID>/edit
const SHEET_ID = defineString("SHEET_ID");

// Pledged totals live in items/{item name}. registry.js builds the same key from the card's name.
const itemKey = (name) => String(name).trim().replace(/\//g, "-");

// Columns: Timestamp | Item | Quantity | Amount | Name | Email
exports.appendPledgeToSheet = onDocumentCreated("pledges/{id}", async (event) => {
  const snap = event.data;
  if (!snap) return;
  const p = snap.data();
  if (p.sheetRowAppended) return;

  const when = p.createdAt && p.createdAt.toDate ? p.createdAt.toDate() : new Date();
  const row = [
    when.toLocaleString("en-US", { timeZone: "America/New_York" }),
    p.item, p.quantity, p.amount ?? "", p.name, p.email,
  ];

  const auth = new google.auth.GoogleAuth({ scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  const sheets = google.sheets({ version: "v4", auth });
  // Throwing lets the doc stay in Firestore without the flag, so a failed row can be found and re-run.
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID.value(),
    range: "A:F", // no tab name: appends to the first tab
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  // The page reads items/* to mark cards as offered. The total and the flag are written together,
  // so a retry never counts the same pledge twice.
  const db = snap.ref.firestore;
  const batch = db.batch();
  batch.set(db.collection("items").doc(itemKey(p.item)), { pledged: FieldValue.increment(p.quantity) }, { merge: true });
  batch.update(snap.ref, { sheetRowAppended: true });
  await batch.commit();
  logger.info("Pledge appended", { id: event.params.id });
});
