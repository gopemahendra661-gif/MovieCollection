// 🔥 SUPABASE CREDENTIALS
const supabaseUrl = 'https://vpyhzixjiwlvflmrmywr.supabase.co';
const supabaseKey = 'sb_publishable_O4F_qebV8fdyGm06vw6O0Q_zzLP9fSo';

let supabase;
let currentUser = null;
let currentCategory = 'all';
let currentSearch = '';

// APK SHARE DETAILS - यहाँ अपना APK लिंक डालें
const APK_DOWNLOAD_URL = "https://your-domain.com/app/videohub-pro.apk"; // अपना APK लिंक डालें
const APK_SHARE_TEXT = "🎬 VideoHub Pro App Download - Watch videos from all platforms! Download now: ";

// CATEGORIES
const fixedCategories = [
    'Action', 'Comedy', 'Drama', 'Sci-fi', 'Horror', 
    'Romance', 'Thriller', 'Animation', 'Adult'
];

// 🆕 NEW: APK SHARE FUNCTION
function shareAPK() {
    if (navigator.share) {
        // Mobile share API
        navigator.share({
            title: 'VideoHub Pro App',
            text: APK_SHARE_TEXT,
            url: APK_DOWNLOAD_URL
        })
        .then(() => console.log('APK shared successfully'))
        .catch((error) => {
            console.log('Share failed:', error);
            fallbackShareAPK();
        });
    } else {
        // Desktop fallback
        fallbackShareAPK();
    }
}

function fallbackShareAPK() {
    // Copy to clipboard
    const shareText = APK_SHARE_TEXT + APK_DOWNLOAD_URL;
    
    navigator.clipboard.writeText(shareText).then(() => {
        alert('📱 App link copied to clipboard! Paste and share with your friends.');
    }).catch(() => {
        // If clipboard fails, show the link
        prompt('Copy this app link to share:', APK_DOWNLOAD_URL);
    });
}

// 🆕 NEW: VIDEO SHARE FUNCTION
function shareVideo(movieTitle, movieId) {
    const videoUrl = window.location.href.split('?')[0] + '?video=' + movieId;
    const shareText = `🎬 Check out this video: "${movieTitle}" on VideoHub Pro - ${videoUrl}`;
    
    if (navigator.share) {
        // Mobile share API
        navigator.share({
            title: movieTitle,
            text: shareText,
            url: videoUrl
        })
        .then(() => console.log('Video shared successfully'))
        .catch((error) => {
            console.log('Share failed:', error);
            fallbackShareVideo(shareText);
        });
    } else {
        // Desktop fallback
        fallbackShareVideo(shareText);
    }
}

function fallbackShareVideo(shareText) {
    navigator.clipboard.writeText(shareText).then(() => {
        alert('📋 Video link copied to clipboard! Share it with your friends.');
    }).catch(() => {
        prompt('Copy this video link to share:', shareText);
    });
}

// 🆕 NEW: BANNER AD FUNCTION
function generateBannerAd() {
    return `
        <div class="banner-ad">
            <div class="banner-ad-placeholder">
                🎯 Advertisement Banner - 320x50
                <div style="font-size: 12px; color: #888; margin-top: 5px;">
                    Your ad could be here
                </div>
            </div>
        </div>
    `;
}

// ... (बाकी सभी functions वैसे ही रहेंगे) ...

// 🎯 UPDATED LOAD MOVIES FUNCTION WITH ADS AND SHARE BUTTONS
async function loadMovies() {
    const moviesContainer = document.getElementById('movies');
    moviesContainer.innerHTML = '<div class="loading">🔄 Loading videos...</div>';

    try {
        let query = supabase.from('movies').select('*');

        if (currentCategory !== 'all') {
            query = query.eq('category', currentCategory);
        }

        const { data: movies, error } = await query;

        if (error) throw error;

        if (!movies || movies.length === 0) {
            moviesContainer.innerHTML = `
                <div class="empty-state">
                    📺 No videos found
                    ${currentCategory !== 'all' ? `in category "${currentCategory}"` : ''}
                    ${currentSearch ? `matching "${currentSearch}"` : ''}
                </div>
            `;
            return;
        }

        let filteredMovies = movies;
        
        // Apply search filter
        if (currentSearch) {
            filteredMovies = movies.filter(movie => 
                movie.title.toLowerCase().includes(currentSearch) ||
                movie.category.toLowerCase().includes(currentSearch) ||
                (movie.description && movie.description.toLowerCase().includes(currentSearch))
            );
        }

        if (filteredMovies.length === 0) {
            moviesContainer.innerHTML = `
                <div class="empty-state">
                    🔍 No videos found matching "${currentSearch}"
                </div>
            `;
            return;
        }

        let moviesHTML = '';
        
        filteredMovies.forEach((movie, index) => {
            const iframeCode = movie.iframe_code;
            const isCurrentUser = currentUser && movie.user_id === currentUser.email;
            
            // Add banner ad after every 2 videos
            if (index > 0 && index % 2 === 0) {
                moviesHTML += generateBannerAd();
            }
            
            // Download button HTML
            const downloadButton = movie.download_url ? 
                `<button class="btn-download" onclick="downloadVideo('${movie.download_url}', '${movie.title}')">
                    📥 Download
                </button>` : '';
            
            // NEW: Share button for each video
            const shareButton = `
                <button class="btn-share" onclick="shareVideo('${movie.title}', ${movie.id})">
                    📤 Share
                </button>
            `;
            
            moviesHTML += `
                <div class="movie" id="movie-${movie.id}">
                    <div class="movie-header">
                        <div class="movie-title">${movie.title}</div>
                        <div class="movie-category">${movie.category}</div>
                    </div>
                    
                    ${movie.description ? `<div class="movie-description">${movie.description}</div>` : ''}
                    
                    ${iframeCode}
                    
                    <!-- NEW: Video Actions Row -->
                    <div class="video-actions-row">
                        <div class="video-actions-left">
                            <button class="fullscreen-btn" onclick="toggleFullscreen(this)">
                                ⛶ Full Screen
                            </button>
                            ${shareButton}
                        </div>
                        <div class="video-actions-right">
                            ${downloadButton}
                            ${isCurrentUser ? `
                                <button class="btn btn-small btn-danger" onclick="deleteMovie(${movie.id})">
                                    🗑️ Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="movie-actions">
                        <div class="user-badge">👤 ${movie.user_id || 'Anonymous'}</div>
                        <div style="color: #888; font-size: 12px;">
                            Added: ${new Date(movie.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                
                <!-- Add banner ad after each video (optional) -->
                ${generateBannerAd()}
            `;
        });

        moviesContainer.innerHTML = moviesHTML;
    } catch (error) {
        console.error('Error loading movies:', error);
        moviesContainer.innerHTML = '<div class="empty-state">❌ Error loading videos</div>';
    }
}

// ... (बाकी सभी functions वैसे ही रहेंगे) ...

// UPDATED INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('✅ VideoHub Pro with Download & Share System initialized');
    
    checkAuthState().then(() => {
        loadCategories();
        loadMovies();
    });
    
    // YOUR EXISTING TOUCH HANDLERS
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});

// ... (बाकी सभी functions वैसे ही रहेंगे) ...
