// Pledge form: "Give this gift" opens a dialog, and the pledge is saved to Firestore.
// A Cloud Function copies each pledge into the Google Sheet (see firebase/functions/index.js).
// Until the Firebase web app config below is filled in, the buttons keep using their mailto: links.
(function () {
const firebaseConfig = {
  apiKey: "AIzaSyDzNRBlZnbPvTaFEWA0XgmqcOCVa7rSz8w",
  authDomain: "nyzc-registry.firebaseapp.com",
  projectId: "nyzc-registry",
  appId: "1:645953910857:web:cc74ffc632340ca5e1a798",
};
const SDK = "https://www.gstatic.com/firebasejs/10.14.1";

const dialog = document.getElementById("pledge");
const form = document.getElementById("pledge-form");
const statusEl = document.getElementById("pledge-status");
const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
let sdk, dbPromise;
// One Firebase app, shared by the totals read on page load and the pledge write on submit.
function getDb() {
  return (dbPromise ||= Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-firestore.js`)]).then(
    ([{ initializeApp }, fs]) => ({ fs, db: fs.getFirestore(initializeApp(firebaseConfig)) })
  ));
}

// Everything about an item is read from its card, so editing a card keeps the form in sync.
function readCard(btn) {
  const card = btn.closest(".gift");
  const price = card.querySelector(".gift-price");
  const amount = /\$([\d,]+)/.exec(price.firstChild.textContent);
  const needed = /(\d+)(?:\/\d+)? needed/.exec(price.textContent); // "N needed", or "N/total needed" once some are offered
  return {
    item: card.querySelector(".gift-name").textContent.trim(),
    unit: amount ? Number(amount[1].replace(/,/g, "")) : null,
    needed: needed ? Number(needed[1]) : 1,
  };
}

let current;
function openPledge(btn) {
  current = readCard(btn);
  form.reset();
  form.hidden = false;
  form.querySelector("[type=submit]").disabled = false;
  statusEl.hidden = true;
  form.querySelector("[name=quantity]").max = current.needed;
  form.querySelector(".pledge-qty").hidden = current.needed < 2;
  form.querySelector(".pledge-amount").hidden = current.unit !== null;
  document.getElementById("pledge-item").textContent = current.item;
  dialog.showModal();
}

function show(message, isError) {
  statusEl.textContent = message;
  statusEl.className = "pledge-status" + (isError ? " error" : "");
  statusEl.hidden = false;
}

// Pledged totals (items/{name}, written by the Cloud Function) mark cards as offered and show "N/total needed" until then.
// Cards already marked by hand stay marked, and any failure here leaves the page as it is.
const itemKey = (name) => name.trim().replace(/\//g, "-");
async function applyTotals() {
  const { fs, db } = await getDb();
  const totals = {};
  (await fs.getDocs(fs.collection(db, "items"))).forEach((d) => { totals[d.id] = d.data().pledged || 0; });
  document.querySelectorAll(".gift").forEach((card) => {
    const pledged = totals[itemKey(card.querySelector(".gift-name").textContent)] || 0;
    if (!pledged || card.classList.contains("purchased")) return;
    const { needed } = readCard(card.querySelector(".gift-btn"));
    if (pledged >= needed) return card.classList.add("purchased");
    const small = card.querySelector(".gift-price small");
    if (small && needed > 1) small.textContent = small.textContent.replace(/\d+ needed/, needed - pledged + "/" + needed + " needed");
  });
}
if (configured) applyTotals().catch((err) => console.warn("Could not load pledged totals", err));

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".gift .gift-btn");
  if (!btn || !configured || !dialog.showModal) return;
  e.preventDefault();
  openPledge(btn);
});
dialog.addEventListener("click", (e) => { if (e.target === dialog || e.target.closest("[data-close]")) dialog.close(); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(form);
  if (f.get("website")) return dialog.close(); // honeypot: real visitors never see this field
  const quantity = current.needed > 1 ? Number(f.get("quantity")) || 1 : 1;
  const amount = current.unit !== null ? current.unit * quantity : Number(f.get("amount")) || 0;
  const submit = form.querySelector("[type=submit]");
  submit.disabled = true;
  try {
    const { fs, db } = await getDb();
    const pledge = { item: current.item, quantity, amount, name: f.get("name").trim(), email: f.get("email").trim(), createdAt: fs.serverTimestamp() };
    await fs.addDoc(fs.collection(db, "pledges"), pledge);
    form.hidden = true;
    show("Thank you. Your pledge has been received, and we will be in touch about how to complete your gift. Gassho.");
  } catch (err) {
    console.error(err);
    show("Sorry, something went wrong. Please try again, or email info@zencare.org.", true);
    submit.disabled = false;
  }
});
})();
