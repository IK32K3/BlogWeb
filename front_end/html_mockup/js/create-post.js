// This script handles the functionality of the create post page, including the Quill editor, tags input, image upload, and category search.
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize Quill editor
            const quill = new Quill('#editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'align': [] }],
                        ['link', 'image', 'video', 'code-block'],
                        ['clean']
                    ]
                },
                placeholder: 'Write your story here...'
            });
            
            // Tags functionality
            const tagInput = document.getElementById('tags');
            const tagContainer = document.getElementById('tag-container');
            const maxTags = 5;
            let tags = [];
            
            tagInput.addEventListener('keydown', function(e) {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.value.trim() !== '' && tags.length < maxTags) {
                    e.preventDefault();
                    const tagText = tagInput.value.trim().replace(',', '');
                    if (!tags.includes(tagText)) {
                        tags.push(tagText);
                        renderTags();
                    }
                    tagInput.value = '';
                }
            });
            
            function renderTags() {
                tagContainer.innerHTML = '';
                tags.forEach((tag, index) => {
                    const tagElement = document.createElement('div');
                    tagElement.className = 'bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-2';
                    tagElement.innerHTML = `
                        ${tag}
                        <span class="text-indigo-400 hover:text-indigo-600 cursor-pointer" data-index="${index}">
                            <i class="fas fa-times text-xs"></i>
                        </span>
                    `;
                    tagContainer.appendChild(tagElement);
                });
                
                // Add event listeners to remove buttons
                document.querySelectorAll('[data-index]').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        tags.splice(index, 1);
                        renderTags();
                    });
                });
            }
            
            // Image upload functionality
            const imageUploader = document.getElementById('image-uploader');
            const featuredImageInput = document.getElementById('featured-image');
            
            imageUploader.addEventListener('click', function() {
                featuredImageInput.click();
            });
            
            featuredImageInput.addEventListener('change', function(e) {
                if (e.target.files.length) {
                    const file = e.target.files[0];
                    if (file.type.match('image.*')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            imageUploader.innerHTML = `
                                <img src="${e.target.result}" alt="Preview" class="w-full h-auto rounded-lg">
                                <button class="mt-2 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" id="remove-image">
                                    <i class="fas fa-trash"></i>
                                    <span>Remove Image</span>
                                </button>
                            `;
                            
                            document.getElementById('remove-image').addEventListener('click', function(e) {
                                e.stopPropagation();
                                resetImageUploader();
                            });
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert('Please select an image file (JPG, PNG)');
                    }
                }
            });
            
            // Drag and drop for image
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                imageUploader.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                imageUploader.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                imageUploader.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                imageUploader.classList.add('border-indigo-300', 'bg-indigo-50');
            }
            
            function unhighlight() {
                imageUploader.classList.remove('border-indigo-300', 'bg-indigo-50');
            }
            
            imageUploader.addEventListener('drop', handleDrop, false);
            
            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                featuredImageInput.files = files;
                const event = new Event('change');
                featuredImageInput.dispatchEvent(event);
            }
            
            function resetImageUploader() {
                imageUploader.innerHTML = `
                    <i class="fas fa-cloud-upload-alt text-indigo-400 text-4xl mb-3"></i>
                    <p class="text-gray-600 font-medium">Drag & drop your featured image here or click to browse</p>
                    <p class="text-gray-400 text-sm mt-1">Recommended size: 1200x630px (JPG, PNG up to 5MB)</p>
                    <input type="file" id="featured-image" class="hidden" accept="image/*">
                `;
                featuredImageInput.value = '';
                
                // Reattach event listeners
                imageUploader.addEventListener('click', function() {
                    featuredImageInput.click();
                });
            }
            
            // Publish button functionality
            document.getElementById('publish-btn').addEventListener('click', function() {
                const title = document.querySelector('.title-input').value.trim();
                const category = document.getElementById('category-search').getAttribute('data-value');
                const content = quill.root.innerHTML;
                
                if (!title) {
                    alert('Please add a title before publishing');
                    document.querySelector('.title-input').focus();
                    return;
                }
                
                if (!category) {
                    alert('Please select a category');
                    return;
                }
                
                if (content === '<p><br></p>' || content === '<p></p>') {
                    alert('Please add some content to your post');
                    return;
                }
                
                // In a real app, you would send this data to your backend
                const postData = {
                    title,
                    category,
                    tags,
                    content,
                    featuredImage: featuredImageInput.files.length ? featuredImageInput.files[0] : null
                };
                
                console.log('Publishing post:', postData);
                alert('Post published successfully!');
            });
            
            // Auto-save simulation (in a real app, this would call your backend)
            setInterval(() => {
                console.log('Auto-saving draft...');
            }, 30000);

            // Category search functionality
            const searchInput = document.getElementById('category-search');
            const optionsList = document.getElementById('category-options');
            const options = optionsList.querySelectorAll('li');

            // Show options when input is focused
            searchInput.addEventListener('focus', () => {
                optionsList.classList.remove('hidden');
            });

            // Hide options when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !optionsList.contains(e.target)) {
                    optionsList.classList.add('hidden');
                }
            });

            // Filter options based on input
            searchInput.addEventListener('input', () => {
                const filter = searchInput.value.toLowerCase();
                options.forEach(option => {
                    const text = option.textContent.toLowerCase();
                    option.style.display = text.includes(filter) ? '' : 'none';
                });
            });

            // Select an option
            options.forEach(option => {
                option.addEventListener('click', () => {
                    searchInput.value = option.textContent;
                    searchInput.setAttribute('data-value', option.getAttribute('data-value'));
                    optionsList.classList.add('hidden');
                });
            });
        });
