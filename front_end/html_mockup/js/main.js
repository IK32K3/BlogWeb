let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-item');

function showSlide(index) {
    if (slides.length === 0) return;
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

// Hiệu ứng chuyển trang mượt mà
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

// Nút quay lại đầu trang
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        backToTopButton.classList.toggle('hidden', window.scrollY <= 200);
    }
});

// Mở menu dropdown
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');

    const button = dropdown.previousElementSibling;
    if (button) {
        button.setAttribute('aria-expanded', dropdown.classList.contains('hidden') ? 'false' : 'true');
    }
}


// Mở menu chính
function toggleMenu() {
    const menu = document.getElementById('menu');
    if (!menu) return;
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
}

// Bật/tắt tag khi click
document.querySelectorAll('.tag-button').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('active-tag');
    });
});

// Khởi tạo CKEditor nếu phần tử tồn tại
if (document.getElementById('content')) {
    CKEDITOR.replace('content');
}

// Xóa bài viết
function deletePost(button) {
    const postItem = button.closest('.post-item');
    if (postItem) {
        postItem.remove();
    }
}

// Ẩn bài viết
function hidePost(button) {
    const postItem = button.closest('.post-item');
    if (postItem) {
        postItem.classList.add('hidden');
    }
}

// Mở form quên mật khẩu
function toggleForgetPassword() {
    const forgetPasswordSection = document.getElementById('forget-password');
    if (forgetPasswordSection) {
        forgetPasswordSection.classList.toggle('hidden');
    }
}

// Đóng dropdown khi click bên ngoài
window.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdown');
    const profileButton = document.querySelector('[onclick="toggleDropdown()"]');

    if (dropdown && profileButton && !dropdown.contains(event.target) && event.target !== profileButton) {
        dropdown.classList.add('hidden');
        profileButton.setAttribute('aria-expanded', 'false');
    }
});

// Tìm kiếm
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        searchResults.innerHTML = ''; // Xóa kết quả cũ

        if (query.length > 0) {
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
}

// Ẩn/hiện mật khẩu
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const passwordButton = document.getElementById('toggle-password');
    
    if (passwordField && passwordButton) {
        const isPassword = passwordField.type === 'password';
        passwordField.type = isPassword ? 'text' : 'password';
        passwordButton.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    }
}

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}


dropdownButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
});

document.addEventListener("click", (event) => {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.add("hidden");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var quill = new Quill('#editor', {
        theme: 'snow'
    });
});

// Drag and drop functionality
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('featuredImage');

dropArea.addEventListener('click', () => fileInput.click());

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropArea.classList.add('bg-gray-50');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('bg-gray-50');
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('bg-gray-50');
    const files = event.dataTransfer.files;
    fileInput.files = files;
});

fileInput.addEventListener('change', () => {
    // Handle file input change if needed
}); 

