// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobileMenuButton');
const closeSidebar = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');

mobileMenuButton.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
});

document.addEventListener('click', (e) => {
    if (window.innerWidth < 1024 && !sidebar.contains(e.target) && e.target !== mobileMenuButton) {
        sidebar.classList.add('-translate-x-full');
    }
});

// User dropdown toggle
const userMenuButton = document.getElementById('userMenuButton');
const userDropdown = document.getElementById('userDropdown');

userMenuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    userDropdown.classList.toggle('hidden', isExpanded);
    userMenuButton.setAttribute('aria-expanded', !isExpanded);
});

document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target) && e.target !== userMenuButton) {
        userDropdown.classList.add('hidden');
        userMenuButton.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        userDropdown.classList.add('hidden');
        userMenuButton.setAttribute('aria-expanded', 'false');
    }
});

// Media Library functionality
const mediaModal = document.getElementById('mediaModal');
const closeMediaModal = document.getElementById('closeMediaModal');
const modalMediaImage = document.getElementById('modalMediaImage');
const modalMediaVideo = document.getElementById('modalMediaVideo');
const modalMediaDocument = document.getElementById('modalMediaDocument');
const mediaModalTitle = document.getElementById('mediaModalTitle');
const documentTitle = document.getElementById('documentTitle');
const documentInfo = document.getElementById('documentInfo');

// Add click event to all view buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.media-item') || e.target.classList.contains('fa-eye')) {
        const mediaItem = e.target.closest('.media-item');
        if (mediaItem) {
            const img = mediaItem.querySelector('img');
            const title = mediaItem.querySelector('p.text-sm').textContent;
            const typeBadge = mediaItem.querySelector('.absolute.top-2.right-2 span');
            
            if (img) {
                if (typeBadge.textContent.trim() === 'Video') {
                    modalMediaVideo.src = 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4';
                    modalMediaVideo.classList.remove('hidden');
                    modalMediaImage.classList.add('hidden');
                    modalMediaDocument.classList.add('hidden');
                } else if (typeBadge.textContent.trim() === 'Document') {
                    documentTitle.textContent = title;
                    documentInfo.textContent = mediaItem.querySelector('p.text-xs').textContent;
                    modalMediaDocument.classList.remove('hidden');
                    modalMediaImage.classList.add('hidden');
                    modalMediaVideo.classList.add('hidden');
                } else if (typeBadge.textContent.trim() === 'Audio') {
                    documentTitle.textContent = title;
                    documentInfo.textContent = mediaItem.querySelector('p.text-xs').textContent;
                    modalMediaDocument.classList.remove('hidden');
                    modalMediaImage.classList.add('hidden');
                    modalMediaVideo.classList.add('hidden');
                    modalMediaDocument.querySelector('i').className = 'fas fa-music text-3xl';
                } else {
                    modalMediaImage.src = img.src;
                    modalMediaImage.alt = img.alt;
                    modalMediaImage.classList.remove('hidden');
                    modalMediaVideo.classList.add('hidden');
                    modalMediaDocument.classList.add('hidden');
                }
                mediaModalTitle.textContent = title;
            }
            
            mediaModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
});

closeMediaModal.addEventListener('click', function() {
    mediaModal.classList.add('hidden');
    document.body.style.overflow = '';
    modalMediaVideo.pause();
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === mediaModal) {
        mediaModal.classList.add('hidden');
        document.body.style.overflow = '';
        modalMediaVideo.pause();
    }
});

// Close on Esc key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        mediaModal.classList.add('hidden');
        document.body.style.overflow = '';
        modalMediaVideo.pause();
    }
});

// Upload Modal functionality
const uploadModal = document.getElementById('uploadModal');
const uploadButton = document.getElementById('uploadButton');
const closeUploadModal = document.getElementById('closeUploadModal');
const uploadDropzone = document.getElementById('uploadDropzone');
const fileInput = document.getElementById('fileInput');
const startUploadBtn = document.getElementById('startUploadBtn');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const uploadProgress = document.querySelector('.upload-progress');

uploadButton.addEventListener('click', function() {
    uploadModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
});

closeUploadModal.addEventListener('click', function() {
    uploadModal.classList.add('hidden');
    document.body.style.overflow = '';
});

cancelUploadBtn.addEventListener('click', function() {
    uploadModal.classList.add('hidden');
    document.body.style.overflow = '';
});

// Drag and drop functionality
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadDropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadDropzone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadDropzone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    uploadDropzone.classList.add('active');
}

function unhighlight() {
    uploadDropzone.classList.remove('active');
}

uploadDropzone.addEventListener('drop', handleDrop, false);
uploadDropzone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFiles);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

function handleFiles(e) {
    const files = e.target.files;
    if (files.length > 0) {
        startUploadBtn.disabled = false;
        uploadDropzone.classList.add('hidden');
        uploadProgress.classList.remove('hidden');
    }
}

// Close upload modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === uploadModal) {
        uploadModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
});

// Close on Esc key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !uploadModal.classList.contains('hidden')) {
        uploadModal.classList.add('hidden');
        document.body.style.overflow = '';
    }
});

// Simulate upload progress
startUploadBtn.addEventListener('click', async function() {
    const files = fileInput.files;
    if (files.length === 0) return;

    const progressBar = uploadProgress.querySelector('.bg-primary-600');
    const formData = new FormData();

    // Add files to formData with correct field name
    if (files.length === 1) {
        formData.append('image', files[0]);
    } else {
        Array.from(files).forEach(file => {
            formData.append('gallery', file);
        });
    }

    try {
        // Get the boundary from FormData
        const boundary = Math.random().toString().substr(2);
        
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to upload files');
            return;
        }

        const response = await axios({
            method: 'post',
            url: '/api/media',
            data: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': `multipart/form-data; boundary=${boundary}`,
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': `Bearer ${token}`
            },
            transformRequest: [(data) => data], // Prevent axios from transforming the FormData
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progressBar.style.width = percentCompleted + '%';
                uploadProgress.querySelector('.font-medium').textContent = percentCompleted + '%';
            }
        });

        if (response.data.success) {
            // Reset UI after successful upload
            setTimeout(() => {
                uploadModal.classList.add('hidden');
                document.body.style.overflow = '';
                uploadDropzone.classList.remove('hidden');
                uploadProgress.classList.add('hidden');
                startUploadBtn.disabled = true;
                progressBar.style.width = '0%';
                uploadProgress.querySelector('.font-medium').textContent = '0%';
                fileInput.value = ''; // Clear file input
            }, 500);
        }
    } catch (error) {
        console.error('Upload failed:', error);
        if (error.response && error.response.status === 401) {
            alert('Your session has expired. Please login again.');
            // Redirect to login page or handle session expiry
            window.location.href = '/login';
        } else {
            alert('Upload failed. Please try again.');
        }
    }
});