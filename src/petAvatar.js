// src/petAvatar.js
// ------------------------------------------------------------
// Draws the pet's cosmetics:
//   background -> fills the frame behind the pet
//   hat        -> overlaid on the top middle of the pet picture
//
// A "frame" is any element with the pet picture inside it:
//   <div class="pet-avatar" data-pet-frame> <img data-pet-image ...> </div>
// pet.js keeps the picture itself up to date (it changes as the streak grows) and
// calls applyCosmetics() so the frame always shows what the user has equipped.
// ------------------------------------------------------------
import { getItem, backgroundCss, hatSrc } from '/src/cosmeticsCatalog.js';

/**
 * Sets the background and hat on a frame. Leaves the pet <img> inside it alone.
 * @param {HTMLElement} frame
 * @param {{background?: string|null, hat?: string|null}} equipped  item ids
 * @param {{hatTop?: number}} [stage]  the pet's current stage (see PET_STAGES in pet.js)
 */
export function applyCosmetics(frame, equipped = {}, stage = {}) {
  const background = getItem(equipped?.background);
  const hat = getItem(equipped?.hat);

  frame.classList.add('pet-avatar');
  frame.style.background = background?.type === 'background' ? backgroundCss(background) : '';

  let hatImg = frame.querySelector(':scope > .pet-avatar__hat');
  if (hat?.type !== 'hat') {
    if (hatImg) hatImg.remove();
    return;
  }
  if (!hatImg) {
    hatImg = document.createElement('img');
    hatImg.className = 'pet-avatar__hat';
    frame.appendChild(hatImg);
  }
  hatImg.src = hatSrc(hat);
  hatImg.alt = hat.name;
  // each pet picture has a different amount of empty space above its head
  hatImg.style.setProperty('--hat-top', `${stage?.hatTop ?? 0}%`);
}

/**
 * Builds a whole pet (picture + cosmetics) inside `el`. Used by the store and inventory
 * previews, where pet.js isn't managing the picture.
 * @param {HTMLElement} el
 * @param {{background?: string|null, hat?: string|null}} equipped
 * @param {{image: string, name?: string, hatTop?: number}} stage  from stageFor() in pet.js
 */
export function renderPetAvatar(el, equipped, stage) {
  const img = document.createElement('img');
  img.className = 'pet-avatar__img';
  img.src = stage.image;
  img.alt = stage.name || 'Pet';
  el.replaceChildren(img);
  applyCosmetics(el, equipped, stage);
}
