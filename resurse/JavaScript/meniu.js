// Continutul fisierului menu.js
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const menuList = document.querySelector('.menu-list');

    hamburgerBtn.addEventListener('click', () => {
        menuList.classList.toggle('is-open');
        const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true' || false;
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    });
});

// Închide meniul când dăm click pe un link (pentru mobil)
document.querySelectorAll('.menu-list a').forEach(link => {
    link.addEventListener('click', () => {
        // Verificăm dacă suntem pe mobil
        if (window.getComputedStyle(hamburgerBtn).display !== 'none') {
            menuList.classList.remove('is-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    });
});