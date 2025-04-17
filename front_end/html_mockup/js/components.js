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
        function toggleMenu() {
            document.getElementById('menu').classList.toggle('hidden');
        } 
    })
    .catch(error => console.error("Lỗi tải navbar:", error));

    fetch('/front_end/html_mockup/components/hero-section.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('hero-section').innerHTML = data;
                const carousel = document.getElementById("carousel");
            const prevBtn = document.getElementById("prev");
            const nextBtn = document.getElementById("next");
            const dots = document.querySelectorAll(".dot");
            let index = 0;
            const totalSlides = carousel.children.length; // Ensure this matches the number of slides
            let interval;
        
            function updateCarousel() {
                carousel.style.transform = `translateX(-${index * 100}%)`;
                dots.forEach((dot, i) => {
                    dot.classList.toggle("bg-blue-500", i === index);
                    dot.classList.toggle("bg-gray-400", i !== index);
                });
            }
        
            function nextSlide() {
                index = (index + 1) % totalSlides;
                updateCarousel();
            }
        
            function prevSlide() {
                index = (index - 1 + totalSlides) % totalSlides;
                updateCarousel();
            }
        
            function setSlide(i) {
                index = i;
                updateCarousel();
            }
        
            nextBtn.addEventListener("click", nextSlide);
            prevBtn.addEventListener("click", prevSlide);
            dots.forEach((dot, i) => {
                dot.addEventListener("click", () => setSlide(i));
            });
        
            function startAutoSlide() {
                interval = setInterval(nextSlide, 3000); // Auto-slide every 3 seconds
            }
        
            function stopAutoSlide() {
                clearInterval(interval);
            }
        
            document.querySelector(".relative").addEventListener("mouseenter", stopAutoSlide);
            document.querySelector(".relative").addEventListener("mouseleave", startAutoSlide);
        
            // Initialize carousel
            updateCarousel();
            startAutoSlide();
            })
            .catch(error => console.error('Lỗi tải hero.html:', error));