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
  } else if (geolocSetHome) {
    geolocSetHome.addEventListener("click", setHome);
  } else {
    getLocation();
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
  if (navigator.geolocation) {
    console.log("geoloc loading...");
    navigator.geolocation.getCurrentPosition(setLocation,returnError);
  } else {
    alert("Geolocation is not supported by this browser");
    return null;
  }
}

/*These functions are seperate because they're entirely for the purpose of returning the values instead of displaying them*/ 

export async function setLocation() {
  location.longitude = position.coords.longitude,
  location.latitude = position.coords.latitude;
  setDoc(doc(db, 'users', currentUser.uid), 
  {"longitude": location["longitude"],
  "latitude": location["latitude"]}, {merge: true});
  console.log("Location recorded")
}

export async function returnPosition() {
  /* sets the global object 'location's values to the longitude and latitude of the current location */
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function () {
    location.longitude = position.coords.longitude;
    location.latitude = position.coords.latitude;
    },returnError)
  } else {
    alert("Geolocation is not supported by this browser")
  }
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