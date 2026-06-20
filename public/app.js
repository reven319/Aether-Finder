// State management
let allResults = [];
let currentFilter = 'all';

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsGrid = document.getElementById('results-grid');
const loadingState = document.getElementById('loading-state');
const welcomeState = document.getElementById('welcome-state');
const resultsMeta = document.getElementById('results-meta');
const resultsCount = document.getElementById('results-count');
const searchTime = document.getElementById('search-time');
const filterButtons = document.querySelectorAll('.filter-btn');
const quickTags = document.querySelectorAll('.quick-tag');

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
});

// Search submission
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    await performSearch(query);
  }
});

// Quick tags click handlers
quickTags.forEach(tag => {
  tag.addEventListener('click', async () => {
    const query = tag.textContent;
    searchInput.value = query;
    await performSearch(query);
  });
});

// Source filtering
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-source');
    renderResults();
  });
});

// Perform search request
async function performSearch(query) {
  // Reset UI states
  welcomeState.style.display = 'none';
  resultsGrid.innerHTML = '';
  resultsMeta.style.display = 'none';
  loadingState.style.display = 'flex';
  
  const startTime = performance.now();

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    allResults = data.results || [];
    searchTime.textContent = duration;
    resultsCount.textContent = allResults.length;
    
    loadingState.style.display = 'none';
    
    if (allResults.length === 0) {
      renderEmptyState();
    } else {
      resultsMeta.style.display = 'flex';
      renderResults();
    }
  } catch (error) {
    console.error('Search failed:', error);
    loadingState.style.display = 'none';
    renderErrorState(error.message);
  }
}

// Render empty results
function renderEmptyState() {
  resultsGrid.innerHTML = `
    <div class="welcome-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
      <i data-lucide="info" class="welcome-icon" style="color: var(--amber-glow);"></i>
      <h2 style="margin-bottom: 0.5rem;">No Downloads Found</h2>
      <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">
        We couldn't find any direct software packages matching your search terms. Try modifying your search query.
      </p>
    </div>
  `;
  lucide.createIcons();
}

// Render error state
function renderErrorState(errMessage) {
  resultsGrid.innerHTML = `
    <div class="welcome-card" style="grid-column: 1 / -1; text-align: center; border-color: rgba(239, 68, 68, 0.2); padding: 4rem 2rem;">
      <i data-lucide="alert-triangle" class="welcome-icon" style="color: var(--rose-glow);"></i>
      <h2 style="margin-bottom: 0.5rem; color: #fecaca;">Crawl Operation Failed</h2>
      <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto; margin-bottom: 1.5rem;">
        An error occurred while connecting to the crawler backend server.
      </p>
      <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 0.75rem; font-family: monospace; font-size: 0.85rem; color: #f87171; display: inline-block;">
        ${errMessage}
      </div>
    </div>
  `;
  lucide.createIcons();
}

