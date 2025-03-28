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