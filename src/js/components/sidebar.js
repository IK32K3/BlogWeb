export default class Sidebar {
    constructor() {
      this.sidebar = document.getElementById('sidebar');
      this.sidebarToggle = document.getElementById('sidebarToggle');
      this.closeSidebar = document.getElementById('closeSidebar');
      this.sidebarLinks = document.querySelectorAll('.sidebar-link');
      
      this.init();
    }
    
    init() {
      this.setActiveLink();
      
      if (this.sidebarToggle) {
        this.sidebarToggle.addEventListener('click', () => {
          this.sidebar.classList.toggle('show');
        });
      }
      
      if (this.closeSidebar) {
        this.closeSidebar.addEventListener('click', () => {
          this.sidebar.classList.remove('show');
        });
      }
    }
    
    setActiveLink() {
      const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
      
      this.sidebarLinks.forEach(link => {
        const linkPage = link.getAttribute('data-page');
        
        if ((currentPage === 'index' && linkPage === 'dashboard') || 
            (currentPage === linkPage)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }