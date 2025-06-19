import { Component, ElementRef, HostListener, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Category } from '../../../shared/model/category.model';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

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
export class FilterMovieComponent implements OnInit, OnChanges, OnDestroy {
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

  @Input() categories: Category[] = [];
  categoriesData: { value: string, name: string }[] = [];

  @Output() filterChange = new EventEmitter<any>();

  // Thêm biến cho ô search
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  isSearching: boolean = false;

  constructor(private elRef: ElementRef, private translateService: TranslateService) {}

  ngOnInit(): void {
    // categoriesData will now be populated in ngOnChanges
    this.logSelectedFilters();
    
    // Setup live search with debounce
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500), // Wait 500ms after user stops typing
      distinctUntilChanged() // Only emit if value has changed
    ).subscribe(searchTerm => {
      this.searchQuery = searchTerm;
      this.isSearching = true;
      this.search();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categories'] && changes['categories'].currentValue) {
      this.categoriesData = this.categories.map(cat => ({
        value: String(cat.id),
        name: cat.name
      }));
    }
  }

  ngOnDestroy(): void {
    // Cleanup subscription to prevent memory leaks
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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
      this.selectedFilters.categories.clear();
    } else {
      this.selectedFilters.categories.clear();
      this.selectedFilters.categories.add(categoryValue);
    }
    this.logSelectedFilters();
    this.search();
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

  // Thêm method cho live search
  onSearchInput(event: any): void {
    const searchTerm = event.target.value;
    this.isSearching = true;
    this.searchSubject.next(searchTerm);
  }

  // Thêm method để clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.searchSubject.next('');
  }

  search() {
    const filter = {
      search: this.searchQuery,
      categories: Array.from(this.selectedFilters.categories),
      year: this.selectedFilters.year,
      sort_by: this.selectedFilters.sort,
      sort_order: this.selectedFilters.sort ? 'desc' : undefined,
      status: this.selectedFilters.status,
      search_priority: this.searchQuery ? 'relevance' : undefined,
      relevance_sort: this.searchQuery ? true : undefined,
    };
    console.log('Filter to search:', filter);
    this.filterChange.emit(filter);
    // Reset searching state after a short delay
    setTimeout(() => {
      this.isSearching = false;
    }, 100);
  }
}
