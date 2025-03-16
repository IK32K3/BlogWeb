document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar', '/webblog/front-end/html-mockup/components/navbar.html');
    loadComponent('footer', '/webblog/front-end/html-mockup/components/footer.html');
});

function loadComponent(selector, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(selector).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (window.scrollY > 200) {
        backToTopButton.classList.remove('hidden');
    } else {
        backToTopButton.classList.add('hidden');
    }
});
