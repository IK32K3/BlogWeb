import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../shared/model/category.model';
import { ToastrService } from 'ngx-toastr';
import { HeaderAdminComponent } from '../../shared/components/header-admin/header-admin.component';
import { SlidebarAdminComponent } from '../../shared/components/slidebar-admin/slidebar-admin.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderAdminComponent,
    SlidebarAdminComponent
  ],
  templateUrl: './admin-categories.component.html',
  styleUrl: './admin-categories.component.css'
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {
  allCategories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  totalCategories = 0;
  itemsPerPage = 10;
  
  // Search and filter
  searchTerm = '';
  private searchSubject = new Subject<string>();
  
  // Bulk actions
  selectedCategories: number[] = [];
  selectAll = false;
  
  // Confirmation dialogs
  showDeleteConfirm = false;
  categoryToDelete: Category | null = null;
  
  // Add/Edit dialog
  showAddDialog = false;
  showEditDialog = false;
  selectedCategory: Category | null = null;
  
  // Forms
  categoryForm: FormGroup;
  
  // Math object for template
  Math = Math;
  
  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      slug: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.setupSearch();
    this.loadAllCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.applyFiltersAndPagination();
    });
  }

  loadAllCategories(): void {
    this.loading = true;
    this.categoryService.getAll({}).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.allCategories = response.data.categories.map((c: Category) => ({...c, selected: false})) || [];
        } else {
          this.allCategories = [];
        }
        this.applyFiltersAndPagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.toastr.error('Failed to load categories', 'Error');
        this.loading = false;
      }
    });
  }

  applyFiltersAndPagination(): void {
    let filteredData = [...this.allCategories];

    if (this.searchTerm) {
      const lowercasedTerm = this.searchTerm.toLowerCase();
      filteredData = filteredData.filter(category =>
        category.name.toLowerCase().includes(lowercasedTerm) ||
        (category.slug && category.slug.toLowerCase().includes(lowercasedTerm))
      );
    }

    this.totalCategories = filteredData.length;
    this.totalPages = Math.ceil(this.totalCategories / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredCategories = filteredData.slice(startIndex, endIndex);

    this.updateSelectAllState();
  }

  // Search functionality
  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Bulk selection
  toggleSelectAll(event: any): void {
    this.selectAll = event.target.checked;
    this.filteredCategories.forEach(category => {
      category.selected = this.selectAll;
    });
    this.updateSelectedCategories();
  }

  onCategorySelectedChange(): void {
    this.updateSelectedCategories();
    this.updateSelectAllState();
  }

  private updateSelectedCategories(): void {
    this.selectedCategories = this.allCategories
      .filter(category => category.selected)
      .map(category => category.id);
  }

  private updateSelectAllState(): void {
    if (this.filteredCategories.length === 0) {
      this.selectAll = false;
      return;
    }
    this.selectAll = this.filteredCategories.every(category => category.selected);
  }

  // Add category
  openAddDialog(): void {
    this.selectedCategory = null;
    this.categoryForm.reset();
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.categoryForm.reset();
  }

  addCategory(): void {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;

      // Check for <script> tag
      const hasScript = (str: string) => /<script[\s>]/i.test(str || '');
      if (
        hasScript(categoryData.name) ||
        hasScript(categoryData.slug)
      ) {
        this.toastr.error('Không được chứa thẻ <script> trong tên, slug hoặc mô tả.', 'Lỗi');
        return;
      }

      // Không cho phép tên chứa số
      if (/\d/.test(categoryData.name)) {
        this.toastr.error('Tên danh mục không được chứa số.', 'Lỗi');
        return;
      }

      // Check duplicate name or slug
      const isDuplicate = this.allCategories.some(
        c =>
          c.name.trim().toLowerCase() === categoryData.name.trim().toLowerCase() ||
          c.slug.trim().toLowerCase() === categoryData.slug.trim().toLowerCase()
      );
      if (isDuplicate) {
        this.toastr.error('Tên hoặc slug đã tồn tại.', 'Lỗi');
        return;
      }

      this.categoryService.create(categoryData).subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.category) {
            const newCategory = response.data.category;
            this.toastr.success(
              `Category "${newCategory.name}" created on ${new Date(newCategory.created_at).toLocaleDateString()}.`,
              'Success'
            );
            this.closeAddDialog();
            this.loadAllCategories();
          } else {
            this.toastr.error(response.message || 'Failed to create category', 'Error');
          }
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.toastr.error('Failed to create category', 'Error');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Edit category
  openEditDialog(category: Category): void {
    this.selectedCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
    });
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
  }

  updateCategory(): void {
    if (this.categoryForm.valid && this.selectedCategory) {
      const categoryData = this.categoryForm.value;
      
      // Check for <script> tag
      const hasScript = (str: string) => /<script[\s>]/i.test(str || '');
      if (
        hasScript(categoryData.name) ||
        hasScript(categoryData.slug)
      ) {
        this.toastr.error('Không được chứa thẻ <script> trong tên, slug hoặc mô tả.', 'Lỗi');
        return;
      }

      // Không cho phép tên chứa số
      if (/\d/.test(categoryData.name)) {
        this.toastr.error('Tên danh mục không được chứa số.', 'Lỗi');
        return;
      }

      // Check duplicate name or slug
      const isDuplicate = this.allCategories.some(
        c =>
          c.name.trim().toLowerCase() === categoryData.name.trim().toLowerCase() ||
          c.slug.trim().toLowerCase() === categoryData.slug.trim().toLowerCase()
      );
      if (isDuplicate) {
        this.toastr.error('Tên  đã tồn tại.', 'Lỗi');
        return;
      }

      this.categoryService.update(this.selectedCategory.id, categoryData).subscribe({
        next: (response) => {
          if (response.success && response.data.category) {
            const updatedCategory = response.data.category;
            this.toastr.success(`Category "${updatedCategory.name}" (created on ${new Date(updatedCategory.created_at).toLocaleDateString()}) updated successfully.`, 'Success');
            this.closeEditDialog();
            this.loadAllCategories();
          } else {
            this.toastr.error(response.message || 'Failed to update category', 'Error');
          }
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.toastr.error('Failed to update category', 'Error');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  // Delete category
  openDeleteDialog(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  closeDeleteDialog(): void {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }

  deleteCategory(): void {
    if (this.categoryToDelete) {
      const categoryName = this.categoryToDelete.name;
      const creationDate = this.categoryToDelete.createdAt ? new Date(this.categoryToDelete.createdAt).toLocaleDateString() : 'N/A';
      this.categoryService.delete(this.categoryToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastr.success(`Category "${categoryName}" (created on ${creationDate}) deleted successfully.`, 'Success');
            this.closeDeleteDialog();
            this.loadAllCategories();
          } else {
            this.toastr.error(response.message || 'Failed to delete category', 'Error');
          }
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.toastr.error('Failed to delete category', 'Error');
        }
      });
    }
  }

  // Bulk delete
  deleteSelectedCategories(): void {
    if (this.selectedCategories.length === 0) {
      this.toastr.warning('Please select categories to delete', 'Warning');
      return;
    }

    if (confirm(`Are you sure you want to delete ${this.selectedCategories.length} selected categories?`)) {
      // For bulk delete, we'll delete them one by one
      const deletePromises = this.selectedCategories.map(id => 
        this.categoryService.delete(id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.toastr.success('Selected categories deleted successfully', 'Success');
        this.selectedCategories = [];
        this.selectAll = false;
        this.loadAllCategories();
      }).catch(error => {
        console.error('Error deleting categories:', error);
        this.toastr.error('Some categories could not be deleted', 'Error');
        this.loadAllCategories();
      });
    }
  }

  // Form helpers
  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.categoryForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  // Auto-generate slug from name
  generateSlug(): void {
    const name = this.categoryForm.get('name')?.value;
    if (name) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      this.categoryForm.patchValue({ slug });
    }
  }

  // Track by function for ngFor
  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  getCategoryRowClass(index: number): string {
    const colorClasses = [
      'bg-blue-50',
      'bg-green-50',
      'bg-yellow-50',
      'bg-pink-50',
      'bg-purple-50',
      'bg-orange-50',
      'bg-teal-50'
    ];
    return colorClasses[index % colorClasses.length];
  }
}
