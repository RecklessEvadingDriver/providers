// ===== Configuration =====
const API_BASE = window.location.origin + '/api';

// ===== State Management =====
const state = {
    providers: [],
    currentProvider: null,
    currentContent: null,
    currentStreams: [],
    currentView: 'home',
    searchQuery: '',
    filterType: 'all'
};

// ===== DOM Elements =====
const elements = {
    // Views
    homeView: document.getElementById('homeView'),
    browseView: document.getElementById('browseView'),
    detailsView: document.getElementById('detailsView'),
    playerView: document.getElementById('playerView'),
    
    // Navigation
    themeToggle: document.getElementById('themeToggle'),
    btnBack: document.getElementById('btnBack'),
    logoHome: document.getElementById('logoHome'),
    
    // Home view
    providersGrid: document.getElementById('providersGrid'),
    providerSearch: document.getElementById('providerSearch'),
    totalProviders: document.getElementById('totalProviders'),
    activeProviders: document.getElementById('activeProviders'),
    
    // Browse view
    currentProviderName: document.getElementById('currentProviderName'),
    currentProviderType: document.getElementById('currentProviderType'),
    contentSearch: document.getElementById('contentSearch'),
    categoriesContainer: document.getElementById('categoriesContainer'),
    contentGrid: document.getElementById('contentGrid'),
    
    // Details view
    detailsContent: document.getElementById('detailsContent'),
    
    // Player view
    playerContainer: document.getElementById('playerContainer')
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    loadProviders();
});

// ===== Theme Management =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation
    elements.btnBack.addEventListener('click', goBack);
    elements.logoHome.addEventListener('click', () => showView('home'));
    
    // Provider search and filter
    elements.providerSearch.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value.toLowerCase();
        renderProviders();
    }, 300));
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filterType = btn.getAttribute('data-filter');
            renderProviders();
        });
    });
    
    // Content search
    elements.contentSearch.addEventListener('input', debounce((e) => {
        searchContent(e.target.value);
    }, 500));
}

