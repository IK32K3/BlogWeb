document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.classList.remove('text-blue-600');
                t.classList.add('text-gray-600');
            });
            
            // Add active class to clicked tab
            this.classList.add('active', 'text-blue-600');
            this.classList.remove('text-gray-600');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Like button functionality
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const likeCount = this.querySelector('.like-count');
            const currentLikes = parseInt(likeCount.textContent);
            const isLiked = this.classList.contains('text-blue-600');
            
            if (isLiked) {
                this.classList.remove('text-blue-600');
                likeCount.textContent = currentLikes - 1;
                this.querySelector('i').classList.replace('fas', 'far');
            } else {
                this.classList.add('text-blue-600');
                likeCount.textContent = currentLikes + 1;
                this.querySelector('i').classList.replace('far', 'fas');
            }
        });
    });

    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    editProfileBtn.addEventListener('click', function() {
        alert('Edit profile functionality would open a modal or form here.');
        // In a real implementation, this would open a modal or redirect to an edit page
    });

    // Delete post functionality
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this post?')) {
                const postCard = this.closest('.post-card');
                postCard.style.opacity = '0';
                setTimeout(() => {
                    postCard.remove();
                }, 300);
            }
        });
    });

    // Edit post functionality
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const postContent = this.closest('.post-card').querySelector('p.text-gray-700');
            const currentText = postContent.textContent;
            const newText = prompt('Edit your post:', currentText);
            
            if (newText !== null && newText !== currentText) {
                postContent.textContent = newText;
            }
        });
    });
});