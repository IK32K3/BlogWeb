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
    placeholder: 'Write your post content here...'
});

// Tag input functionality
document.querySelector('#tags').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tagText = this.value.trim();
        if (tagText) {
            const tagElement = document.createElement('span');
            tagElement.className = 'bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full flex items-center';
            tagElement.innerHTML = `${tagText} <button class="ml-1 text-indigo-600 hover:text-indigo-800"><i class="fas fa-times"></i></button>`;
            document.querySelector('#tag-container').appendChild(tagElement);
            this.value = '';
        }
    }
});

// Category dropdown functionality
const categorySearch = document.querySelector('#category-search');
const categoryOptions = document.querySelector('#category-options');

categorySearch.addEventListener('focus', () => {
    categoryOptions.classList.remove('hidden');
});

categorySearch.addEventListener('blur', () => {
    setTimeout(() => categoryOptions.classList.add('hidden'), 200);
});

document.querySelectorAll('#category-options li').forEach(option => {
    option.addEventListener('click', () => {
        categorySearch.value = option.textContent;
        categoryOptions.classList.add('hidden');
    });
});
