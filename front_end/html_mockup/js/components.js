fetch('/front_end/html_mockup/components/NavBar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar').innerHTML = data;

        // Add event listeners for dropdown functionality
        const dropdownButton = document.getElementById('dropdownButton');
        const dropdownMenu = document.getElementById('dropdownMenu');

        if (dropdownButton && dropdownMenu) {
            dropdownButton.addEventListener('click', () => {
                dropdownMenu.classList.toggle('hidden');
            });

            window.addEventListener('click', (event) => {
                if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                    dropdownMenu.classList.add('hidden');
                }
            });
        }
    });

fetch("/front_end/html_mockup/components/Footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer").innerHTML = data;
    })
    .catch(error => console.error("Lỗi tải footer:", error));

fetch("/front_end/html_mockup/components/NavBar-introduce.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("navbar-introduce").innerHTML = data;
    })
    .catch(error => console.error("Lỗi tải navbar:", error));

    fetch('/front_end/html_mockup/components/hero-section.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('hero-section').innerHTML = data;
            })
            .catch(error => console.error('Lỗi tải hero.html:', error));