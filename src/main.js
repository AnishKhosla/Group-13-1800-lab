// main.js: ONLY loaded by main.html (the logged-in page).
// Bootstrap + global styles come from app.js, which every page loads.
import { onAuthReady } from "/src/authentication.js";

function showName() {
    // Pass a CALLBACK function to run when Firebase finishes checking login status
    onAuthReady(function (user) { // Firebase passes the user object (or null)
        if (user) {
            // User is logged in
            const name = user.displayName || user.email; // Use email if name is missing
            const nameEl = document.getElementById("name-goes-here");
            if (nameEl) nameEl.textContent = name + "!";
        } else {
            // User is NOT logged in, so send them to the welcome page
            location.href = "index.html";
        }
    });
}

showName();