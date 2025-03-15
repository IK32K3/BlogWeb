export default class Tables {
    constructor() {
      this.searchInputs = document.querySelectorAll('input[id="search"]');
      this.filterSelects = document.querySelectorAll('select[id^="category"], select[id^="language"], select[id^="role"], select[id^="status"], select[id^="post"], select[id^="date-range"]');
      
      this.init();
    }
    
    init() {
      this.initSearch();
      
      this.initFilters();
      
      this.initActions();
    }
    
    initSearch() {
      this.searchInputs.forEach(searchInput => {
        if (!searchInput) return;
        
        searchInput.addEventListener('keyup', (e) => {
          const searchValue = e.target.value.toLowerCase();
          const table = searchInput.closest('.card').querySelector('table');
          
          if (!table) return;
          
          const rows = table.querySelectorAll('tbody tr');
          
          rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            
            if (text.includes(searchValue)) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        });
      });
    }
    
    initFilters() {
      this.filterSelects.forEach(select => {
        if (!select) return;
        
        select.addEventListener('change', () => {
          const filterValue = select.value.toLowerCase();
          const filterType = select.id;
          const table = select.closest('.container-fluid').querySelector('table');
          
          if (!table) return;
          
          const rows = table.querySelectorAll('tbody tr');
          
          rows.forEach(row => {
            if (!filterValue) {
              row.style.display = '';
              return;
            }
            
            let cellToCheck;
            let cellValue;
            
            switch (filterType) {
              case 'category':
                cellToCheck = row.querySelector('td:nth-child(2)');
                break;
              case 'language':
                cellToCheck = row.querySelector('td:nth-child(4)');
                break;
              case 'role':
                cellToCheck = row.querySelector('td:nth-child(3)');
                break;
              case 'status':
                cellToCheck = row.querySelector('td:nth-child(4)');
                break;
              case 'post':
                cellToCheck = row.querySelector('.text-muted small');
                break;
              case 'date-range':
                this.handleDateRangeFilter(row, filterValue);
                return;
              default:
                cellToCheck = null;
            }
            
            if (!cellToCheck) {
              row.style.display = '';
              return;
            }
            
            cellValue = cellToCheck.textContent.toLowerCase();
            
            if (cellValue.includes(filterValue)) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        });
      });
    }
    
    handleDateRangeFilter(row, filterValue) {
      row.style.display = '';
    }
    
    initActions() {
      const deleteButtons = document.querySelectorAll('.action-icon.delete');
      deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          if (confirm('Bạn có chắc chắn muốn xóa mục này?')) {
            const row = button.closest('tr');
            if (row) row.style.display = 'none';
          }
        });
      });
      
      const powerButtons = document.querySelectorAll('.action-icon.power-on, .action-icon.power-off');
      powerButtons.forEach(button => {
        button.addEventListener('click', () => {
          const row = button.closest('tr');
          const statusCell = row?.querySelector('td:nth-child(4)');
          const statusBadge = statusCell?.querySelector('.badge-status');
          
          if (statusBadge) {
            if (statusBadge.classList.contains('badge-active')) {
              statusBadge.classList.remove('badge-active');
              statusBadge.classList.add('badge-inactive');
              statusBadge.textContent = 'Không hoạt động';
              
              button.classList.remove('power-off');
              button.classList.add('power-on');
            } else {
              statusBadge.classList.remove('badge-inactive');
              statusBadge.classList.add('badge-active');
              statusBadge.textContent = 'Hoạt động';
              
              button.classList.remove('power-on');
              button.classList.add('power-off');
            }
          }
        });
      });
    }
  }