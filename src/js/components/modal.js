export default class Modal {
    constructor() {
      // Post Modal
      this.postModal = document.getElementById('postModal');
      this.postTitleInput = document.getElementById('post-title');
      this.postSlugInput = document.getElementById('post-slug');
      this.savePostButton = document.getElementById('savePostButton');
      
      // Category Modal
      this.categoryModal = document.getElementById('categoryModal');
      this.categoryNameInput = document.getElementById('category-name');
      this.categorySlugInput = document.getElementById('category-slug');
      this.saveCategoryButton = document.getElementById('saveCategoryButton');
      
      // User Modal
      this.userModal = document.getElementById('userModal');
      this.passwordFields = document.querySelectorAll('.password-fields');
      this.saveUserButton = document.getElementById('saveUserButton');
      
      // Language Modal
      this.languageModal = document.getElementById('languageModal');
      this.saveLanguageButton = document.getElementById('saveLanguageButton');
      
      // Comment Modal
      this.commentModal = document.getElementById('commentModal');
      
      this.init();
    }
    
    init() {
      this.initPostModal();
      this.initCategoryModal();
      this.initUserModal();
      this.initLanguageModal();
      this.initCommentModal();
    }
    
    initPostModal() {
      if (!this.postModal) return;
      
      // Auto generate slug from title
      if (this.postTitleInput && this.postSlugInput) {
        this.postTitleInput.addEventListener('input', () => {
          this.postSlugInput.value = this.createSlug(this.postTitleInput.value);
        });
      }
      
      // Handle modal open event to populate fields for editing
      this.postModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        
        if (button && button.getAttribute('data-post-id')) {
          const postId = button.getAttribute('data-post-id');
          const postTitle = button.getAttribute('data-post-title');
          const postCategory = button.getAttribute('data-post-category');
          const postContent = button.getAttribute('data-post-content');
          const postDescription = button.getAttribute('data-post-description');
          
          // Set modal title
          document.getElementById('postModalLabel').textContent = 'Chỉnh sửa bài viết';
          
          // Populate form fields
          if (this.postTitleInput) this.postTitleInput.value = postTitle;
          
          // Set category select
          const categorySelect = document.getElementById('post-category');
          if (categorySelect) {
            for (let i = 0; i < categorySelect.options.length; i++) {
              if (categorySelect.options[i].text === postCategory) {
                categorySelect.selectedIndex = i;
                break;
              }
            }
          }
          
          // Set other fields
          const descriptionInput = document.getElementById('post-description');
          const contentInput = document.getElementById('post-content');
          
          if (descriptionInput) descriptionInput.value = postDescription;
          if (contentInput) contentInput.value = postContent;
          if (this.postSlugInput) this.postSlugInput.value = this.createSlug(postTitle);
          
          // Update button text
          if (this.savePostButton) this.savePostButton.textContent = 'Cập nhật';
        } else {
          // New post
          document.getElementById('postModalLabel').textContent = 'Thêm bài viết mới';
          
          // Reset form
          const form = document.getElementById('postForm');
          if (form) form.reset();
          
          // Update button text
          if (this.savePostButton) this.savePostButton.textContent = 'Tạo bài viết';
        }
      });
    }
    
    initCategoryModal() {
      if (!this.categoryModal) return;
      
      // Auto generate slug from name
      if (this.categoryNameInput && this.categorySlugInput) {
        this.categoryNameInput.addEventListener('input', () => {
          this.categorySlugInput.value = this.createSlug(this.categoryNameInput.value);
        });
      }
      
      // Handle modal open event
      this.categoryModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        
        if (button && button.getAttribute('data-category-id')) {
          const categoryId = button.getAttribute('data-category-id');
          const categoryName = button.getAttribute('data-category-name');
          
          // Set modal title
          document.getElementById('categoryModalLabel').textContent = 'Chỉnh sửa danh mục';
          
          // Populate form fields
          if (this.categoryNameInput) this.categoryNameInput.value = categoryName;
          if (this.categorySlugInput) this.categorySlugInput.value = this.createSlug(categoryName);
          
          // Update button text
          if (this.saveCategoryButton) this.saveCategoryButton.textContent = 'Cập nhật';
        } else {
          // New category
          document.getElementById('categoryModalLabel').textContent = 'Thêm danh mục mới';
          
          // Reset form
          const form = document.getElementById('categoryForm');
          if (form) form.reset();
          
          // Update button text
          if (this.saveCategoryButton) this.saveCategoryButton.textContent = 'Thêm mới';
        }
      });
    }
    
    initUserModal() {
      if (!this.userModal) return;
      
      this.userModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        
        if (button && button.getAttribute('data-user-id')) {
          const userId = button.getAttribute('data-user-id');
          const userName = button.getAttribute('data-user-name');
          const userEmail = button.getAttribute('data-user-email');
          const userRole = button.getAttribute('data-user-role');
          const isActive = button.getAttribute('data-user-active') === 'true';
          
          // Set modal title
          document.getElementById('userModalLabel').textContent = 'Chỉnh sửa người dùng';
          
          // Populate form fields
          const usernameInput = document.getElementById('username');
          const emailInput = document.getElementById('email');
          const roleSelect = document.getElementById('user-role');
          const activeCheckbox = document.getElementById('user-active');
          
          if (usernameInput) usernameInput.value = userName;
          if (emailInput) emailInput.value = userEmail;
          
          // Hide password fields when editing
          if (this.passwordFields) {
            this.passwordFields.forEach(field => {
              field.style.display = 'none';
              field.querySelector('input').removeAttribute('required');
            });
          }
          
          // Set role
          if (roleSelect) {
            for (let i = 0; i < roleSelect.options.length; i++) {
              if (roleSelect.options[i].value === userRole) {
                roleSelect.selectedIndex = i;
                break;
              }
            }
          }
          
          if (activeCheckbox) activeCheckbox.checked = isActive;
          
          // Update button text
          if (this.saveUserButton) this.saveUserButton.textContent = 'Cập nhật';
        } else {
          // New user
          document.getElementById('userModalLabel').textContent = 'Thêm người dùng mới';
          
          // Reset form
          const form = document.getElementById('userForm');
          if (form) form.reset();
          
          // Show password fields for new user
          if (this.passwordFields) {
            this.passwordFields.forEach(field => {
              field.style.display = 'block';
              field.querySelector('input').setAttribute('required', '');
            });
          }
          
          // Update button text
          if (this.saveUserButton) this.saveUserButton.textContent = 'Tạo người dùng';
        }
      });
    }
    
    initLanguageModal() {
      if (!this.languageModal) return;
      
      this.languageModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        
        if (button && button.getAttribute('data-language-id')) {
          const languageId = button.getAttribute('data-language-id');
          const languageName = button.getAttribute('data-language-name');
          const languageLocale = button.getAttribute('data-language-locale');
          const isActive = button.getAttribute('data-language-active') === 'true';
          
          // Set modal title
          document.getElementById('languageModalLabel').textContent = 'Chỉnh sửa ngôn ngữ';
          
          // Populate form fields
          const languageNameInput = document.getElementById('language-name');
          const languageLocaleInput = document.getElementById('language-locale');
          const isActiveCheckbox = document.getElementById('is-active');
          
          if (languageNameInput) languageNameInput.value = languageName;
          if (languageLocaleInput) languageLocaleInput.value = languageLocale;
          if (isActiveCheckbox) isActiveCheckbox.checked = isActive;
          
          // Update button text
          if (this.saveLanguageButton) this.saveLanguageButton.textContent = 'Cập nhật';
        } else {
          // New language
          document.getElementById('languageModalLabel').textContent = 'Thêm ngôn ngữ mới';
          
          // Reset form
          const form = document.getElementById('languageForm');
          if (form) form.reset();
          
          // Update button text
          if (this.saveLanguageButton) this.saveLanguageButton.textContent = 'Thêm mới';
        }
      });
    }
    
    initCommentModal() {
      if (!this.commentModal) return;
      
      this.commentModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        
        if (button) {
          const commentId = button.getAttribute('data-comment-id');
          const user = button.getAttribute('data-comment-user');
          const post = button.getAttribute('data-comment-post');
          const content = button.getAttribute('data-comment-content');
          
          // Populate form fields
          const commentUser = document.getElementById('comment-user');
          const commentUserAvatar = document.getElementById('comment-user-avatar');
          const commentPost = document.getElementById('comment-post');
          const commentContent = document.getElementById('comment-content');
          
          if (commentUser) commentUser.textContent = user;
          if (commentUserAvatar) commentUserAvatar.src = `https://ui-avatars.com/api/?name=${user}&background=0D8ABC&color=fff`;
          if (commentPost) commentPost.textContent = post;
          if (commentContent) commentContent.value = content;
        }
      });
    }
    
    createSlug(text) {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[đĐ]/g, 'd')            
        .replace(/[^a-z0-9\s-]/g, '')     
        .replace(/\s+/g, '-')             
        .replace(/-+/g, '-')              
        .trim();
    }
  }