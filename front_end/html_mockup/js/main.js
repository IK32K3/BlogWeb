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
window.onscroll = function() {
    const backToTopButton = document.getElementById('back-to-top');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        backToTopButton.classList.remove('hidden');
    } else {
        backToTopButton.classList.add('hidden');
    }
};

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

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


    // Danh sách thể loại từ ảnh
    const categories = [
       "Đời sống", "Thể thao", "Khoa học", "Công nghệ", " Kinh Doanh", 
        , "Phiêu Lưu", "Hài Hước", "Học Đường", "Lịch Sử", "Kinh Dị", "Bí Ẩn", "Game", "Viễn Tưởng",
        "Ngôn Tình", "Nấu Ăn","Phát Triển Bản Thân"
    ];

    const categoryContainer = document.getElementById('category-container');
    const categorySearch = document.getElementById('category-search');

    // Hiển thị tất cả thể loại
    function displayCategories() {
        categoryContainer.innerHTML = '';
        
        const searchTerm = categorySearch.value.toLowerCase();
        
        categories.forEach((category, index) => {
            if (category.toLowerCase().includes(searchTerm)) {
                const container = document.createElement('div');
                container.className = 'filter-container';
                container.innerHTML = `
                    <input type="checkbox" id="category-${index}" class="custom-checkbox">
                    <label for="category-${index}" class="filter-label">
                        <span>${category}</span>
                    </label>
                `;
                categoryContainer.appendChild(container);
            }
        });
    }

    // Hiển thị tất cả thể loại ban đầu
    displayCategories();

    // Tìm kiếm thể loại khi người dùng nhập
    categorySearch.addEventListener('input', displayCategories);

// document.addEventListener('DOMContentLoaded', function() {
//             // Tab switching functionality
//             const tabs = document.querySelectorAll('[data-tab]');
//             tabs.forEach(tab => {
//                 tab.addEventListener('click', function(e) {
//                     e.preventDefault();
                    
//                     // Remove active class from all tabs
//                     tabs.forEach(t => {
//                         t.classList.remove('active');
//                         t.classList.remove('text-blue-600');
//                         t.classList.add('text-gray-600');
//                     });
                    
//                     // Add active class to clicked tab
//                     this.classList.add('active', 'text-blue-600');
//                     this.classList.remove('text-gray-600');
                    
//                     // Hide all tab contents
//                     document.querySelectorAll('.tab-content').forEach(content => {
//                         content.classList.add('hidden');
//                         content.classList.remove('active');
//                     });
                    
//                     // Show selected tab content
//                     const tabId = this.getAttribute('data-tab') + 'Tab';
//                     document.getElementById(tabId).classList.remove('hidden');
//                     document.getElementById(tabId).classList.add('active');
//                 });
//             });

//             // Like button functionality
//             document.querySelectorAll('.like-btn').forEach(btn => {
//                 btn.addEventListener('click', function() {
//                     const likeCount = this.querySelector('.like-count');
//                     const currentLikes = parseInt(likeCount.textContent);
//                     const isLiked = this.classList.contains('text-blue-600');
                    
//                     if (isLiked) {
//                         this.classList.remove('text-blue-600');
//                         likeCount.textContent = currentLikes - 1;
//                         this.querySelector('i').classList.replace('fas', 'far');
//                     } else {
//                         this.classList.add('text-blue-600');
//                         likeCount.textContent = currentLikes + 1;
//                         this.querySelector('i').classList.replace('far', 'fas');
//                     }
//                 });
//             });

//             // Edit profile button
//             const editProfileBtn = document.getElementById('editProfileBtn');
//             editProfileBtn.addEventListener('click', function() {
//                 alert('Edit profile functionality would open a modal or form here.');
//                 // In a real implementation, this would open a modal or redirect to an edit page
//             });

//             // Delete post functionality
//             document.querySelectorAll('.delete-btn').forEach(btn => {
//                 btn.addEventListener('click', function() {
//                     if (confirm('Are you sure you want to delete this post?')) {
//                         const postCard = this.closest('.post-card');
//                         postCard.style.opacity = '0';
//                         setTimeout(() => {
//                             postCard.remove();
//                         }, 300);
//                     }
//                 });
//             });

//             // Edit post functionality
//             document.querySelectorAll('.edit-btn').forEach(btn => {
//                 btn.addEventListener('click', function() {
//                     const postContent = this.closest('.post-card').querySelector('p.text-gray-700');
//                     const currentText = postContent.textContent;
//                     const newText = prompt('Edit your post:', currentText);
                    
//                     if (newText !== null && newText !== currentText) {
//                         postContent.textContent = newText;
//                     }
//                 });
//             });
//         });

