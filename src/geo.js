import { useCallback } from "react";
import {onAuthReady} from "/src/authentication.js"
import {db} from "/src/firebaseconfig.js"
import { doc, setDoc, collection, getDoc, getDocs } from 'firebase/firestore';
const geolocReplaced = document.getElementById("geoloc");
const geolocAskButton = document.getElementById("getGeolocButton");
const geolocSetHome = document.getElementById("setGeoHome")

// The Settings page saves the "Location Tracking" switch as "on" / "off" in localStorage.
// Only ask the browser for the location when the user has turned tracking on.
const trackingOn = localStorage.getItem("locationTracking") === "on";
let currentUser = null;
const location = {"longitude":null, "latitude":null}

onAuthReady(function (user) {
  if (!user) {
    // didn't really know what to do if not logged in, so it just sends them to index.
    location.href = 'index.html'
  } else {
    currentUser = user
  }
})

if (geolocReplaced) { // pages without a #geoloc element do nothing
  if (!trackingOn) {
    geolocReplaced.innerHTML = 'Location tracking is off. You can turn it on in <a href="settings.html">Settings</a>.';
  } else if (geolocAskButton) {
    geolocAskButton.addEventListener("click", getLocation);
  } else {
    getLocation();
  }
  if (trackingOn && geolocSetHome) {
    geolocSetHome.addEventListener("click", setHome);
  }
}


function getLocation() {
  if (navigator.geolocation) {
    console.log("geoloc loading...");
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    geolocReplaced.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  geolocReplaced.innerHTML = "Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude;
  console.log("geoloc loaded");
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      geolocReplaced.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      geolocReplaced.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      geolocReplaced.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      geolocReplaced.innerHTML = "An unknown error occurred."
      break;
  }
}

async function setHome() {
  console.log("Setting Home");
  setLocation();
}

/*These functions are seperate because they're entirely for the purpose of returning the values instead of displaying them*/ 

export async function setLocation() {
  if (navigator.geolocation) {
    console.log("geoloc loading...");
    navigator.geolocation.getCurrentPosition(returnPosition,returnError);
  } else {
    alert("Geolocation is not supported by this browser");
    return null;
  }
}

async function returnPosition(position) {
  /* returns a 2-item object where "longitude" is the longitude and "latitude" is the latitude. */
  location.longitude = position.coords.longitude,
  location.latitude = position.coords.latitude;
  setDoc(doc(db, 'users', currentUser.uid), 
    {"longitude": location["longitude"],
    "latitude": location["latitude"]}, {merge: true});
  console.log("Location recorded")
}

function returnError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      result = "User denied the request for Geolocation.";
    case error.POSITION_UNAVAILABLE:
      result = "Location information is unavailable.";
    case error.TIMEOUT:
      result = "The request to get user location timed out.";
    case error.UNKNOWN_ERROR:
      result = "An unknown error occurred.";
  }
}