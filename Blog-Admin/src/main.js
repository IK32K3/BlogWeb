// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import our custom CSS
import './assets/css/style.css';

// Import our custom JS
import './assets/js/script.js';

// Component loader
document.addEventListener('DOMContentLoaded', () => {
  // Load components
  const components = document.querySelectorAll('[data-inject]');
  
  components.forEach(component => {
    const path = component.getAttribute('data-inject');
    
    fetch(path)
      .then(response => response.text())
      .then(html => {
        component.innerHTML = html;
        
        // Re-initialize scripts that might be in the loaded component
        const scripts = component.querySelectorAll('script');
        scripts.forEach(script => {
          const newScript = document.createElement('script');
          if (script.src) {
            newScript.src = script.src;
          } else {
            newScript.textContent = script.textContent;
          }
          document.body.appendChild(newScript);
        });
      })
      .catch(error => {
        console.error('Error loading component:', path, error);
      });
  });

  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});