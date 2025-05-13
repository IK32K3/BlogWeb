import { Component, ElementRef, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FilterItem {
  value: string;
  name: string;
}

@Component({
  selector: 'app-filter-movie',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-movie.component.html',
  styleUrls: ['./filter-movie.component.css'],
})
export class FilterMovieComponent implements OnInit {

  genresData: FilterItem[] = [
    { value: '1', name: 'Anime' }, { value: '2', name: 'Hành động' },
    { value: '3', name: 'Hài hước' }, { value: '4', name: 'Tình cảm' },
    { value: '5', name: 'Harem' }, { value: '6', name: 'Bí ẩn' },
    { value: '7', name: 'Bi kịch' }, { value: '8', name: 'Giả tưởng' },
    { value: '9', name: 'Học đường' }, { value: '10', name: 'Đời thường' },
    { value: '11', name: 'Võ thuật' }, { value: '12', name: 'Trò chơi' },
    { value: '13', name: 'Thám tử' }, { value: '14', name: 'Lịch sử' },
    { value: '15', name: 'Siêu năng lực' }, { value: '16', name: 'Shounen' },
    { value: '17', name: 'Shounen AI' }, { value: '18', name: 'Shoujo' },
    { value: '19', name: 'Shoujo AI' }, { value: '20', name: 'Thể thao' },
    { value: '21', name: 'Âm nhạc' }, { value: '22', name: 'Psychological' },
  ];

  yearsData: FilterItem[] = [
    { value: '2025', name: '2025' }, { value: '2024', name: '2024' },
    { value: '2023', name: '2023' }, { value: '2022', name: '2022' },
    { value: '2021', name: '2021' }, { value: '2020', name: '2020' },
    { value: '2019', name: '2019' }, { value: '2018', name: '2018' },
    { value: '1111', name: 'Trước 2014' }
  ];

  episodesData: FilterItem[] = [
    { value: '9999', name: 'Full' }, { value: '300', name: '300' },
    { value: '200', name: '200' }, { value: '100', name: '100' },
    { value: '50', name: '50' }, { value: '20', name: '20' },
    { value: '10', name: '10' }
  ];

  statusData: FilterItem[] = [
    { value: '0', name: 'Đang tiến hành' },
    { value: '1', name: 'Hoàn thành' }
  ];

  // State for which sections are open
  sectionsOpen: { [key: string]: boolean } = {
    genre: false,
    year: false,
    episodes: false,
    status: false
  };

  // Selected filter values
  selectedFilters = {
    genres: new Set<string>(), // Use Set for multi-select
    year: null as string | null,
    episodes: null as string | null,
    status: null as string | null,
  };

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {
    this.logSelectedFilters(); // Initial log
  }

  isAnySectionOpen(): boolean {
    return Object.values(this.sectionsOpen).some(isOpen => isOpen);
  }

  tabs: ('genre' | 'year' | 'episodes' | 'status')[] = ['genre', 'year', 'episodes', 'status'];
  
  toggleSection(tab: 'genre' | 'year' | 'episodes' | 'status'): void {
    this.sectionsOpen[tab] = !this.sectionsOpen[tab];
  }

  selectGenre(genreValue: string): void {
    if (this.selectedFilters.genres.has(genreValue)) {
      this.selectedFilters.genres.delete(genreValue);
    } else {
      this.selectedFilters.genres.add(genreValue);
    }
    this.logSelectedFilters();
  }

  selectYear(yearValue: string): void {
    this.selectedFilters.year = this.selectedFilters.year === yearValue ? null : yearValue;
    this.logSelectedFilters();
  }

  selectEpisodes(episodeValue: string): void {
    this.selectedFilters.episodes = this.selectedFilters.episodes === episodeValue ? null : episodeValue;
    this.logSelectedFilters();
  }

  selectStatus(statusValue: string): void {
    this.selectedFilters.status = this.selectedFilters.status === statusValue ? null : statusValue;
    this.logSelectedFilters();
  }

  isFilterActive(type: 'genre' | 'year' | 'episodes' | 'status', value: string): boolean {
    switch (type) {
      case 'genre':
        return this.selectedFilters.genres.has(value);
      case 'year':
        return this.selectedFilters.year === value;
      case 'episodes':
        return this.selectedFilters.episodes === value;
      case 'status':
        return this.selectedFilters.status === value;
      default:
        return false;
    }
  }

  logSelectedFilters(): void {
    console.clear();
    console.log("Selected Angular Filters:", {
      genres: Array.from(this.selectedFilters.genres),
      year: this.selectedFilters.year,
      episodes: this.selectedFilters.episodes,
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
}
