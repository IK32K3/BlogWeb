document.addEventListener('DOMContentLoaded',function () {
    function loadComponent(id, url) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            
        })
        .catch(error => console.error('Error loading component:', error));
}
    loadComponent('navbar', '/frontend/html-mockup/components/navbar.html');
    loadComponent('footer', '/frontend/html-mockup/components/footer.html');
    loadComponent('navbar-guest', '/frontend/html-mockup/components/navbar-guest.html');
});

