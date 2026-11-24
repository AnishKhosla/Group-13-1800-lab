// src/currency.js
// ------------------------------------------------------------
// Coins, the store and the inventory all live on the user's Firestore document:
//
//   users/{uid}
//     coins:     number                       (missing = 0)
//     inventory: ['hat-1', 'bg-2', ...]       ids from cosmeticsCatalog.js
//     equipped:  { background: id|null, hat: id|null }
//
// (streakCount and lastVisit are already on this document from streaks.js.)
// ------------------------------------------------------------
import { db } from '/src/firebaseConfig.js';
import { waitForUser } from '/src/users.js';
import { doc, getDoc, setDoc, increment, runTransaction } from 'firebase/firestore';
import { priceOf } from '/src/cosmeticsCatalog.js';

// ---- Earning rules ----
export const COINS_PER_ACTIVITY = 10;

// Coins for reaching day N of a streak:
//   days 1-10 -> 1, days 11-20 -> 5, days 21-30 -> 10, day 31+ -> 15
export function streakReward(day) {
  if (!day || day < 1) return 0;
  if (day <= 10) return 1;
  if (day <= 20) return 5;
  if (day <= 30) return 10;
  return 15;
}

const userRef = (uid) => doc(db, 'users', uid);

// For pages that need a login: sends logged-out visitors to the welcome page.
export async function requireUser() {
  const user = await waitForUser();
  if (!user) {
    location.href = 'index.html';
    return null;
  }
  return user;
}

// ---- Reading ----
export async function getWallet(uid) {
  const snap = await getDoc(userRef(uid));
  const data = snap.exists() ? snap.data() : {};
  return {
    coins: data.coins ?? 0,
    streakCount: data.streakCount ?? 0, // picks which evolution of the pet the previews show
    inventory: Array.isArray(data.inventory) ? data.inventory : [],
    equipped: {
      background: data.equipped?.background ?? null,
      hat: data.equipped?.hat ?? null,
    },
  };
}

// ---- Writing ----
export async function addCoins(uid, amount) {
  // increment() adds on the server, so it can't overwrite coins earned elsewhere.
  await setDoc(userRef(uid), { coins: increment(amount) }, { merge: true });
}

// Buys an item. Runs as a transaction so two tabs can't spend the same coins twice.
// Resolves to { ok: true, coins } or { ok: false, reason: 'owned' | 'funds', coins }
export function purchaseItem(uid, item) {
  const ref = userRef(uid);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists() ? snap.data() : {};
    const coins = data.coins ?? 0;
    const inventory = Array.isArray(data.inventory) ? data.inventory : [];

    if (inventory.includes(item.id)) return { ok: false, reason: 'owned', coins };
    const price = priceOf(item);
    if (coins < price) return { ok: false, reason: 'funds', coins };

    tx.set(ref, { coins: coins - price, inventory: [...inventory, item.id] }, { merge: true });
    return { ok: true, coins: coins - price };
  });
}

// itemId = null takes the cosmetic off.
export async function setEquipped(uid, type, itemId) {
  await setDoc(userRef(uid), { equipped: { [type]: itemId } }, { merge: true });
}

// ---- Small UI helpers ----
export function showCoinBalance(coins) {
  document.querySelectorAll('[data-coin-balance]').forEach((el) => {
    el.textContent = String(coins);
  });
}

let toastTimer = null;
export function showToast(message) {
  let toast = document.getElementById('coinToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'coinToast';
    toast.className = 'coin-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  // restart the fade-in even if a previous toast is still showing
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
