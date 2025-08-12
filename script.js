// IRYS Checker JavaScript functionality

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchIcon = document.querySelector('.search-icon');

// Auto-focus on the search input when page loads
window.addEventListener('load', () => {
    searchInput.focus();
});

// Handle Enter key press in search input
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Handle search icon click
searchIcon.addEventListener('click', performSearch);

// Add hover effect to search icon
searchIcon.addEventListener('mouseenter', () => {
    searchIcon.style.transform = 'translateY(-50%) scale(1.1)';
});

searchIcon.addEventListener('mouseleave', () => {
    searchIcon.style.transform = 'translateY(-50%) scale(1)';
});

// Main search function
// Store leaderboard data
let leaderboardData = {};

// Load all leaderboard data files
async function loadLeaderboardData() {
    const timeframes = ['7D', '30D', '90d', '180d', '365d'];
    
    for (const timeframe of timeframes) {
        try {
            const response = await fetch(`Leaderboard Data/community-mindshare ${timeframe}.json`);
            const data = await response.json();
            leaderboardData[timeframe] = data.community_mindshare.top_1000_yappers;
        } catch (error) {
            console.error(`Error loading ${timeframe} data:`, error);
        }
    }
}

// Search for user in leaderboard data
function searchUser(searchTerm) {
    // Check if search term starts with @
    if (!searchTerm.startsWith('@')) {
        return null; // Return null if @ symbol is missing
    }
    
    // Remove @ symbol for actual search
    const username = searchTerm.substring(1);
    
    const results = [];
    const timeframes = ['7D', '30D', '90d', '180d', '365d'];
    
    for (const timeframe of timeframes) {
        if (leaderboardData[timeframe]) {
            const user = leaderboardData[timeframe].find(user => 
                user.username.toLowerCase() === username.toLowerCase() ||
                user.user_id === username
            );
            
            if (user) {
                results.push({
                    timeframe: timeframe === '90d' ? '3M' : timeframe === '180d' ? '6M' : timeframe === '365d' ? '12M' : timeframe,
                    rank: `#${user.rank}`,
                    mindshare: `${(user.mindshare * 100).toFixed(4)}%`,
                    username: user.username
                });
            } else {
                results.push({
                    timeframe: timeframe === '90d' ? '3M' : timeframe === '180d' ? '6M' : timeframe === '365d' ? '12M' : timeframe,
                    rank: 'Not Found',
                    mindshare: 'N/A',
                    username: username
                });
            }
        }
    }
    
    return results;
}

// Update popup with search results
// Update popup with search results
function updatePopupResults(results) {
    const tableContainer = document.querySelector('.results-table');
    
    // Clear existing rows except header
    const existingRows = tableContainer.querySelectorAll('.table-row');
    existingRows.forEach(row => row.remove());
    
    // Add new rows
    results.forEach(result => {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        // Apply orange color to "Not Found" entries
        const rankCellStyle = result.rank === 'Not Found' ? 'style="color: #ff8c00;"' : '';
        
        row.innerHTML = `
            <div class="rank-cell" ${rankCellStyle}>${result.rank}</div>
            <div class="mindshare-cell">${result.mindshare}</div>
            <div class="timeframe-cell">${result.timeframe}</div>
        `;
        tableContainer.appendChild(row);
    });
}

// Show error message for invalid search
function showErrorMessage() {
    const tableContainer = document.querySelector('.results-table');
    
    // Clear existing rows except header
    const existingRows = tableContainer.querySelectorAll('.table-row');
    existingRows.forEach(row => row.remove());
    
    // Add error message row
    const errorRow = document.createElement('div');
    errorRow.className = 'table-row';
    errorRow.innerHTML = `
        <div class="rank-cell" style="grid-column: 1 / -1; color: #ff6b6b; text-align: center;">
            Please add @ before the username (e.g., @thegreatola)
        </div>
    `;
    tableContainer.appendChild(errorRow);
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        // Search for user in leaderboard data
        const results = searchUser(searchTerm);
        
        if (results === null) {
            // Show error message if @ symbol is missing
            document.getElementById('usernameValue').textContent = 'Invalid Format';
            showErrorMessage();
        } else {
            // Update the username in the popup
            document.getElementById('usernameValue').textContent = results[0]?.username || searchTerm.substring(1);
            
            // Update the results table
            updatePopupResults(results);
        }
        
        // Show the popup
        document.getElementById('popupOverlay').style.display = 'block';
        document.getElementById('resultsPopup').style.display = 'block';
    }
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('resultsPopup').style.display = 'none';
}

