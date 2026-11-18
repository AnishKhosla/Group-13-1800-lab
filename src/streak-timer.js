import { db } from '/src/firebaseConfig.js';
import { doc, setDoc, collection, getDoc, getDocs } from 'firebase/firestore';
import { returnLocation } from '/src/geo.js';
import { onAuthReady } from '/src/authentication.js';

let startStreak = document.getElementById('startStreak');
startStreak.addEventListener('click', startTime);
const trackingOn = localStorage.getItem('locationTracking') === 'on';
let time = new Date();

currentUser = null;

/*I couldn't use getLocation from geo.js without changing it, so i changed it. the version
that returns the value instead of changing the file is returnLocation. */

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
      let time = Date();
      let hours = time.getHours();
      let minutes = time.getMinutes();
    }
  } else {
    alert("Tracking is disabled in settings. You can turn it on in Home > Settings > Location Tracking.")
  }
}
async function checkDistance () { // this needs to be changed, this was just a placeholder that was eventually shifted to geo.js
  let curLoc = returnLocation();
  const dbLoc = setDoc(doc(db, 'users', currentUser), 
  {"longitude": curLoc["longitude"]},
  {"latitude": curLoc["latitude"]}, {merge: true});
}