// Helper to format bytes
function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return 'Unknown Size';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Render results items
function renderResults() {
  resultsGrid.innerHTML = '';
  
  // Filter list
  const filtered = allResults.filter(item => {
    if (currentFilter === 'all') return true;
    return item.source === currentFilter;
  });

  if (filtered.length === 0) {
    resultsGrid.innerHTML = `
      <div class="welcome-card" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
        <i data-lucide="filter" class="welcome-icon"></i>
        <h3 style="margin-bottom: 0.5rem;">No results for this source</h3>
        <p style="color: var(--text-secondary);">Select "All Sources" or choose a different filter above.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Generate unique ID for elements
  filtered.forEach((item, index) => {
    const cardId = `card-${index}`;
    const statusBadgeId = `status-${index}`;
    const sizeBadgeId = `size-${index}`;
    const typeBadgeId = `type-${index}`;
    
    const sizeStr = item.size ? formatBytes(item.size) : 'Checking...';
    const typeStr = item.type || 'EXE/ZIP';

    const cardHtml = `
      <div class="result-card" id="${cardId}" data-url="${item.url}">
        <div class="card-header">
          <div class="card-title-area">
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <div class="meta-badges">
              <span class="badge badge-source" data-source="${item.source}">
                <i data-lucide="database" style="width: 0.8rem; height: 0.8rem;"></i>
                ${item.source}
              </span>
              <span class="badge badge-type" id="${typeBadgeId}">${typeStr}</span>
              <span class="badge badge-size" id="${sizeBadgeId}">${sizeStr}</span>
              <span class="badge badge-status verifying" id="${statusBadgeId}">
                <i data-lucide="loader" style="width: 0.8rem; height: 0.8rem; animation: spin 2s linear infinite;"></i>
                Verifying...
              </span>
            </div>
          </div>
        </div>
        
        <p class="card-description">${escapeHtml(item.description)}</p>
        
        <div class="card-actions">
          <a href="${item.url}" target="_blank" class="btn btn-download" download>
            <i data-lucide="download" class="btn-icon-sm"></i>
            Download Direct
          </a>
          <button class="btn btn-copy" onclick="copyToClipboard('${item.url}', this)">
            <i data-lucide="copy" class="btn-icon-sm"></i>
            Copy Link
          </button>
        </div>
      </div>
    `;
    resultsGrid.insertAdjacentHTML('beforeend', cardHtml);
    
    // Perform asynchronous link verification
    verifyLink(item.url, statusBadgeId, sizeBadgeId, typeBadgeId, item.size);
  });

  lucide.createIcons();
}

// Verify download link dynamically
async function verifyLink(url, statusBadgeId, sizeBadgeId, typeBadgeId, existingSize) {
  const statusEl = document.getElementById(statusBadgeId);
  const sizeEl = document.getElementById(sizeBadgeId);
  const typeEl = document.getElementById(typeBadgeId);

  try {
    const response = await fetch(`/api/verify?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (!statusEl) return; // Guard if user searches again during check

    if (data.status === 'active') {
      statusEl.className = 'badge badge-status active';
      statusEl.innerHTML = `<i data-lucide="check-circle-2" style="width: 0.8rem; height: 0.8rem;"></i> Active Link`;
      
      // Update size if it was unknown
      if (!existingSize && data.size) {
        sizeEl.textContent = formatBytes(data.size);
      } else if (!existingSize && !data.size) {
        sizeEl.textContent = 'Dynamic Size';
      }

      // Update file type if server resolved a specific content type
      if (data.contentType) {
        const inferredType = inferTypeFromMime(data.contentType, url);
        if (inferredType) {
          typeEl.textContent = inferredType;
        }
      }
    } else {
      statusEl.className = 'badge badge-status unknown';
      statusEl.innerHTML = `<i data-lucide="help-circle" style="width: 0.8rem; height: 0.8rem;"></i> Status Unknown`;
      if (!existingSize) {
        sizeEl.textContent = 'Unknown Size';
      }
    }
  } catch (err) {
    if (statusEl) {
      statusEl.className = 'badge badge-status unknown';
      statusEl.innerHTML = `<i data-lucide="help-circle" style="width: 0.8rem; height: 0.8rem;"></i> Status Unknown`;
    }
  }
  
  // Re-run lucide for newly added check/help icons in status badge
  lucide.createIcons();
}

// Helper to infer file type extensions from mime-type & URL
function inferTypeFromMime(mime, url) {
  const fileExt = url.split('.').pop().split('?')[0].toUpperCase();
  if (fileExt && fileExt.length <= 4 && !['HTML', 'PHP', 'ASPX'].includes(fileExt)) {
    return fileExt;
  }

  const mimeMap = {
    'application/octet-stream': 'BIN',
    'application/x-msdownload': 'EXE',
    'application/x-msi': 'MSI',
    'application/x-apple-diskimage': 'DMG',
    'application/zip': 'ZIP',
    'application/x-gzip': 'TAR.GZ',
    'application/x-debian-package': 'DEB',
    'application/x-redhat-package-manager': 'RPM',
    'application/pdf': 'PDF'
  };

  const cleanMime = mime.split(';')[0].trim().toLowerCase();
  return mimeMap[cleanMime] || null;
}

// Clipboard copying utility
async function copyToClipboard(text, btnElement) {
  try {
    await navigator.clipboard.writeText(text);
    const originalHtml = btnElement.innerHTML;
    btnElement.innerHTML = `<i data-lucide="check" class="btn-icon-sm"></i> Copied!`;
    btnElement.style.borderColor = 'var(--emerald-glow)';
    btnElement.style.color = '#a7f3d0';
    lucide.createIcons();
    
    setTimeout(() => {
      btnElement.innerHTML = originalHtml;
      btnElement.style.borderColor = '';
      btnElement.style.color = '';
      lucide.createIcons();
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
}

// Simple HTML escaping helper
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
