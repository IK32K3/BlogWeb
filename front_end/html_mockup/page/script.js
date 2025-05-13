document.addEventListener('DOMContentLoaded', () => {
    const filterTabsContainer = document.getElementById('filter-movie-tabs');
    const triggerButtons = Array.from(filterTabsContainer.querySelectorAll('.trigger-button-item'));
    const filterContent = document.getElementById('filter-movie-content');
    const filterSections = Array.from(filterContent.querySelectorAll('.filter-section'));

    const genreOptionsContainer = document.getElementById('genre-options-container');
    const yearOptionsContainer = document.getElementById('year-options-container');

    const genresData = [
        { value: "1", name: "Anime" }, { value: "2", name: "Hành động" },
        { value: "3", name: "Hài hước" }, { value: "4", name: "Tình cảm" },
        { value: "5", name: "Harem" }, { value: "6", name: "Bí ẩn" },
        { value: "7", name: "Bi kịch" }, { value: "8", name: "Giả tưởng" },
        { value: "9", name: "Học đường" }, { value: "10", name: "Đời thường" },
        { value: "11", name: "Võ thuật" }, { value: "12", name: "Trò chơi" },
        { value: "13", name: "Thám tử" }, { value: "14", name: "Lịch sử" },
        { value: "15", name: "Siêu năng lực" }, { value: "16", name: "Shounen" },
        { value: "17", name: "Shounen AI" }, { value: "18", name: "Shoujo" },
        { value: "19", name: "Shoujo AI" }, { value: "20", name: "Thể thao" },
        { value: "21", name: "Âm nhạc" }, { value: "22", name: "Psychological" },
        { value: "23", name: "Mecha" }, { value: "24", name: "Quân đội" },
        { value: "25", name: "Drama" }, { value: "26", name: "Seinen" },
        { value: "27", name: "Siêu nhiên" }, { value: "28", name: "Phiêu lưu" },
        { value: "29", name: "Kinh dị" }, { value: "30", name: "Ma cà rồng" },
        { value: "31", name: "Tokusatsu" }, { value: "32", name: "Samurai" },
        { value: "33", name: "Viễn tưởng" }, { value: "34", name: "CN Animation" },
        { value: "35", name: "Tiên hiệp" }, { value: "36", name: "Kiếm hiệp" },
        { value: "37", name: "Xuyên không" }, { value: "38", name: "Trùng sinh" },
        { value: "39", name: "Huyền ảo" }, { value: "40", name: "[CNA] Ngôn tình" },
        { value: "41", name: "Dị giới" }, { value: "42", name: "[CNA] Hài hước" },
        { value: "43", name: "Đam mỹ" }, { value: "44", name: "Võ hiệp" },
        { value: "45", name: "Ecchi" }, { value: "46", name: "Demon" },
        { value: "47", name: "Live Action" }, { value: "48", name: "Thriller" },
        { value: "49", name: "Khoa huyễn" }
    ];

    const yearsData = [
        { value: "2025", name: "2025" }, { value: "2024", name: "2024" },
        { value: "2023", name: "2023" }, { value: "2022", name: "2022" },
        { value: "2021", name: "2021" }, { value: "2020", name: "2020" },
        { value: "2019", name: "2019" }, { value: "2018", name: "2018" },
        { value: "1111", name: "Trước 2014" }
    ];

    function populateFilterItems(container, itemsData) {
        if (!container) return; 
        container.innerHTML = '';
        itemsData.forEach(item => {
            const div = document.createElement('div');
            div.setAttribute('filter-value', item.value);
            div.className = 'filter-item px-3 py-1.5 text-sm rounded cursor-pointer transition-colors hover:bg-gray-200';
            div.textContent = item.name;
            container.appendChild(div);
        });
    }

    populateFilterItems(genreOptionsContainer, genresData);
    populateFilterItems(yearOptionsContainer, yearsData);

    function updateFilterContentContainer() {
        let totalHeight = 0;
        let anySectionVisible = false;
        filterSections.forEach(section => {
            if (section.style.display !== 'none') {
                anySectionVisible = true;
                // Consider margins/paddings of sections for accurate height
                // For simplicity, using scrollHeight, but ensure CSS box-sizing is appropriate
                totalHeight += section.scrollHeight;
            }
        });
        
        // Add overall padding of filterContent if any section is visible
        // The px-4 is always there. The vertical padding is implicitly handled by sections' py-4 etc.
        // The main container max-height needs to be sum of visible sections' heights.

        if (anySectionVisible) {
            filterContent.style.maxHeight = totalHeight + 'px';
            // Add padding to the filterContent container itself when expanded
            filterContent.style.paddingTop = '0'; // Sections have their own top padding
            filterContent.style.paddingBottom = '0'; // Sections have their own bottom padding
            filterTabsContainer.classList.remove('rounded-b-lg');
        } else {
            filterContent.style.maxHeight = '0px';
            filterContent.style.paddingTop = '0';
            filterContent.style.paddingBottom = '0';
            filterTabsContainer.classList.add('rounded-b-lg');
        }
    }
    
    // Initial setup
    filterSections.forEach(sec => {
        sec.style.display = 'none';
        sec.style.opacity = '0';
    });
    updateFilterContentContainer(); // Set initial state (collapsed, tabs fully rounded)

    triggerButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            const section = filterSections[index];
            const icon = button.querySelector('i');
            const isActive = button.classList.contains('active');

            if (isActive) { // Hide section
                button.classList.remove('active');
                if (icon) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
                section.style.opacity = '0';
                setTimeout(() => {
                    section.style.display = 'none';
                    updateFilterContentContainer();
                }, 300); // CSS transition duration
            } else { // Show section
                button.classList.add('active');
                if (icon) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
                section.style.display = 'block';
                // Delay opacity change to allow display:block to render and transition correctly
                setTimeout(() => {
                    section.style.opacity = '1';
                    updateFilterContentContainer(); // Update container after section is made visible and starts expanding
                }, 10); 
            }
        });
    });

    const allFilterItems = document.querySelectorAll('#filter-movie-content .filter-item');
    allFilterItems.forEach(item => {
        item.addEventListener('click', () => {
            const parentSection = item.closest('.filter-section');
            const isMultiSelectGenre = parentSection.querySelector('#genre-options-container');
            
            // For single-select sections (Year, Episodes, Status)
            if (!isMultiSelectGenre) {
                const siblings = parentSection.querySelectorAll('.filter-item');
                siblings.forEach(sibling => {
                    if (sibling !== item && sibling.classList.contains('active-filter')) {
                        sibling.classList.remove('active-filter');
                    }
                });
            }
            item.classList.toggle('active-filter');
            logSelectedFilters();
        });
    });

    function logSelectedFilters() {
        const selected = {
            genres: [],
            year: null,
            episodes: null,
            status: null
        };
        document.querySelectorAll('#genre-options-container .filter-item.active-filter').forEach(el => {
            selected.genres.push({ value: el.getAttribute('filter-value'), text: el.textContent });
        });
        const activeYear = document.querySelector('#year-options-container .filter-item.active-filter');
        if (activeYear) selected.year = { value: activeYear.getAttribute('filter-value'), text: activeYear.textContent };
        
        const episodesSection = filterSections[2]; // Assuming order
        if (episodesSection) {
            const activeEpisodes = episodesSection.querySelector('.filter-item.active-filter');
            if (activeEpisodes) selected.episodes = { value: activeEpisodes.getAttribute('filter-value'), text: activeEpisodes.textContent };
        }

        const statusSection = filterSections[3]; // Assuming order
        if (statusSection) {
            const activeStatus = statusSection.querySelector('.filter-item.active-filter');
            if (activeStatus) selected.status = { value: activeStatus.getAttribute('filter-value'), text: activeStatus.textContent };
        }
        
        console.clear();
        console.log("Selected Filters:", selected);
    }

    document.addEventListener('click', function(event) {
        const isClickInsideTabs = filterTabsContainer.contains(event.target);
        const isClickInsideContent = filterContent.contains(event.target);

        if (!isClickInsideTabs && !isClickInsideContent) {
            let anyChange = false;
            triggerButtons.forEach((button, index) => {
                if (button.classList.contains('active')) {
                    anyChange = true;
                    button.classList.remove('active');
                    const icon = button.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-chevron-up');
                        icon.classList.add('fa-chevron-down');
                    }
                    const section = filterSections[index];
                    section.style.opacity = '0';
                    // Set display to none after transition, then update container
                    // For click outside, we can do it more directly
                    setTimeout(() => {
                         section.style.display = 'none';
                         // Check if this is the last one to hide before updating
                         if (!triggerButtons.some(btn => btn.classList.contains('active'))) {
                             updateFilterContentContainer();
                         }
                    }, 300);
                }
            });
             if (!anyChange && !filterTabsContainer.classList.contains('rounded-b-lg')) {
                // If no sections were active but container wasn't fully collapsed (e.g. mid-animation)
                // this case is mostly handled by the setTimeout logic above.
                // For robustness, if nothing was active, ensure it's correctly collapsed.
                let allHidden = filterSections.every(sec => sec.style.display === 'none' || sec.style.opacity === '0');
                if(allHidden) updateFilterContentContainer();

            }
        }
    });
});