// ===== API Functions =====
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function loadProviders() {
    try {
        state.providers = await apiRequest('/providers');
        const activeCount = state.providers.filter(p => !p.disabled).length;
        
        if (elements.totalProviders) {
            elements.totalProviders.textContent = state.providers.length;
        }
        if (elements.activeProviders) {
            elements.activeProviders.textContent = activeCount;
        }
        
        renderProviders();
    } catch (error) {
        elements.providersGrid.innerHTML = `
            <div class="error-message">
                <p>Error loading providers. Please refresh the page.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

async function loadProviderCatalog(providerValue) {
    try {
        const data = await apiRequest(`/provider/${providerValue}/catalog`);
        return data;
    } catch (error) {
        console.error('Error loading catalog:', error);
        return { catalog: [], genres: [] };
    }
}

async function loadPosts(providerValue, filter, page = 1) {
    try {
        const posts = await apiRequest(`/provider/${providerValue}/posts`, {
            method: 'POST',
            body: JSON.stringify({ filter, page })
        });
        return posts;
    } catch (error) {
        console.error('Error loading posts:', error);
        return [];
    }
}

async function searchContent(query) {
    if (!query || query.trim().length < 2) {
        // Reload default content
        if (state.currentProvider) {
            loadBrowseView(state.currentProvider);
        }
        return;
    }
    
    try {
        elements.contentGrid.innerHTML = '<div class="loading">Searching...</div>';
        
        const results = await apiRequest(`/provider/${state.currentProvider.value}/search`, {
            method: 'POST',
            body: JSON.stringify({ query: query.trim(), page: 1 })
        });
        
        renderContentGrid(results);
    } catch (error) {
        elements.contentGrid.innerHTML = `
            <div class="error-message">
                <p>Search failed. Please try again.</p>
            </div>
        `;
    }
}

async function loadMetadata(providerValue, link) {
    try {
        const meta = await apiRequest(`/provider/${providerValue}/meta`, {
            method: 'POST',
            body: JSON.stringify({ link })
        });
        return meta;
    } catch (error) {
        console.error('Error loading metadata:', error);
        throw error;
    }
}

async function loadStream(providerValue, link, type) {
    try {
        const streams = await apiRequest(`/provider/${providerValue}/stream`, {
            method: 'POST',
            body: JSON.stringify({ link, type })
        });
        return streams;
    } catch (error) {
        console.error('Error loading stream:', error);
        throw error;
    }
}

async function loadEpisodes(providerValue, url) {
    try {
        const episodes = await apiRequest(`/provider/${providerValue}/episodes`, {
            method: 'POST',
            body: JSON.stringify({ url })
        });
        return episodes;
    } catch (error) {
        console.error('Error loading episodes:', error);
        return [];
    }
}

// ===== View Management =====
function showView(viewName) {
    // Hide all views
    elements.homeView.style.display = 'none';
    elements.browseView.style.display = 'none';
    elements.detailsView.style.display = 'none';
    elements.playerView.style.display = 'none';
    
    // Show selected view
    switch(viewName) {
        case 'home':
            elements.homeView.style.display = 'block';
            elements.btnBack.style.display = 'none';
            break;
        case 'browse':
            elements.browseView.style.display = 'block';
            elements.btnBack.style.display = 'flex';
            break;
        case 'details':
            elements.detailsView.style.display = 'block';
            elements.btnBack.style.display = 'flex';
            break;
        case 'player':
            elements.playerView.style.display = 'block';
            elements.btnBack.style.display = 'flex';
            break;
    }
    
    state.currentView = viewName;
    document.body.setAttribute('data-view', viewName);
}

function goBack() {
    if (state.currentView === 'player') {
        showView('details');
        if (state.currentContent) {
            loadDetailsView(state.currentProvider.value, state.currentContent.link);
        }
    } else if (state.currentView === 'details') {
        showView('browse');
    } else if (state.currentView === 'browse') {
        showView('home');
        state.currentProvider = null;
    }
}

// ===== Render Functions =====
function renderProviders() {
    const filtered = state.providers.filter(provider => {
        const matchesFilter = state.filterType === 'all' || provider.type === state.filterType;
        const matchesSearch = !state.searchQuery || 
            provider.display_name.toLowerCase().includes(state.searchQuery) ||
            provider.value.toLowerCase().includes(state.searchQuery);
        return matchesFilter && matchesSearch;
    });
    
    if (filtered.length === 0) {
        elements.providersGrid.innerHTML = `
            <div class="empty-state">
                <p>No providers found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    elements.providersGrid.innerHTML = filtered.map(provider => {
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
            <div class="provider-card" data-provider='${JSON.stringify(provider)}' ${provider.disabled ? 'style="opacity: 0.6; cursor: not-allowed;"' : ''}>
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
        const providerData = JSON.parse(card.getAttribute('data-provider'));
        if (!providerData.disabled) {
            card.addEventListener('click', () => {
                selectProvider(providerData);
            });
        }
    });
}

function renderContentGrid(posts) {
    if (!posts || posts.length === 0) {
        elements.contentGrid.innerHTML = `
            <div class="empty-state">
                <p>No content found.</p>
            </div>
        `;
        return;
    }
    
    elements.contentGrid.innerHTML = posts.map(post => `
        <div class="content-card" data-link="${post.link}">
            <img src="${post.image}" alt="${post.title}" class="content-poster" loading="lazy" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
            <div class="content-info">
                <div class="content-title">${post.title}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', () => {
            const link = card.getAttribute('data-link');
            loadDetailsView(state.currentProvider.value, link);
        });
    });
}

// ===== Provider Selection =====
async function selectProvider(provider) {
    state.currentProvider = provider;
    await loadBrowseView(provider);
}

async function loadBrowseView(provider) {
    showView('browse');
    
    elements.currentProviderName.textContent = provider.display_name;
    elements.currentProviderType.textContent = provider.type || 'global';
    elements.currentProviderType.className = `provider-badge badge-${provider.type || 'global'}`;
    elements.contentSearch.value = '';
    
    elements.categoriesContainer.innerHTML = '<div class="loading">Loading categories...</div>';
    elements.contentGrid.innerHTML = '<div class="loading">Loading content...</div>';
    
    try {
        const { catalog, genres } = await loadProviderCatalog(provider.value);
        
        // Render first category
        if (catalog && catalog.length > 0) {
            const firstCategory = catalog[0];
            const posts = await loadPosts(provider.value, firstCategory.filter, 1);
            renderContentGrid(posts);
            
            // Render category buttons
            if (catalog.length > 1 || genres.length > 0) {
                elements.categoriesContainer.innerHTML = `
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Categories</h3>
                        <div class="filters">
                            ${catalog.map((cat, index) => `
                                <button class="filter-btn ${index === 0 ? 'active' : ''}" data-filter="${cat.filter}">
                                    ${cat.title}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    ${genres.length > 0 ? `
                        <div>
                            <h3 style="font-size: 1.25rem; margin-bottom: 1rem;">Genres</h3>
                            <div class="filters">
                                ${genres.map(genre => `
                                    <button class="filter-btn" data-filter="${genre.filter}">
                                        ${genre.title}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                `;
                
                // Add category click handlers
                elements.categoriesContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        elements.categoriesContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        
                        elements.contentGrid.innerHTML = '<div class="loading">Loading...</div>';
                        const filter = btn.getAttribute('data-filter');
                        const posts = await loadPosts(provider.value, filter, 1);
                        renderContentGrid(posts);
                    });
                });
            } else {
                elements.categoriesContainer.innerHTML = '';
            }
        } else {
            elements.categoriesContainer.innerHTML = '';
            elements.contentGrid.innerHTML = `
                <div class="empty-state">
                    <p>No categories available for this provider.</p>
                </div>
            `;
        }
    } catch (error) {
        elements.contentGrid.innerHTML = `
            <div class="error-message">
                <p>Error loading content. Please try again.</p>
            </div>
        `;
    }
}

