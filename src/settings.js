// my logic for settings.html
//
// Where each setting is saved:
//   Full name = Firebase Auth displayName + users/{uid} (so search and following show it)
//   Phone/Mobile/Address = users/{uid}/private/settings (only the owner can read it)
//   Location tracking = same private doc, plus localStorage "locationTracking" (on/off)
//                          so geo.js can read it instantly on every page
//   Notifications = same private doc, plus localStorage "notifications" (on/off)
//                          Only the preference is saved; nothing sends notifications yet.
// Email is shown but read-only (changing a login email needs re-authentication in Firebase)

import { onAuthReady } from "/src/authentication.js";
import { db } from "/src/firebaseConfig.js";
import { saveUserProfile } from "/src/users.js";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const fullNameEl = document.getElementById("fullName");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const mobileEl = document.getElementById("mobile");
const addressEl = document.getElementById("address");
const locationToggle = document.getElementById("locationToggle");
const locationLabel = document.getElementById("locationToggleLabel");
const notificationsToggle = document.getElementById("notificationsToggle");
const notificationsLabel = document.getElementById("notificationsToggleLabel");
const saveBtn = document.getElementById("saveSettingsBtn");
const alertEl = document.getElementById("settingsAlert");

let currentUser = null;
let alertTimeout;

function showAlert(message, type) {
  alertEl.textContent = message;
  alertEl.className = `alert alert-${type}`;
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => alertEl.classList.add("d-none"), 5000);
}

function updateToggleLabels() {
  locationLabel.textContent = locationToggle.checked ? "On" : "Off";
  notificationsLabel.textContent = notificationsToggle.checked ? "On" : "Off";
}

function settingsRef(uid) {
  return doc(db, "users", uid, "private", "settings");
}

function setLocal(key, isOn) {
  try {
    localStorage.setItem(key, isOn ? "on" : "off");
  } catch (err) {
    console.warn("Could not write localStorage:", err);
  }
}

async function loadSettings(user) {
  fullNameEl.value = user.displayName || "";
  emailEl.value = user.email || "";

  locationToggle.checked = localStorage.getItem("locationTracking") === "on";
  notificationsToggle.checked = localStorage.getItem("notifications") === "on";
  updateToggleLabels();

  try {
    const snap = await getDoc(settingsRef(user.uid));
    if (snap.exists()) {
      const data = snap.data();
      phoneEl.value = data.phone ?? "";
      mobileEl.value = data.mobile ?? "";
      addressEl.value = data.address ?? "";
      locationToggle.checked = !!data.locationTracking;
      notificationsToggle.checked = !!data.notifications;
      setLocal("locationTracking", locationToggle.checked);
      setLocal("notifications", notificationsToggle.checked);
      updateToggleLabels();
    }
  } catch (err) {
    console.error("Could not load settings:", err);
    showAlert("Could not load your saved settings.", "danger");
  }
}

async function saveSettings() {
  const name = fullNameEl.value.trim();
  if (!name) {
    showAlert("Please enter your full name.", "danger");
    fullNameEl.focus();
    return;
  }

  saveBtn.disabled = true;
  try {
    if (name !== currentUser.displayName) {
      await updateProfile(currentUser, { displayName: name });
    }
    await saveUserProfile(currentUser, name);

    await setDoc(
      settingsRef(currentUser.uid),
      {
        phone: phoneEl.value.trim(),
        mobile: mobileEl.value.trim(),
        address: addressEl.value.trim(),
        locationTracking: locationToggle.checked,
        notifications: notificationsToggle.checked,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setLocal("locationTracking", locationToggle.checked);
    setLocal("notifications", notificationsToggle.checked);

    showAlert("Settings saved!", "success");
  } catch (err) {
    console.error("Saving settings failed:", err);
    showAlert("Could not save your settings. Please try again.", "danger");
  } finally {
    saveBtn.disabled = false;
  }
}

locationToggle.addEventListener("change", () => {
  updateToggleLabels();
  if (locationToggle.checked && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      () => {},
      () => showAlert("Your browser blocked location access. Allow it in the browser's site settings for tracking to work.", "warning")
    );
  }
});
notificationsToggle.addEventListener("change", updateToggleLabels);
saveBtn.addEventListener("click", saveSettings);

onAuthReady((user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }
  currentUser = user;
  loadSettings(user);
});
