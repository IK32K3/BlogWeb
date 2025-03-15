import Sidebar from './components/sidebar.js';
import Modal from './components/modal.js';
import Tables from './components/tables.js';
import Dropdown from './components/dropdown.js';

import '../css/style.css';

document.addEventListener('DOMContentLoaded', () => {
  includeHTML();
  
  window.addEventListener('load', () => {
    new Sidebar();
    new Modal();
    new Tables();
    new Dropdown();
    initForms();
  });
});

function initForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
      
      alert('Thao tác đã được thực hiện thành công!');

      const modal = form.closest('.modal');
      if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
      }
      
      form.reset();
    });
  });
}