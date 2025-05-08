import { Component ,AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavBarComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (dropdownButton && dropdownMenu) {
      dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hidden');
      });

      window.addEventListener('click', (event) => {
        if (!dropdownButton.contains(event.target as Node) && !dropdownMenu.contains(event.target as Node)) {
          dropdownMenu.classList.add('hidden');
        }
      });
    }
  }
}
