console.log("geo.js loaded");
const geolocReplaced = document.getElementById("geoloc");
const geolocAskButton = document.getElementById("getGeolocButton");

if (geolocAskButton!= null) {
    geolocAskButton.addEventListener("click",getLocation());
} else {
    getLocation();
}



function getLocation() {
  if (navigator.geolocation) {
    console.log("geoloc working...");
    navigator.geolocation.getCurrentPosition(showPosition);
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