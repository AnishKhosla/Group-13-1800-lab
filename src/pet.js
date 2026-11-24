import { onAuthReady } from "/src/authentication.js";
import { db } from "/src/firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { applyCosmetics } from "/src/petAvatar.js";


export const PET_STAGES = [
  { at: 0,   image: "images/charmander.png", name: "Hatchling", hatTop: 13 },
  { at: 10,  image: "images/charmeleon.png", name: "Sprout",    hatTop: 4  },
  { at: 50,  image: "images/charizard.png", name: "Stalwart",  hatTop: 15 },
  { at: 100, image: "images/charizard-gigantamax.png", name: "Radiant", hatTop: 0 },
];

export function stageFor(count = 0) {
  let stage = PET_STAGES[0];
  for (const s of PET_STAGES) if (count >= s.at) stage = s;
  return stage;
}


export function daysToNextStage(count = 0) {
  const next = PET_STAGES.find((s) => s.at > count);
  return next ? next.at - count : 0;
}

export function showPet() {
  onAuthReady((user) => {
    if (!user) return; 

    onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        const count = snap.exists() ? (snap.data().streakCount ?? 0) : 0;
        const stage = stageFor(count);

        document.querySelectorAll("[data-pet-image]").forEach((img) => {
          img.src = stage.image;
          img.alt = stage.name;
        });
        // Background + hat the user has equipped (bought in the store, equipped in the inventory)
        const equipped = snap.exists() ? (snap.data().equipped ?? {}) : {};
        document.querySelectorAll("[data-pet-frame]").forEach((frame) => {
          applyCosmetics(frame, equipped, stage);
        });
        document.querySelectorAll("[data-pet-name]").forEach((el) => {
          el.textContent = stage.name;
        });
        document.querySelectorAll("[data-pet-streak]").forEach((el) => {
          el.textContent = String(count);
        });
      },
      (err) => console.error("Pet listener failed:", err)
    );
  });
}

showPet();