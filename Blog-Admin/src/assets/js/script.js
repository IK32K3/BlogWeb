document.addEventListener('DOMContentLoaded', () => {
    const toggleSidebarBtn = document.querySelector('.toggle-sidebar-btn');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('main');
    const footer = document.querySelector('.footer');
  
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('toggled');
        main.classList.toggle('toggled');
        footer.classList.toggle('toggled');
      });
    }
  
    document.addEventListener('click', (e) => {
      if (
        !sidebar.contains(e.target) && 
        !toggleSidebarBtn.contains(e.target) && 
        sidebar.classList.contains('toggled') &&
        window.innerWidth <= 1199
      ) {
        sidebar.classList.remove('toggled');
        main.classList.remove('toggled');
        footer.classList.remove('toggled');
      }
    });
  
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const currentUrl = window.location.href;
    navLinks.forEach(link => {
      if (currentUrl.includes(link.getAttribute('href')) && 
          link.getAttribute('href') !== '#') {
        link.classList.add('active');
        const parentLi = link.closest('.nav-content-item');
        if (parentLi) {
          const parentNavLink = parentLi.querySelector('.nav-link');
          if (parentNavLink) {
            parentNavLink.classList.add('active');
          }
        }
      }
    });
  
    if (typeof $.fn.DataTable !== 'undefined') {
      $('.datatable').DataTable({
        responsive: true,
        lengthChange: false,
        autoWidth: false,
        language: {
          search: "_INPUT_",
          searchPlaceholder: "Search..."
        }
      });
    }
  
    initializeCharts();
  });
  
  function initializeCharts() {
    if (typeof Chart === 'undefined') return;
  
    const postsChartCanvas = document.getElementById('postsChart');
    if (postsChartCanvas) {
      const postsChart = new Chart(postsChartCanvas, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Posts',
            data: [65, 59, 80, 81, 56, 55, 40, 47, 52, 58, 62, 68],
            fill: false,
            borderColor: '#4154f1',
            tension: 0.1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  
    const categoryChartCanvas = document.getElementById('categoryChart');
    if (categoryChartCanvas) {
      const categoryChart = new Chart(categoryChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Technology', 'Travel', 'Food', 'Health', 'Others'],
          datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
              '#4154f1',
              '#2eca6a',
              '#ff771d',
              '#ffbf00',
              '#999999'
            ],
            hoverOffset: 4
          }]
        }
      });
    }
  }
  
  const confirmDelete = (event, message = 'Are you sure you want to delete this item?') => {
    if (!confirm(message)) {
      event.preventDefault();
      return false;
    }
    return true;
  };
  
  const validateForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return false;
  
    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;
  
    requiredInputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });
  
    return isValid;
  };
  
  const previewImage = (input, previewId) => {
    const preview = document.getElementById(previewId);
    if (!preview) return;
  
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  };