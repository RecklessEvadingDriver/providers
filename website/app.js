// App State
let providers = [];
let filteredProviders = [];
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const providersGrid = document.getElementById('providersGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const modal = document.getElementById('providerModal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const totalProvidersEl = document.getElementById('totalProviders');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadProviders();
    setupEventListeners();
    setupSmoothScroll();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load Providers
async function loadProviders() {
    try {
        const response = await fetch('../manifest.json');
        if (!response.ok) throw new Error('Failed to load providers');
        
        providers = await response.json();
        filteredProviders = providers;
        
        // Update stats
        if (totalProvidersEl) {
            totalProvidersEl.textContent = providers.length;
        }
        
        renderProviders();
    } catch (error) {
        console.error('Error loading providers:', error);
        providersGrid.innerHTML = `
            <div class="loading">
                <p>Error loading providers. Please try again later.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Make sure the manifest.json file exists.</p>
            </div>
        `;
    }
}

// Render Providers
function renderProviders() {
    if (filteredProviders.length === 0) {
        providersGrid.innerHTML = `
            <div class="loading">
                <p>No providers found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    providersGrid.innerHTML = filteredProviders.map(provider => {
        const initials = provider.display_name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
        
        const typeClass = `badge-${provider.type || 'global'}`;
        const statusClass = provider.disabled ? 'status-disabled' : 'status-active';
        const statusText = provider.disabled ? 'Disabled' : 'Active';
        
        return `
            <div class="provider-card" data-provider="${provider.value}">
                <div class="provider-icon">${initials}</div>
                <div class="provider-info">
                    <div class="provider-header">
                        <h3 class="provider-name">${provider.display_name}</h3>
                        <span class="provider-badge ${typeClass}">${provider.type || 'global'}</span>
                    </div>
                    <div class="provider-meta">
                        <div class="status-indicator">
                            <span class="status-dot ${statusClass}"></span>
                            <span>${statusText}</span>
                        </div>
                        <span>v${provider.version}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    document.querySelectorAll('.provider-card').forEach(card => {
        card.addEventListener('click', () => {
            const providerValue = card.getAttribute('data-provider');
            showProviderDetails(providerValue);
        });
    });
}

// Filter Providers
function filterProviders() {
    filteredProviders = providers.filter(provider => {
        const matchesFilter = currentFilter === 'all' || provider.type === currentFilter;
        const matchesSearch = provider.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            provider.value.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    renderProviders();
}

// Show Provider Details
function showProviderDetails(providerValue) {
    const provider = providers.find(p => p.value === providerValue);
    if (!provider) return;
    
    const typeClass = `badge-${provider.type || 'global'}`;
    const statusClass = provider.disabled ? 'status-disabled' : 'status-active';
    const statusText = provider.disabled ? 'Disabled' : 'Active';
    
    modalBody.innerHTML = `
        <div style="padding-right: 2rem;">
            <h2 style="font-size: 1.75rem; margin-bottom: 1rem;">${provider.display_name}</h2>
            
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <span class="provider-badge ${typeClass}">${provider.type || 'global'}</span>
                <div class="status-indicator" style="padding: 0.25rem 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-sm);">
                    <span class="status-dot ${statusClass}"></span>
                    <span style="font-size: 0.875rem;">${statusText}</span>
                </div>
            </div>
            
            <div style="background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">Provider ID</div>
                        <div style="font-weight: 600; font-family: monospace;">${provider.value}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">Version</div>
                        <div style="font-weight: 600;">${provider.version}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">Region</div>
                        <div style="font-weight: 600; text-transform: capitalize;">${provider.type || 'global'}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.25rem;">Status</div>
                        <div style="font-weight: 600;">${statusText}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.125rem; margin-bottom: 0.5rem;">About</h3>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    ${provider.display_name} is a ${provider.type || 'global'} provider offering streaming content.
                    This provider is currently ${provider.disabled ? 'disabled and not available for use' : 'active and ready to use'}.
                </p>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.125rem; margin-bottom: 0.5rem;">Usage</h3>
                <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.75rem;">
                    To use this provider in your Vega app:
                </p>
                <ol style="color: var(--text-secondary); line-height: 1.8; padding-left: 1.5rem;">
                    <li>Open the Vega app settings</li>
                    <li>Navigate to the providers section</li>
                    <li>Select "${provider.display_name}"</li>
                    <li>Start streaming your favorite content</li>
                </ol>
            </div>
            
            ${!provider.disabled ? `
                <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color: white; border-radius: var(--radius-lg); padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                        </svg>
                        <strong>Provider Active</strong>
                    </div>
                    <p style="font-size: 0.875rem; opacity: 0.95;">
                        This provider is currently active and available for use in the Vega app.
                    </p>
                </div>
            ` : `
                <div style="background: linear-gradient(135deg, var(--error) 0%, #dc2626 100%); color: white; border-radius: var(--radius-lg); padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <strong>Provider Disabled</strong>
                    </div>
                    <p style="font-size: 0.875rem; opacity: 0.95;">
                        This provider is currently disabled and not available for use.
                    </p>
                </div>
            `}
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Setup Event Listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterProviders();
    });
    
    // Filters
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            filterProviders();
        });
    });
    
    // Modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Smooth Scroll
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 64; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

// Update active nav link on scroll
let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    lastScrollTop = window.scrollY;
});

// Performance optimization: Debounce search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to search
const debouncedSearch = debounce((value) => {
    searchQuery = value;
    filterProviders();
}, 300);

searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
});
