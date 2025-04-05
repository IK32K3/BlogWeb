// Mobile menu toggle

const mobileMenuButton = document.getElementById('mobileMenuButton');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');

mobileMenuButton.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth < 1024 && !sidebar.contains(e.target) && e.target !== mobileMenuButton) {
        sidebar.classList.add('-translate-x-full');
    }
});

// User dropdown toggle
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');

userMenuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    userDropdown.classList.toggle('hidden', isExpanded);
    userMenuButton.setAttribute('aria-expanded', !isExpanded);
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && e.target !== userMenuButton) {
        userDropdown.classList.add('hidden');
        userMenuButton.setAttribute('aria-expanded', 'false');
    }
});

// Close on Esc key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        userDropdown.classList.add('hidden');
        userMenuButton.setAttribute('aria-expanded', 'false');
    }
});
