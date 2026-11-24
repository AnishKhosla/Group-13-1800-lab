import { db } from '/src/firebaseConfig.js';
import { doc, setDoc, collection, getDoc, getDocs } from 'firebase/firestore';
import { returnPosition,} from '/src/geo.js';
import { onAuthReady } from '/src/authentication.js';

const startStreak = document.getElementById('startStreak');
startStreak.addEventListener('click', startTime);
const addStreak = document.getElementById("addStreak")
addStreak.addEventListener('click', incrementStreak)
const trackingOn = localStorage.getItem('locationTracking') === 'on';
const location = {"longitude":null, "latitude":null};

currentUser = null;

/*I couldn't use getLocation from geo.js without changing it, so i changed it. the version
that returns the value instead of changing the file is returnPosition. */

/*This module should be easy to use, but it'll take some time to test. implementing it is as easy as importing it and giving a few elements the id startStreak and endStreak. When the user clicks start streak, it'll store a date */

onAuthReady(function (user) {
  if (!user) {
    // didn't really know what to do if not logged in, so it just sends them to index.
    location.href = 'index.html';
  } else {
    currentUser = user;
  }
})

function startTime () { // should be triggered by pressing a button on probably the profile page
  if (trackingOn) { // see settings.js for where this comes from.
    if (checkDistance) {
      let time = new Date();
      localStorage.setItem("time", time.toISOString());
    } else {
      alert("You are too close to your home location!");
    }
  } else {
    alert("Tracking is disabled in settings. You can turn it on in Home > Settings > Location Tracking.");
  }
}

async function incrementStreak () {
  if (trackingOn) { // see settings.js for where this comes from.
    let oldTime = new Date(localStorage.getItem("time"));
    let newTime = new Date();

    let timeDiff = Math.abs( (oldTime.getHours() + oldTime.getMinutes() / 60) - (newTime.getHours() + newTime.getMinutes() / 60));
    // this whole line above sets timeDiff to the absolute difference between the old time and the new time. Absolute because if you started your timer after the 22nd hour, you would never be able to cash in the timer. This does mean that if you press the button at 23:59, you will be able to cash in the timer

    if (checkDistance() && (timeDiff >= 2 ||  newTime.getDay !== oldTime.getDay)) { 
    // if far enough away AND (more than two hours since timer started OR it's a different day)
      setDoc(doc(db, "users", currentUser.uid,), {"streakCount": increment(1)},{merge: true})
      localStorage.removeItem('time')
      } else {
        alert("You are either too close to your home location, or it hasn't been long enough!");
      }
  } else {
    alert("Tracking is disabled in settings. You can turn it on in Home > Settings > Location Tracking.");
  }
}

async function checkDistance () { // this needs to be changed, this was just a placeholder that was eventually shifted to geo.js
  await returnPosition()
  let curLat = location.latitude
  let curLon = location.longitude
  let homeLat = await getDoc(collection(db, "users", currentUser.uid, "latitude"));
  let homeLon = await getDoc(collection(db, "users", currentUser.uid, "longitude"));
  let mDist = getDistanceFromLatLonInKm(curLat,curLon,homeLat,homeLon) * 1000
  if (mDist >= 200) {
    return true
  } else {
    return false
  }
}

// Source for two functions below - https://stackoverflow.com/a/27943
// Posted by user1921, modified by community. See post 'Timeline' for change history
// Retrieved 2026-11-23, License - CC BY-SA 3.0

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
