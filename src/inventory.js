// src/inventory.js — ONLY loaded by inventory.html
import { requireUser, getWallet, setEquipped, showCoinBalance, showToast } from '/src/currency.js';
import { TYPE_LABELS, itemsOfType } from '/src/cosmeticsCatalog.js';
import { renderPetAvatar } from '/src/petAvatar.js';
import { stageFor } from '/src/pet.js';

const GRIDS = {
  background: document.getElementById('backgroundGrid'),
  hat: document.getElementById('hatGrid'),
};
const previewEl = document.getElementById('petPreview');

let uid = null;
let wallet = { coins: 0, streakCount: 0, inventory: [], equipped: { background: null, hat: null } };

function buildCard(item) {
  const isEquipped = wallet.equipped[item.type] === item.id;

  const col = document.createElement('div');
  col.className = 'col-6 col-md-4';

  const card = document.createElement('div');
  card.className = 'card shop-card h-100' + (isEquipped ? ' equipped' : '');

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
  button.className = 'btn btn-sm w-100 ' + (isEquipped ? 'btn-outline-secondary' : 'btn-primary');
  button.textContent = isEquipped ? 'Take off' : 'Equip';
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const next = isEquipped ? null : item.id;
      await setEquipped(uid, item.type, next);
      wallet.equipped[item.type] = next;
    } catch (err) {
      console.error('Could not save equipped item:', err);
      showToast("Couldn't save that. Try again.");
    }
    render();
  });

  body.append(name, button);
  card.append(preview, body);
  col.appendChild(card);
  return col;
}

function render() {
  renderPetAvatar(previewEl, wallet.equipped, stageFor(wallet.streakCount));

  Object.entries(GRIDS).forEach(([type, grid]) => {
    const owned = itemsOfType(type).filter((item) => wallet.inventory.includes(item.id));
    grid.replaceChildren();

    if (owned.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'col-12 text-muted';
      empty.innerHTML = `No ${TYPE_LABELS[type].toLowerCase()} yet. Get some in the <a href="store.html">Store</a>.`;
      grid.appendChild(empty);
      return;
    }
    owned.forEach((item) => grid.appendChild(buildCard(item)));
  });
}

async function init() {
  const user = await requireUser();
  if (!user) return;
  uid = user.uid;

  try {
    wallet = await getWallet(uid);
  } catch (err) {
    console.error('Could not load inventory:', err);
    showToast("Couldn't load your inventory. Refresh to try again.");
  }
  showCoinBalance(wallet.coins);
  render();
}

init();
