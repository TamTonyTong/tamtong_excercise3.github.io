class SPARouter {
    constructor() {
        this.currentPage = 'home';
        this.cache = {}; // Cache loaded pages
        this.contentElement = document.getElementById('content');
        this.initNavigation();
        this.loadPage('home'); // Load initial page
    }
    initNavigation() {
        // Add click listeners to navigation links
        document.querySelectorAll('.nav-link, .nav-logo').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.loadPage(page);
                this.updateNavigation(page);
            });
        });
    }

    async loadPage(pageName) {
        try {
            let content;
            // Check if page is cached
            if (this.cache[pageName]) {
                content = this.cache[pageName];
            } else {
                // Fetch page content
                const fileName = pageName === 'home' ? 'home.html' : `${pageName}.html`;
                const response = await fetch(fileName);
                if (!response.ok) {
                    throw new Error(`Failed to load ${fileName}`);
                }
                content = await response.text();
                // Cache the content
                this.cache[pageName] = content;
            }
            // Update content
            this.contentElement.innerHTML = content;
            this.currentPage = pageName;
            // Update page title
            document.title = `SPA - ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
            // Update URL without reload
            history.pushState({ page: pageName }, '', `#${pageName}`);
        } catch (error) {
            this.contentElement.innerHTML = `
                <div class="error">
                    <h2>Error loading page</h2>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {

        }
    }
    updateNavigation(activePage) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === activePage) {
                link.classList.add('active');
            }
        });
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    const page = e.state ? e.state.page : 'index';
    spa.loadPage(page);
    spa.updateNavigation(page);
});

// Initialize SPA when page loads
let spa;
document.addEventListener('DOMContentLoaded', () => {
    spa = new SPARouter();

    // Initialize data story interactions
    initDataStoryFeatures();
});

// Data story interactive features
function initDataStoryFeatures() {
    // Add click handlers for CTA buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.explore-analysis')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            spa.loadPage(page);
            spa.updateNavigation(page);
        }
    });

    // Add intersection observer for animations
    if ('IntersectionObserver' in window) {
        const animateOnScroll = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe data questions when they exist
        setTimeout(() => {
            const questions = document.querySelectorAll('.data-question');
            questions.forEach(question => {
                animateOnScroll.observe(question);
            });
        }, 100);
    }
}

// Add progress indicator for data story
function createProgressIndicator() {
    const questions = document.querySelectorAll('.data-question');
    if (questions.length === 0) return;

    const progressContainer = document.createElement('div');
    progressContainer.className = 'story-progress';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
        <div class="progress-text">
            <span class="current-section">1</span> of <span class="total-sections">${questions.length}</span>
        </div>
    `;

    document.getElementById('content').prepend(progressContainer);

    // Update progress on scroll
    window.addEventListener('scroll', updateProgress);
}

function updateProgress() {
    const questions = document.querySelectorAll('.data-question');
    const progressFill = document.querySelector('.progress-fill');
    const currentSection = document.querySelector('.current-section');

    if (!questions.length || !progressFill) return;

    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    let activeSection = 1;
    questions.forEach((question, index) => {
        const rect = question.getBoundingClientRect();
        if (rect.top < windowHeight / 2) {
            activeSection = index + 1;
        }
    });

    const progress = (activeSection / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
    if (currentSection) currentSection.textContent = activeSection;
}

// Enhanced page loading for data story
class EnhancedSPARouter extends SPARouter {
    async loadPage(pageName) {
        await super.loadPage(pageName);

        // Initialize data story features after page load
        if (pageName === 'television') {
            setTimeout(() => {
                initDataStoryFeatures();
                createProgressIndicator();
            }, 100);
        }
    }
}

// Replace the basic router with enhanced version
document.addEventListener('DOMContentLoaded', () => {
    spa = new EnhancedSPARouter();
    initDataStoryFeatures();
});