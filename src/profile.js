// src/profile.js
// ------------------------------------------------------------
// Logic for profile.html: shows how many people you follow, how many follow you,
// and the list of your followers (with their current streak).
// Name, streak and location are handled by main.js, streaks.js and geo.js.
// ------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { getUsersByIds, liveStreak } from "/src/users.js";
import { getFollowingIds, getFollowerIds } from "/src/follows.js";

const pad2 = (n) => String(n).padStart(2, "0");

async function showFollowStats(user) {
  try {
    const [followingIds, followerIds] = await Promise.all([
      getFollowingIds(user.uid),
      getFollowerIds(user.uid),
    ]);

    document.getElementById("following-count").textContent = pad2(followingIds.length);
    document.getElementById("followers-count").textContent = pad2(followerIds.length);

    const listEl = document.getElementById("followers-list");
    const emptyEl = document.getElementById("followers-empty");
    emptyEl.classList.toggle("d-none", followerIds.length > 0);

    const people = [...(await getUsersByIds(followerIds)).values()].sort((a, b) =>
      (a.displayName || "").localeCompare(b.displayName || "")
    );

    listEl.replaceChildren(
      ...people.map((person) => {
        const li = document.createElement("li");
        li.className = "py-1";
        const name = document.createElement("span");
        name.className = "fw-bold";
        name.textContent = person.displayName || "Unnamed user"; // textContent: names can't inject HTML
        const streak = document.createElement("span");
        streak.className = "text-muted small ms-2";
        streak.textContent = `Streak: ${liveStreak(person)} day(s)`;
        li.append(name, streak);
        return li;
      })
    );
  } catch (err) {
    console.error("Could not load followers:", err);
  }
}

onAuthReady((user) => {
  if (user) showFollowStats(user); // main.js already redirects logged-out visitors
});
