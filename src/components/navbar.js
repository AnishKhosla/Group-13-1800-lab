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
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="index.html" data-home>REHABO</a>

                <button class="navbar-toggler" type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link ${isActive('main.html')}" href="index.html" data-home>Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Pets</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${isActive('info.html')}" href="info.html">Info</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#">Settings</a>
                        </li>
                    </ul>

                    <!-- Login / Logout button gets placed here -->
                    <div id="authControls" class="d-flex"></div>
                </div>
            </div>
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