// my logic for following:
//   - search for a person by name (prefix match)
//   - follow / unfollow them
//   - list everyone you follow with their streak and number of activities
//     (unfinished tasks from the activities page) they are working on

import { onAuthReady } from "/src/authentication.js";
import { searchUsers, getUsersByIds, liveStreak } from "/src/users.js";
import { followUser, unfollowUser, getFollowingIds } from "/src/follows.js";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchMessage = document.getElementById("searchMessage");
const searchResultsEl = document.getElementById("searchResults");
const followingListEl = document.getElementById("followingList");
const followingMessage = document.getElementById("followingMessage");
const followingCountEl = document.getElementById("followingCount");

let me = null;                    
let followingIds = new Set();     
let followingUsers = new Map();   
let lastResults = [];             

function buildPersonCard(person) {
  const isFollowing = followingIds.has(person.uid);

  const card = document.createElement("div");
  card.className = "card mb-2";

  const body = document.createElement("div");
  body.className = "card-body d-flex align-items-center justify-content-between gap-3";

  const info = document.createElement("div");
  const name = document.createElement("div");
  name.className = "fw-bold";
  name.textContent = person.displayName || "Unnamed user";
  const stats = document.createElement("div");
  stats.className = "text-muted small";
  stats.textContent =
    `Streak: ${liveStreak(person)} day(s) \u00B7 Activities in progress: ${person.activeActivities ?? 0}`;
  info.append(name, stats);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = isFollowing ? "btn btn-sm btn-outline-secondary" : "btn btn-sm btn-primary";
  btn.textContent = isFollowing ? "Unfollow" : "Follow";
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      if (isFollowing) {
        await unfollowUser(me.uid, person.uid);
        followingIds.delete(person.uid);
        followingUsers.delete(person.uid);
      } else {
        await followUser(me.uid, person.uid);
        followingIds.add(person.uid);
        followingUsers.set(person.uid, person);
      }
      renderAll();
    } catch (err) {
      console.error("Follow/unfollow failed:", err);
      btn.disabled = false;
      followingMessage.textContent = "Something went wrong. Please try again.";
    }
  });

  body.append(info, btn);
  card.appendChild(body);
  return card;
}

function renderSearchResults() {
  searchResultsEl.replaceChildren(...lastResults.map(buildPersonCard));
}

function renderFollowingList() {
  const people = [...followingUsers.values()].sort((a, b) =>
    (a.displayName || "").localeCompare(b.displayName || "")
  );
  followingCountEl.textContent = String(people.length);
  followingMessage.textContent = people.length ? "" : "You aren't following anyone yet. Search for a name above.";
  followingListEl.replaceChildren(...people.map(buildPersonCard));
}

function renderAll() {
  renderSearchResults();
  renderFollowingList();
}

async function loadFollowing() {
  try {
    const ids = await getFollowingIds(me.uid);
    followingIds = new Set(ids);
    followingUsers = await getUsersByIds(ids);
    renderFollowingList();
  } catch (err) {
    console.error("Could not load following list:", err);
    followingMessage.textContent = "Could not load your following list.";
  }
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const term = searchInput.value.trim();
  if (!term) {
    lastResults = [];
    searchMessage.textContent = "";
    renderSearchResults();
    return;
  }
  searchMessage.textContent = "Searching...";
  try {
    lastResults = await searchUsers(term, me.uid);
    searchMessage.textContent = lastResults.length ? "" : `No one found starting with "${term}".`;
    renderSearchResults();
  } catch (err) {
    console.error("Search failed:", err);
    searchMessage.textContent = "Search failed. Please try again.";
  }
});

onAuthReady((user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }
  me = user;
  loadFollowing();
});
