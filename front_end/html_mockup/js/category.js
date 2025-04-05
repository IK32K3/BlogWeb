document.addEventListener('DOMContentLoaded', function() {

    // --- Navbar & Footer Loading (Giả định components.js làm việc này) ---
    // Ví dụ:
    // fetch('/path/to/navbar.html').then(res => res.text()).then(data => document.getElementById('navbar').innerHTML = data);
    // fetch('/path/to/footer.html').then(res => res.text()).then(data => document.getElementById('footer').innerHTML = data);
    // Hoặc nếu components.js đã xử lý thì không cần thêm ở đây.


    // --- Search Section Toggle ---
    const searchToggleButton = document.getElementById('search-toggle');
    const searchSection = document.getElementById('search-section');

    if (searchToggleButton && searchSection) {
        searchToggleButton.addEventListener('click', function() {
            const isActive = searchSection.classList.toggle('active');
            this.setAttribute('aria-expanded', isActive); // Cập nhật ARIA

            // Thay đổi icon và text của nút toggle
            if (isActive) {
                this.innerHTML = '<i class="fas fa-times mr-2"></i> Ẩn Tìm Kiếm';
                 this.classList.replace('bg-blue-600', 'bg-red-600'); // Đổi màu nút khi mở
                 this.classList.replace('hover:bg-blue-700', 'hover:bg-red-700');
            } else {
                this.innerHTML = '<i class="fas fa-sliders-h mr-2"></i> Tìm Kiếm Nâng Cao';
                this.classList.replace('bg-red-600', 'bg-blue-600');
                this.classList.replace('hover:bg-red-700', 'hover:bg-blue-700');
            }
        });
    } else {
        console.warn("Search toggle button or section not found.");
    }


    // --- Dynamic Category Loading & Filtering ---
    const categories = [
        "Đời sống", "Thể thao", "Khoa học", "Công nghệ", "Kinh Doanh",
        "Phiêu Lưu", "Hài Hước", "Học Đường", "Lịch Sử", "Kinh Dị",
        "Bí Ẩn", "Game", "Viễn Tưởng", "Ngôn Tình", "Nấu Ăn", "Phát Triển Bản Thân",
        "Âm nhạc", "Phim Ảnh", "Nghệ thuật", "Thời trang", "Làm đẹp" // Thêm ví dụ
    ].filter(cat => cat && typeof cat === 'string'); // Lọc bỏ phần tử không hợp lệ

    const categoryContainer = document.getElementById('category-container');
    const categorySearch = document.getElementById('category-search');

    function displayCategories() {
        if (!categoryContainer) return;

        categoryContainer.innerHTML = ''; // Xóa nội dung cũ
        const searchTerm = categorySearch ? categorySearch.value.toLowerCase().trim() : '';

        const fragment = document.createDocumentFragment(); // Dùng fragment để tối ưu

        categories.forEach((category, index) => {
             // Bỏ qua nếu category rỗng sau khi trim
            const trimmedCategory = category.trim();
            if (!trimmedCategory) return; 

            if (trimmedCategory.toLowerCase().includes(searchTerm)) {
                const container = document.createElement('div');
                container.className = 'filter-item'; // Class bao ngoài

                const categoryId = `category-${index}`;
                const categoryValue = trimmedCategory.toLowerCase().replace(/\s+/g, '-');

                // Sử dụng cấu trúc HTML mới cho filter item
                container.innerHTML = `
                    <input type="checkbox"
                           id="${categoryId}"
                           name="categories[]"
                           value="${categoryValue}"
                           class="hidden custom-checkbox">
                    <label for="${categoryId}" class="filter-label">
                        <span class="checkbox-visual">
                             <i class="fas fa-check check-icon"></i>
                        </span>
                        <span>${trimmedCategory}</span>
                    </label>
                `;
                fragment.appendChild(container);
            }
        });
        categoryContainer.appendChild(fragment); // Thêm tất cả một lần
    }

    if (categoryContainer && categorySearch) {
        displayCategories(); // Hiển thị ban đầu
        categorySearch.addEventListener('input', displayCategories); // Lọc khi gõ
    } else {
        console.warn("Category container or search input not found.");
    }


    // --- Filter Label Active State Handling (Đã bao gồm trong CSS mới) ---
    // Code JS cũ để thêm/xóa class 'active' không còn cần thiết
    // vì chúng ta đang sử dụng pseudo-class :checked của CSS để xử lý giao diện.
    // Bạn chỉ cần CSS đã cung cấp ở trên.

    // --- (Optional) Add any other JS logic needed for your page ---

});