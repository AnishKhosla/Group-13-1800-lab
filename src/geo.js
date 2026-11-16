console.log("geo.js loaded");
const geolocReplaced = document.getElementById("geoloc");
const geolocAskButton = document.getElementById("getGeolocButton");

// The Settings page saves the "Location Tracking" switch as "on" / "off" in localStorage.
// Only ask the browser for the location when the user has turned tracking on.
const trackingOn = localStorage.getItem("locationTracking") === "on";

if (geolocReplaced) { // pages without a #geoloc element do nothing
  if (!trackingOn) {
    geolocReplaced.innerHTML = 'Location tracking is off. You can turn it on in <a href="settings.html">Settings</a>.';
  } else if (geolocAskButton != null) {
    geolocAskButton.addEventListener("click", getLocation);
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
