// Import Firebase authentication tools
import { logoutUser, onAuthReady } from '/src/authentication.js';

class SiteNavbar extends HTMLElement {

    // connectedCallback runs when <site-navbar> is added to the page.
    // (Safer than the constructor, which shouldn't touch the element's children.)
    connectedCallback() {
        this.renderNavbar();
        this.renderAuthControls(); // Adds either a Log in or Log out button, depending on login status
    }

    renderNavbar() {
        // Highlight the link for the page we're currently on
        const path = window.location.pathname;
        const isActive = (file) => (path.endsWith(file) ? 'active' : '');

        this.innerHTML = `
                  <nav class="navbar navbar-expand-lg navbar-light bg-light" aria-label="top-level">
            <nav class="navbar fixed-bottom navbar-light bg-light" aria-label="mid-level">
          <a class="navbar-brand" href="#"></a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto">
                <li class="nav-item active">
                  <a class="nav-link" href="#"><img src="images/image.png" alt=""></a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#"><img src="images/shopping-basket.png" alt=""></a>
                </li>
                <li>
                <div class="dropup">
                  <button class="btn btn-secondary dropdown-toggle" type="button" id="triggerId" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="images/Minimalist_info_Icon.png" alt="">
                  </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item" href="#">Action</a>
                  <a class="dropdown-item" href="#">Action</a>
                </div>
                </div>
                </li>
                <li class="nav-item">
                  <a class="nav-link disabled" href="#"><img src="images/4989372.png" alt=""></a>
                </li>
              </ul>
            </div>
            <a class="navbar-brand" href="#"><img src="images/6522516.png" alt=""></a>
          </nav>
          </nav>
        `;
    }

    /**
     * Displays a Log in or Log out button in the navbar based on Firebase authentication status.
     * Updates automatically when the user's login status changes.
     */
    renderAuthControls() {
        const authControls = this.querySelector('#authControls');
        const homeLinks = this.querySelectorAll('[data-home]');

        // Invisible placeholder prevents layout shifting while Firebase checks login status
        authControls.innerHTML = `<div class="btn btn-outline-secondary" style="visibility: hidden; min-width: 80px;">Log out</div>`;

        // Runs when Firebase reports the login status (user object, or null)
        onAuthReady((user) => {
            if (user) {
                // Logged in: Home goes to the logged-in main page, and show a Log out button
                homeLinks.forEach((a) => (a.href = 'main.html'));

                authControls.innerHTML = `<button class="btn btn-outline-secondary" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;
                authControls.querySelector('#signOutBtn').addEventListener('click', logoutUser);
            } else {
                // Not logged in: Home goes to the welcome page, and show a Log in button
                homeLinks.forEach((a) => (a.href = 'index.html'));

                authControls.innerHTML = `<a class="btn btn-outline-primary" id="loginBtn" href="login.html" style="min-width: 80px;">Log in</a>`;
            }
        });
    }
}

customElements.define('site-navbar', SiteNavbar);