const categories = [
    "Đời sống", "Thể thao", "Khoa học", "Công nghệ", " Kinh Doanh", 
     , "Phiêu Lưu", "Hài Hước", "Học Đường", "Lịch Sử", "Kinh Dị", "Bí Ẩn", "Game", "Viễn Tưởng",
     "Ngôn Tình", "Nấu Ăn","Phát Triển Bản Thân"
 ];

 const categoryContainer = document.getElementById('category-container');
 const categorySearch = document.getElementById('category-search');
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
 displayCategories();
 categorySearch.addEventListener('input', displayCategories);