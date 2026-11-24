import { onAuthReady } from "/src/authentication.js";
import { db } from "/src/firebaseConfig.js";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { streakReward, showToast } from "/src/currency.js";

/* TEST SWITCH — set to false to go back to one streak per calendar day */
const TEST_MODE = true;
const TEST_STEP_MS = 1_000; 

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


// Updates the streak AND pays the streak coins in one transaction, so opening the page in
// two tabs at once can't pay the same day twice. Returns { streakCount, reward }.
export async function updateStreak(userId) {
  const ref = doc(db, "users", userId);
  const today = dateKey();

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data() : {};
    const next = nextStreak(current, today);

    if (next.streakCount === current.streakCount && next.lastVisit === current.lastVisit) {
      return { streakCount: next.streakCount, reward: 0 };
    }

    // Coins are paid for reaching a NEW streak day, not for opening the app again today
    const reward = current.lastVisit === today ? 0 : streakReward(next.streakCount);
    tx.set(ref, { ...next, coins: (current.coins ?? 0) + reward }, { merge: true });
    return { streakCount: next.streakCount, reward };
  });
}


// TEST_MODE only: adds one streak day (and that day's coins) every TEST_STEP_MS
async function bumpStreak(userId) {
  const ref = doc(db, "users", userId);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data() : {};
    const streakCount = (current.streakCount ?? 0) + 1;
    const reward = streakReward(streakCount);

    tx.set(
      ref,
      { streakCount, lastVisit: dateKey(), coins: (current.coins ?? 0) + reward },
      { merge: true }
    );
    return { streakCount, reward };
  });
}

function startTestClock(userId) {
  let inFlight = false;

  const tick = async () => {
    if (inFlight) return;          
    inFlight = true;
    try {
      paintStreak((await bumpStreak(userId)).streakCount);
    } catch (err) {
      console.error("Streak tick failed:", err);
    } finally {
      inFlight = false;
    }
  };

  return setInterval(tick, TEST_STEP_MS);
}

export function paintStreak(count) {
  const el = document.getElementById("streak-count");
  if (el) el.textContent = String(count).padStart(2, "0");

  const rangeEl = document.getElementById("streak-range");
  if (rangeEl) rangeEl.textContent = `${count} / 100`;
}

export function showStreak() {
  onAuthReady(async (user) => {
    if (!user) return;
    try {
      if (TEST_MODE) {
        const snap = await getDoc(doc(db, "users", user.uid));
        paintStreak(snap.exists() ? (snap.data().streakCount ?? 0) : 0);
        startTestClock(user.uid);
      } else {
        const { streakCount, reward } = await updateStreak(user.uid);
        paintStreak(streakCount);
        if (reward > 0) {
          showToast(`Day ${streakCount} streak bonus: +${reward} coin${reward === 1 ? "" : "s"}`);
        }
      }
    } catch (err) {
      console.error("Streak update failed:", err);
    }
  });
}

showStreak();