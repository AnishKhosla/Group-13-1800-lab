// src/store.js — ONLY loaded by store.html
import { requireUser, getWallet, purchaseItem, showCoinBalance, showToast } from '/src/currency.js';
import { TYPE_LABELS, itemsOfType, priceOf } from '/src/cosmeticsCatalog.js';
import { renderPetAvatar } from '/src/petAvatar.js';
import { stageFor } from '/src/pet.js';

const GRIDS = {
  background: document.getElementById('backgroundGrid'),
  hat: document.getElementById('hatGrid'),
};

let uid = null;
let wallet = { coins: 0, streakCount: 0, inventory: [], equipped: {} };
const buttons = new Map(); // item id -> its Buy button

function buildCard(item) {
  const col = document.createElement('div');
  col.className = 'col-6 col-md-4';

  const card = document.createElement('div');
  card.className = 'card shop-card h-100';

  // Preview: the pet wearing this item
  const preview = document.createElement('div');
  preview.className = 'pet-avatar--thumb';
  renderPetAvatar(preview, { [item.type]: item.id }, stageFor(wallet.streakCount));

  const body = document.createElement('div');
  body.className = 'shop-card__body';

  const name = document.createElement('div');
  name.className = 'shop-card__name';
  name.textContent = item.name;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-sm w-100';
  button.addEventListener('click', () => buy(item));
  buttons.set(item.id, button);

  body.append(name, button);
  card.append(preview, body);
  col.appendChild(card);
  return col;
}

function refreshButtons() {
  buttons.forEach((button, id) => {
    const item = findItem(id);
    const price = priceOf(item);

    if (wallet.inventory.includes(id)) {
      button.className = 'btn btn-sm w-100 btn-outline-success';
      button.textContent = 'Owned';
      button.disabled = true;
    } else if (wallet.coins >= price) {
      button.className = 'btn btn-sm w-100 btn-primary';
      button.innerHTML = `Buy · <span class="coin-icon" aria-hidden="true"></span> ${price}`;
      button.disabled = false;
    } else {
      button.className = 'btn btn-sm w-100 btn-outline-secondary';
      button.innerHTML = `<span class="coin-icon" aria-hidden="true"></span> ${price}`;
      button.disabled = true;
      button.title = `You need ${price - wallet.coins} more coins`;
    }
  });
}

const allItems = Object.keys(TYPE_LABELS).flatMap((type) => itemsOfType(type));
const findItem = (id) => allItems.find((item) => item.id === id);

async function buy(item) {
  const button = buttons.get(item.id);
  button.disabled = true;
  try {
    const result = await purchaseItem(uid, item);
    wallet.coins = result.coins;
    if (result.ok || result.reason === 'owned') wallet.inventory.push(item.id);

    if (result.ok) showToast(`Bought ${item.name}!`);
    else if (result.reason === 'owned') showToast(`You already own ${item.name}.`);
    else showToast('Not enough coins.');
  } catch (err) {
    console.error('Purchase failed:', err);
    showToast("Couldn't complete the purchase. Try again.");
  }
  showCoinBalance(wallet.coins);
  refreshButtons();
}

async function init() {
  const user = await requireUser();
  if (!user) return;
  uid = user.uid;

  try {
    wallet = await getWallet(uid);
  } catch (err) {
    console.error('Could not load coins:', err);
    showToast("Couldn't load your coins. Refresh to try again.");
  }
  showCoinBalance(wallet.coins);

  // cards are built after the wallet loads so the previews use the pet's current stage
  Object.entries(GRIDS).forEach(([type, grid]) => {
    itemsOfType(type).forEach((item) => grid.appendChild(buildCard(item)));
  });
  refreshButtons();
}

init();
