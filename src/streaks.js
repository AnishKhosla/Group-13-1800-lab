import { onAuthReady } from "/src/authentication.js";
import { db } from "/src/firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DAY_MS = 24 * 60 * 60 * 1000;

export function dateKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

function daysBetween(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

export function nextStreak({ streakCount = 0, lastVisit = null }, today) {
  if (lastVisit === today) {
    return { streakCount, lastVisit: today };                       
  }
  if (lastVisit && daysBetween(lastVisit, today) === 1) {
    return { streakCount: streakCount + 1, lastVisit: today };      
  }
  return { streakCount: 1, lastVisit: today };                      
}

export async function updateStreak(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? snap.data() : {};
  const today = dateKey();

  const next = nextStreak(current, today);

  
  if (next.streakCount !== current.streakCount || next.lastVisit !== current.lastVisit) {
    await setDoc(ref, next, { merge: true });
  }
  return next.streakCount;
}

export function showStreak() {
  onAuthReady(async (user) => {
    if (!user) return; // main.js already redirects logged-out visitors to index.html

    const el = document.getElementById("streak-count");
    if (!el) return;

    try {
      const count = await updateStreak(user.uid);
      el.textContent = String(count).padStart(2, "0");

      const rangeEl = document.getElementById("streak-range");
      if (rangeEl) rangeEl.textContent = `${count} / 100`;
    } catch (err) {
      console.error("Streak update failed:", err); // page still renders with the placeholder
    }
  });
}
showStreak();