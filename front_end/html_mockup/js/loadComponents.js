document.addEventListener("DOMContentLoaded", function () {
    function loadComponent(selector, file, callback) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element ${selector} not found.`);
            return;
        }

        fetch(file)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then((data) => {
                element.innerHTML = data;
                if (callback) callback();
            })
            .catch((error) => console.error(`Error loading ${file}:`, error));
    }

    // Đảm bảo đường dẫn chính xác
    loadComponent("#navbar", "../../components/NavBar.html");  
    loadComponent("#footer", "../../components/Footer.html");
    loadComponent("#navbar-introduce", "../../components/NavBar-introduce.html");   
});
