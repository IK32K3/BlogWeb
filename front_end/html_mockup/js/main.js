let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');

function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const href = this.getAttribute('href');
        document.body.classList.add('fade-leave-active');
        setTimeout(() => {
            window.location.href = href;
        }, 500);
    });
});

window.addEventListener('load', () => {
    document.body.classList.add('fade-enter-active');
});

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

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    dropdown.classList.toggle('hidden');
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    const mobileMenu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    mobileMenu.classList.toggle('hidden');
}

document.querySelectorAll('.tag-button').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('active-tag');
    });
});

CKEDITOR.replace('content');

function deletePost(button) {
    const postItem = button.closest('.post-item');
    postItem.remove();
}

function hidePost(button) {
    const postItem = button.closest('.post-item');
    postItem.classList.add('hidden');
}

function toggleForgetPassword() {
    const forgetPasswordSection = document.getElementById('forget-password');
    forgetPasswordSection.classList.toggle('hidden');
}

window.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdown');
    if (!dropdown.contains(e.target) && !e.target.matches('button')) {
        dropdown.classList.add('hidden');
    }
});

// Add search functionality
document.getElementById('search-input').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = ''; // Clear previous results

    if (query.length > 0) {
        // Simulate search results
        const results = [
            'Search Result 1',
            'Search Result 2',
            'Search Result 3'
        ].filter(item => item.toLowerCase().includes(query));

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'px-4 py-2 text-gray-700 hover:bg-gray-100';
            resultItem.textContent = result;
            searchResults.appendChild(resultItem);
        });

        searchResults.classList.remove('hidden');
    } else {
        searchResults.classList.add('hidden');
    }
    
});
function toggleMenu() {
    let menu = document.getElementById("menu");
    menu.classList.toggle("hidden"); // Hiển thị / Ẩn menu khi click
}

function toggleDropdown() {
    let dropdown = document.getElementById("dropdown");
    dropdown.classList.toggle("hidden"); // Hiển thị / Ẩn dropdown Profile
}

// Đóng menu khi click bên ngoài
document.addEventListener("click", function (event) {
    let menu = document.getElementById("menu");
    let mobileMenuBtn = document.getElementById("mobile-menu-button");

    if (!menu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        menu.classList.add("hidden");
    }
});

function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordButton = document.getElementById('toggle-password');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        passwordButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordField.type = 'password';
        passwordButton.innerHTML = '<i class="fas fa-eye"></i>';
    }
}
