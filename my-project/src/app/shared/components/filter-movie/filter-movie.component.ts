import { Component, ElementRef, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

interface FilterItem {
  value: string;
  name: string;
}

interface CategoryApiResponse {
  data: { categories: { id: string; name: string; slug: string }[] };
}

@Component({
  selector: 'app-filter-movie',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './filter-movie.component.html',
  styleUrls: ['./filter-movie.component.css'],
})
export class FilterMovieComponent implements OnInit {
  yearsData: FilterItem[] = [
    { value: '2025', name: '2025' }, { value: '2024', name: '2024' },
    { value: '2023', name: '2023' }, { value: '2022', name: '2022' },
    { value: '2021', name: '2021' }, { value: '2020', name: '2020' },
    { value: '2019', name: '2019' }, { value: '2018', name: '2018' },
    { value: '1111', name: 'Trước 2014' }
  ];

  // State for which sections are open
  sectionsOpen: { [key: string]: boolean } = {
    category: false,
    year: false,
    sort: false,
    status: false
  };

  // Selected filter values
  selectedFilters = {
    categories: new Set<string>(),
    year: null as string | null,
    sort: null as 'views' | 'comments' | null,
    status: null as string | null,
  };

  categoriesData: { value: string, name: string }[] = [];

  @Output() filterChange = new EventEmitter<any>();

  // Thêm biến cho ô search
  searchQuery: string = '';

  constructor(private elRef: ElementRef, private categoryService: CategoryService, private translateService: TranslateService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.logSelectedFilters();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (res: CategoryApiResponse) => {
        this.categoriesData = (res.data.categories || []).map((cat) => {
          const translatedName = this.translateService.instant('category.' + cat.slug);
          return {
            value: cat.id,
            name: translatedName === 'category.' + cat.slug ? cat.name : translatedName
          };
        });
      },
      error: () => {
        this.categoriesData = [];
      }
    });
  }

  isAnySectionOpen(): boolean {
    return Object.values(this.sectionsOpen).some(isOpen => isOpen);
  }

  tabs: ('category' | 'year' | 'sort' | 'status')[] = ['category', 'year', 'sort', 'status'];
  
  toggleSection(tab: 'category' | 'year' | 'sort' | 'status'): void {
    this.sectionsOpen[tab] = !this.sectionsOpen[tab];
  }

  selectCategory(categoryValue: string): void {
    if (this.selectedFilters.categories.has(categoryValue)) {
      this.selectedFilters.categories.delete(categoryValue);
    } else {
      this.selectedFilters.categories.add(categoryValue);
    }
    this.logSelectedFilters();
  }

  selectYear(yearValue: string): void {
    this.selectedFilters.year = this.selectedFilters.year === yearValue ? null : yearValue;
    this.logSelectedFilters();
  }

  selectSort(value: 'views' | 'comments'): void {
    this.selectedFilters.sort = this.selectedFilters.sort === value ? null : value;
    this.logSelectedFilters();
  }

  selectStatus(value: string): void {
    this.selectedFilters.status = this.selectedFilters.status === value ? null : value;
    this.logSelectedFilters();
  }

  isFilterActive(type: 'category' | 'year' | 'sort' | 'status', value: string): boolean {
    switch (type) {
      case 'category':
        return this.selectedFilters.categories.has(value);
      case 'year':
        return this.selectedFilters.year === value;
      case 'sort':
        return this.selectedFilters.sort === value;
      case 'status':
        return this.selectedFilters.status === value;
      default:
        return false;
    }
  }

  logSelectedFilters(): void {
    console.clear();
    console.log('Selected Angular Filters:', {
      categories: Array.from(this.selectedFilters.categories),
      year: this.selectedFilters.year,
      sort: this.selectedFilters.sort,
      status: this.selectedFilters.status,
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target) && this.isAnySectionOpen()) {
      Object.keys(this.sectionsOpen).forEach(key => {
        this.sectionsOpen[key] = false;
      });
    }
  }

  search() {
    const filter = {
      search: this.searchQuery,
      categories: Array.from(this.selectedFilters.categories),
      year: this.selectedFilters.year,
      sort_by: this.selectedFilters.sort,
      sort_order: this.selectedFilters.sort ? 'desc' : undefined,
      status: this.selectedFilters.status,
    };
    console.log('Filter to search:', filter);
    this.filterChange.emit(filter);
  }
}
