# Zen Center Practice Registry

A single static page that lists practice items the zen center is raising money for, in the style of a wedding registry. Open `index.html` in a browser to see it. There is no build step or framework. A small `registry.js` handles the pledge form.

## Files

| Path | What it is |
|---|---|
| `index.html` | The page. Each item is one `<article class="gift">` card. |
| `images/nyzc-icon.png` | The NYZC mark shown on the pledge dialog (from zencare.org). |
| `registry.js` | The pledge form dialog and Firestore save. |
| `firebase/` | Firestore rules and the Cloud Function that writes pledges to the Sheet. |
| `styles.css` | All styles. Brand colors and fonts are defined as variables at the top. |
| `fonts/` | Nexa Book (regular) and Nexa XBold (headings and prices). |
| `images/` | One photo per item, 800×1000 (4:5), already cut out onto a shared soft background. `background.jpg` is that background on its own, used behind placeholder cards. |

## Editing items

Each card follows the same structure:

```html
<article class="gift">
  <div class="gift-photo has-photo fill"><img src="images/zaniku-cushion.jpg" alt="Zaniku cushion"></div>
  <div class="gift-body">
    <h2 class="gift-name">Zaniku cushion</h2>
    <p class="gift-note">The cushion that rests on top of the bowing mat.</p>
    <div class="gift-foot">
      <div class="gift-price">$988.29<small>optional line, e.g. "$79 each · 25 needed"</small></div>
      <a class="gift-btn" href="mailto:...">Give this gift</a>
      <span class="gift-thanks">Offered with thanks</span>
    </div>
  </div>
</article>
```

- **Items without a price** use `<div class="gift-price tbd">Price coming soon<small>Give any amount</small></div>`.
- **Items without a photo** drop the `has-photo fill` classes and point the `img` at a temporary placeholder image (none are in use right now).
- **New photos** look best at 4:5 on the same background. `images/background.jpg` can be reused for that.

## Marking an item as offered

Add the class `purchased` to the card:

```html
<article class="gift purchased">
```

This greys out the photo and text, strikes through the price, hides the button and puts an "Offered" label on the photo and shows a gold "Offered with thanks" line. Remove the class to undo it. Currently marked as offered: Altar, Avalokiteshvara Statue, Dokusan stool, Haishiki bowing mat, Ihai tablets (Eihei Dogen, Keizan Jokin, Sankai-Banrei-tou), Reception stool, Shoji screens and Zaniku cushion.

## Pledges (Firebase to Google Sheet)

"Give this gift" opens a pledge form. `registry.js` saves each pledge to Firestore (project `nyzc-registry`), and the Cloud Function in `firebase/functions/index.js` appends it as a row to the Google Sheet. The form reads the item name, price and "N needed" from the card itself.

Until `apiKey` and `appId` are filled in at the top of `registry.js` (Firebase console, Project settings, Your apps), the buttons fall back to the mailto links below.

One-time setup:

1. Upgrade the Firebase project to the Blaze plan, create a Firestore database, and enable the Google Sheets API.
2. Create a Sheet whose first tab has the header row `Timestamp | Item | Quantity | Amount | Name | Email`.
3. Share the Sheet with `645953910857-compute@developer.gserviceaccount.com` as Editor.
4. In `firebase/functions`, run `npm install`, then from `firebase/` run `firebase deploy --only firestore:rules,functions`. It asks for `SHEET_ID`, the long ID in the Sheet's URL.

A pledge whose Sheet row failed stays in Firestore without `sheetRowAppended: true`. Firestore rules (`firebase/firestore.rules`) let the page create pledges but never read them.

## Donate buttons

Without Firebase configured, each "Give this gift" button is a `mailto:` link to info@zencare.org with the subject "Practice Registry: Interested in Donating {item name}". Swap the links if the center moves to an online donation form such as Give Lively. Give Lively allows only one embedded widget per page.

## Brand

- Main colors: purple `#79345D`, red `#B70D12`, gold `#CC9C22`
- Accent colors: blue `#1473BC`, white `#FFFFFF`, black `#000000`
- The page supports light and dark mode through `prefers-color-scheme`. Both palettes are at the top of `styles.css`.
- Nexa is a commercial typeface. Please confirm that the center's license covers web use before publishing, or convert the fonts to WOFF2 under that license.

## Source data

Item names and prices come from the "Practice Items Registry" Google Sheet. The sheet is the reference if anything here looks out of date.