// Add event listener for Enter key
document.addEventListener('DOMContentLoaded', function() {
    // Load leaderboard data when page loads
    loadLeaderboardData();
    
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});

// Close popup when clicking outside (optional)
document.addEventListener('click', function(e) {
    const popup = document.getElementById('resultsPopup');
    const searchContainer = document.querySelector('.search-container');
    
    if (!popup.contains(e.target) && !searchContainer.contains(e.target)) {
        popup.style.display = 'none';
    }
});

// Show loading state
function showLoading(isLoading) {
    const searchIcon = document.querySelector('.search-icon svg');
    
    if (isLoading) {
        searchInput.disabled = true;
        searchIcon.style.animation = 'spin 1s linear infinite';
        searchInput.placeholder = 'Searching...';
    } else {
        searchInput.disabled = false;
        searchIcon.style.animation = 'none';
        searchInput.placeholder = 'Enter username or wallet address...';
    }
}

// Display search results
function displayResult(result) {
    // Create result modal
    const resultHTML = `
        <div class="result-modal" id="resultModal">
            <div class="result-content">
                <div class="result-header">
                    <h2>IRYS Leaderboard Position</h2>
                    <button class="close-btn" onclick="closeResult()">&times;</button>
                </div>
                <div class="result-body">
                    <div class="result-item">
                        <span class="label">Username/Address:</span>
                        <span class="value">${result.username}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Position:</span>
                        <span class="value rank">#${result.position.toLocaleString()}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Total Uploaded:</span>
                        <span class="value">${result.totalUploaded}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Last Activity:</span>
                        <span class="value">${result.lastActivity}</span>
                    </div>
                    <div class="result-item">
                        <span class="label">Timeframe:</span>
                        <span class="value">${result.timeframe}</span>
                    </div>
                </div>
                <div class="result-footer">
                    <button class="search-again-btn" onclick="searchAgain()">Search Again</button>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('resultModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add result modal to body
    document.body.insertAdjacentHTML('beforeend', resultHTML);
    
    // Add modal styles
    addModalStyles();
    
    // Animate modal in
    setTimeout(() => {
        document.getElementById('resultModal').classList.add('show');
    }, 10);
}

// Close result modal
function closeResult() {
    const modal = document.getElementById('resultModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

// Search again function
function searchAgain() {
    closeResult();
    searchInput.value = '';
    searchInput.focus();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ff4444' : '#51FFD3'};
        color: ${type === 'error' ? 'white' : '#2a2a2a'};
        border-radius: 8px;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add modal styles dynamically
function addModalStyles() {
    if (document.getElementById('modalStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'modalStyles';
    style.textContent = `
        .result-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .result-modal.show {
            opacity: 1;
        }
        
        .result-content {
            background: #2a2a2a;
            border: 2px solid #51FFD3;
            border-radius: 16px;
            padding: 0;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .result-modal.show .result-content {
            transform: scale(1);
        }
        
        .result-header {
            background: #51FFD3;
            color: #2a2a2a;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .result-header h2 {
            font-size: 20px;
            font-weight: 600;
            margin: 0;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            color: #2a2a2a;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .close-btn:hover {
            background-color: rgba(42, 42, 42, 0.1);
        }
        
        .result-body {
            padding: 25px;
        }
        
        .result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #444;
        }
        
        .result-item:last-child {
            border-bottom: none;
        }
        
        .label {
            font-weight: 500;
            color: #ccc;
        }
        
        .value {
            font-weight: 600;
            color: #51FFD3;
        }
        
        .value.rank {
            font-size: 18px;
            color: #51FFD3;
        }
        
        .result-footer {
            padding: 20px 25px;
            border-top: 1px solid #444;
        }
        
        .search-again-btn {
            width: 100%;
            background: transparent;
            border: 2px solid #51FFD3;
            color: #51FFD3;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .search-again-btn:hover {
            background: #51FFD3;
            color: #2a2a2a;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .result-content {
                width: 95%;
                margin: 20px;
            }
            
            .result-header {
                padding: 15px;
            }
            
            .result-header h2 {
                font-size: 18px;
            }
            
            .result-body {
                padding: 20px;
            }
            
            .result-footer {
                padding: 15px 20px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('IRYS Checker initialized');
    
    // Add click event to Capt. Awesome avatar
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.style.cursor = 'pointer';
        avatar.addEventListener('click', () => {
            window.open('https://x.com/JediEth0', '_blank');
        });
    }
    
    // Add some interactive feedback
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.length > 0) {
            searchIcon.style.opacity = '1';
        } else {
            searchIcon.style.opacity = '0.7';
        }
    });
});