// ===== Details View =====
async function loadDetailsView(providerValue, link) {
    showView('details');
    
    elements.detailsContent.innerHTML = '<div class="loading" style="text-align: center; padding: 3rem;">Loading details...</div>';
    
    try {
        const meta = await loadMetadata(providerValue, link);
        state.currentContent = { link, ...meta };
        
        elements.detailsContent.innerHTML = `
            <div class="details-hero">
                <div class="details-content-wrapper">
                    <div class="details-poster-wrapper">
                        <img src="${meta.image}" alt="${meta.title}" class="details-poster"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect fill=%22%23ddd%22 width=%22300%22 height=%22450%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                    </div>
                    <div class="details-info">
                        <h1>${meta.title}</h1>
                        <div class="details-meta">
                            ${meta.rating ? `<span>⭐ ${meta.rating}</span>` : ''}
                            <span>${meta.type === 'movie' ? 'Movie' : 'TV Series'}</span>
                            ${meta.imdbId ? `<span>IMDb: ${meta.imdbId}</span>` : ''}
                        </div>
                        ${meta.synopsis ? `<p class="details-synopsis">${meta.synopsis}</p>` : ''}
                        ${meta.tags && meta.tags.length > 0 ? `
                            <div class="details-tags">
                                ${meta.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${meta.cast && meta.cast.length > 0 ? `
                            <div style="margin-bottom: 1rem;">
                                <strong>Cast:</strong> ${meta.cast.join(', ')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            ${renderLinkList(meta.linkList)}
        `;
    } catch (error) {
        elements.detailsContent.innerHTML = `
            <div class="error-message">
                <p>Error loading details. Please try again.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

function renderLinkList(linkList) {
    if (!linkList || linkList.length === 0) {
        return '';
    }
    
    return `
        <div class="seasons-grid">
            ${linkList.map((link, index) => `
                <div class="season-card" id="season-${index}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3>${link.title}</h3>
                        ${link.quality ? `<span class="quality-badge">${link.quality}p</span>` : ''}
                    </div>
                    ${link.directLinks && link.directLinks.length > 0 ? `
                        <div class="episodes-list">
                            ${link.directLinks.map(ep => `
                                <div class="episode-item" data-link="${ep.link}" data-type="${ep.type || 'movie'}">
                                    <span>${ep.title}</span>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                    </svg>
                                </div>
                            `).join('')}
                        </div>
                    ` : link.episodesLink ? `
                        <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" data-episodes-link="${link.episodesLink}">
                            Load Episodes
                        </button>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Add event delegation for episode clicks
document.addEventListener('click', async (e) => {
    const episodeItem = e.target.closest('.episode-item');
    if (episodeItem) {
        const link = episodeItem.getAttribute('data-link');
        const type = episodeItem.getAttribute('data-type');
        loadPlayerView(link, type);
        return;
    }
    
    const episodesBtn = e.target.closest('[data-episodes-link]');
    if (episodesBtn) {
        const url = episodesBtn.getAttribute('data-episodes-link');
        episodesBtn.innerHTML = 'Loading...';
        episodesBtn.disabled = true;
        
        try {
            const episodes = await loadEpisodes(state.currentProvider.value, url);
            const seasonCard = episodesBtn.closest('.season-card');
            
            if (episodes && episodes.length > 0) {
                episodesBtn.remove();
                const episodesList = document.createElement('div');
                episodesList.className = 'episodes-list';
                episodesList.innerHTML = episodes.map(ep => `
                    <div class="episode-item" data-link="${ep.link}" data-type="series">
                        <span>${ep.title}</span>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                    </div>
                `).join('');
                seasonCard.appendChild(episodesList);
            }
        } catch (error) {
            episodesBtn.innerHTML = 'Error loading episodes';
        }
    }
});

// ===== Player View =====
async function loadPlayerView(link, type) {
    showView('player');
    
    elements.playerContainer.innerHTML = '<div class="loading" style="text-align: center; padding: 3rem;">Loading streams...</div>';
    
    try {
        const streams = await loadStream(state.currentProvider.value, link, type);
        state.currentStreams = streams;
        
        if (!streams || streams.length === 0) {
            elements.playerContainer.innerHTML = `
                <div class="error-message">
                    <p>No streams available for this content.</p>
                </div>
            `;
            return;
        }
        
        renderPlayer(streams);
    } catch (error) {
        elements.playerContainer.innerHTML = `
            <div class="error-message">
                <p>Error loading streams. Please try again.</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

function renderPlayer(streams) {
    const firstStream = streams[0];
    
    elements.playerContainer.innerHTML = `
        <div class="player-wrapper">
            ${renderVideoPlayer(firstStream)}
            
            <div class="player-controls">
                <div class="server-selection">
                    <h3 style="margin-bottom: 0.5rem;">Available Servers</h3>
                    <div class="server-buttons">
                        ${streams.map((stream, index) => `
                            <button class="server-btn ${index === 0 ? 'active' : ''}" data-stream-index="${index}">
                                ${stream.server}${stream.quality ? ` (${stream.quality}p)` : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add server switch handlers
    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-stream-index'));
            switchStream(streams[index]);
            
            document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function renderVideoPlayer(stream) {
    if (stream.type === 'm3u8' || stream.type === 'application/x-mpegURL') {
        return `
            <video class="video-player" controls autoplay>
                <source src="${stream.link}" type="application/x-mpegURL">
                Your browser does not support HLS playback. Please try a different server.
            </video>
            <p style="color: #888; text-align: center; margin-top: 1rem; font-size: 0.875rem;">
                ${stream.server} - ${stream.quality ? stream.quality + 'p' : 'Auto Quality'}
            </p>
        `;
    } else if (stream.type === 'mp4') {
        return `
            <video class="video-player" controls autoplay>
                <source src="${stream.link}" type="video/mp4">
                Your browser does not support video playback.
            </video>
            <p style="color: #888; text-align: center; margin-top: 1rem; font-size: 0.875rem;">
                ${stream.server} - ${stream.quality ? stream.quality + 'p' : 'Auto Quality'}
            </p>
        `;
    } else {
        return `
            <iframe 
                class="video-player" 
                src="${stream.link}" 
                frameborder="0" 
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
            <p style="color: #888; text-align: center; margin-top: 1rem; font-size: 0.875rem;">
                ${stream.server} - ${stream.quality ? stream.quality + 'p' : 'Auto Quality'}
            </p>
        `;
    }
}

function switchStream(stream) {
    const playerWrapper = document.querySelector('.player-wrapper');
    const videoContainer = playerWrapper.querySelector('video, iframe').parentElement;
    videoContainer.innerHTML = renderVideoPlayer(stream);
}

// ===== Utility Functions =====
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
