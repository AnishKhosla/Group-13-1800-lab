// src/cosmeticsCatalog.js
// ------------------------------------------------------------
// The list of everything that can be bought in the store.
//
// >>> PARTNER: this is the file to edit when you design the real items. <<<
//
// Each item looks like:
//   { id: 'hat-1', type: 'hat', name: 'Hat 1', image: null, color: '#e74c3c' }
//
//   id      Unique and PERMANENT. It is what gets saved in Firestore when someone
//           buys the item. If you rename an id later, people who already bought it
//           lose it, so pick a final id and keep it (e.g. 'hat-wizard').
//   type    'background' or 'hat'
//   name    What the store / inventory shows
//   image   Path to your artwork, e.g. '/images/cosmetics/hat-wizard.png'.
//           Leave as null to use the placeholder.
//           - hats: use a PNG with a transparent background
//           - backgrounds: any image (it is stretched to cover the pet frame)
//   color   Placeholder only (used while image is null).
//           backgrounds: any CSS background (color or gradient), hats: a hex color
//   price   Optional. Leave it out to use the default for the type (see PRICES).
// ------------------------------------------------------------

// Default price (in coins) for each kind of cosmetic.
export const PRICES = {
  background: 100,
  hat: 60,
};

export const TYPE_LABELS = {
  background: 'Backgrounds',
  hat: 'Hats',
};

// Draws a simple placeholder top hat in the given color (no image file needed).
function placeholderHat(color) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70">` +
    `<rect x="26" y="6" width="48" height="44" rx="4" fill="${color}"/>` +
    `<rect x="26" y="36" width="48" height="9" fill="rgba(0,0,0,0.28)"/>` +
    `<rect x="8" y="48" width="84" height="12" rx="6" fill="${color}"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CATALOG = [
  // ---- Backgrounds (placeholders) ----
  { id: 'bg-1', type: 'background', name: 'Background 1', image: null, color: 'linear-gradient(135deg, #ffd6e0, #ffb3c6)' },
  { id: 'bg-2', type: 'background', name: 'Background 2', image: null, color: 'linear-gradient(135deg, #c9f0ff, #8fd3f4)' },
  { id: 'bg-3', type: 'background', name: 'Background 3', image: null, color: 'linear-gradient(135deg, #d4f8d4, #8fe3a3)' },
  { id: 'bg-4', type: 'background', name: 'Background 4', image: null, color: 'linear-gradient(135deg, #ffe9b3, #ffc766)' },

  // ---- Hats (placeholders) ----
  { id: 'hat-1', type: 'hat', name: 'Hat 1', image: null, color: '#e74c3c' },
  { id: 'hat-2', type: 'hat', name: 'Hat 2', image: null, color: '#3498db' },
  { id: 'hat-3', type: 'hat', name: 'Hat 3', image: null, color: '#2ecc71' },
  { id: 'hat-4', type: 'hat', name: 'Hat 4', image: null, color: '#9b59b6' },
];

// ------------------------------------------------------------
// Helpers (no need to edit below this line)
// ------------------------------------------------------------
export function getItem(id) {
  return CATALOG.find((item) => item.id === id) || null;
}

export function itemsOfType(type) {
  return CATALOG.filter((item) => item.type === type);
}

export function priceOf(item) {
  return item.price ?? PRICES[item.type];
}

// CSS value for the `background` property of a background item.
export function backgroundCss(item) {
  if (item.image) return `center / cover no-repeat url("${item.image}")`;
  return item.color;
}

// <img src> for a hat item.
export function hatSrc(item) {
  return item.image || placeholderHat(item.color);
}
