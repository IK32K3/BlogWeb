export default class Dropdown {
    constructor() {
      this.dropdownToggles = document.querySelectorAll('.dropdown-toggle');
      
      this.init();
    }
    
    init() {
      if (this.dropdownToggles) {
        this.dropdownToggles.forEach(toggle => {
          toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdownMenu = toggle.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
              dropdownMenu.classList.toggle('show');
            }
          });
        });
      }
    }
  }