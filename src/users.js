// src/users.js
// ------------------------------------------------------------
// Shared helpers for the "users" collection in Firestore.
//
// users/{uid}                -> PUBLIC info other signed-in users can see:
//                               displayName, searchName, streakCount, lastVisit, activeActivities
// users/{uid}/private/settings -> PRIVATE info only the owner can read:
//                               phone, mobile, address, locationTracking, notifications
// ------------------------------------------------------------

import { db } from "/src/firebaseConfig.js";
import { onAuthReady } from "/src/authentication.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

// Resolves with the logged-in user (or null) once Firebase has finished checking.
export function waitForUser() {
  return new Promise((resolve) => {
    const stop = onAuthReady((user) => {
      stop();
      resolve(user);
    });
  });
}

// Saves the user's public name so they can be found by the search box.
// searchName is a lowercase copy used for case-insensitive prefix search.
// Safe to call on every page load (merge: true never wipes other fields like the streak).
export async function saveUserProfile(user, nameOverride) {
  const displayName = (nameOverride ?? user.displayName ?? user.email ?? "").trim();
  await setDoc(
    doc(db, "users", user.uid),
    { displayName, searchName: displayName.toLowerCase() },
    { merge: true }
  );
}

// Stores how many activities (unfinished tasks on activities.html) the user is working on,
// so people who follow them can see the number.
export async function setActiveActivities(count) {
  const user = await waitForUser();
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), { activeActivities: count }, { merge: true });
}

// Finds users whose name starts with `term` (case-insensitive). Leaves out `myUid`.
// Returns [{ uid, displayName, streakCount, lastVisit, activeActivities }, ...]
export async function searchUsers(term, myUid) {
  const t = term.trim().toLowerCase();
  if (!t) return [];

  const q = query(
    collection(db, "users"),
    where("searchName", ">=", t),
    where("searchName", "<=", t + "\uf8ff"),
    limit(11) // 11 so we still have 10 left after removing ourselves
  );
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.id !== myUid)
    .map((d) => ({ uid: d.id, ...d.data() }))
    .slice(0, 10);
}

// Looks up several users by id. Returns a Map of uid -> user data.
// A user whose document is missing still gets an entry so they can be unfollowed.
export async function getUsersByIds(ids) {
  const snaps = await Promise.all(ids.map((id) => getDoc(doc(db, "users", id))));
  const map = new Map();
  snaps.forEach((snap, i) => {
    map.set(ids[i], snap.exists() ? { uid: ids[i], ...snap.data() } : { uid: ids[i], displayName: "Unknown user" });
  });
  return map;
}

// ---- Streak display ----------------------------------------------------------
// The stored streak only changes when a person opens the app, so someone who
// stopped visiting would still show their old number. This shows 0 once they
// have missed a full day (same rule streaks.js uses to reset a streak).
function dayNumber(key) {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

function todayKey() {
  const n = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

export function liveStreak({ streakCount = 0, lastVisit = null } = {}) {
  if (!lastVisit) return 0;
  return dayNumber(todayKey()) - dayNumber(lastVisit) <= 1 ? streakCount : 0;
}
