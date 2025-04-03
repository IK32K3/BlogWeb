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
        
        // Close sidebar when clicking outside on mobile
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
        
        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && e.target !== userMenuButton) {
                userDropdown.classList.add('hidden');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close on Esc key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                userDropdown.classList.add('hidden');
                userMenuButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Animate progress bars on page load
        document.addEventListener('DOMContentLoaded', () => {
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        });
        // Thêm vào phần script cuối trang
document.addEventListener('DOMContentLoaded', () => {
    // ... các code hiện có ...
    
    // Traffic Chart
    const trafficCtx = document.getElementById('trafficChart').getContext('2d');
    const trafficChart = new Chart(trafficCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `Day ${i+1}`),
            datasets: [
                {
                    label: 'Page Views',
                    data: Array.from({length: 30}, () => Math.floor(Math.random() * 1000) + 500),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                },
                {
                    label: 'Unique Visitors',
                    data: Array.from({length: 30}, () => Math.floor(Math.random() * 800) + 300),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // Update chart when time range changes
    document.getElementById('trafficTimeRange').addEventListener('change', function() {
        const days = this.value === 'Last 7 days' ? 7 : this.value === 'Last 90 days' ? 90 : 30;
        trafficChart.data.labels = Array.from({length: days}, (_, i) => 
            days === 7 ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i] : 
            days === 30 ? `Day ${i+1}` : `Week ${i+1}`);
        
        trafficChart.data.datasets[0].data = Array.from({length: days}, () => 
            Math.floor(Math.random() * (days === 7 ? 500 : days === 30 ? 1000 : 3000)) + 
            (days === 7 ? 300 : days === 30 ? 500 : 1000));
        
        trafficChart.data.datasets[1].data = Array.from({length: days}, () => 
            Math.floor(Math.random() * (days === 7 ? 400 : days === 30 ? 800 : 2500)) + 
            (days === 7 ? 200 : days === 30 ? 300 : 800));
        
        trafficChart.update();
    });
});