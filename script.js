// 🔥 SUPABASE CREDENTIALS
const supabaseUrl = 'https://vpyhzixjiwlvflmrmywr.supabase.co';
const supabaseKey = 'sb_publishable_O4F_qebV8fdyGm06vw6O0Q_zzLP9fSo';

let supabase;
let currentUser = null;
let currentCategory = 'all';
let currentSearch = '';

// APK SHARE DETAILS - यहाँ अपना APK लिंक डालें
const APK_DOWNLOAD_URL = "https://drive.google.com/file/d/1GZQKl57Fa3M3Jm4bv1P8DpDMzQsUzMfJ/view?usp=drivesdk";
const APK_SHARE_TEXT = "🎬 VideoHub Pro App Download - Watch videos from all platforms! Download now: ";

// CATEGORIES
const fixedCategories = [
    'Action', 'Comedy', 'Drama', 'Sci-fi', 'Horror', 
    'Romance', 'Thriller', 'Animation', 'Adult'
];

// AD CODES
const AD_CODES = {
    banner1: {
        key: '730ffc4cd0cbe4501c1e43303ba673f7',
        height: 50,
        width: 320
    },
    banner2: {
        key: '1cb4836d1181cec93eeaf530d5fae232',
        height: 250,
        width: 300
    }
};

// 🛡️ SECURITY FUNCTIONS
function sanitizeIframeCode(iframeCode) {
    if (!iframeCode) return '';
    
    let sanitized = iframeCode
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:text\/html/gi, '')
        .replace(/vbscript:/gi, '');

    return sanitized;
}

function validateIframeCode(iframeCode) {
    if (!iframeCode || !iframeCode.includes('<iframe')) {
        return false;
    }
    
    const dangerousPatterns = [
        /<script/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /javascript:/i,
        /data:text\/html/i,
        /eval\(/i
    ];
    
    for (let pattern of dangerousPatterns) {
        if (pattern.test(iframeCode)) {
            return false;
        }
    }
    
    return true;
}

// 🆕 WORKING BANNER AD FUNCTION
function generateBannerAd(adType = 'banner1') {
    const adConfig = AD_CODES[adType];
    const adId = 'ad-' + adType + '-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    return `
        <div class="ad-container" id="${adId}">
            <div style="width: 100%; text-align: center; margin: 15px 0;">
                <script type="text/javascript">
                    (function() {
                        try {
                            atOptions = {
                                'key' : '${adConfig.key}',
                                'format' : 'iframe',
                                'height' : ${adConfig.height},
                                'width' : ${adConfig.width},
                                'params' : {}
                            };
                            
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.src = '//www.highperformanceformat.com/${adConfig.key}/invoke.js';
                            document.getElementById('${adId}').appendChild(script);
                        } catch(e) {
                            console.log('Ad loading error:', e);
                            // Fallback ad display
                            document.getElementById('${adId}').innerHTML = '<div style="width:${adConfig.width}px;height:${adConfig.height}px;background:linear-gradient(45deg,#1a1a1a,#333);border:1px solid #444;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#888;font-size:12px;margin:0 auto;"><span>📢 ADVERTISEMENT</span></div>';
                        }
                    })();
                </script>
            </div>
        </div>
    `;
}

// 🆕 SIMPLE BANNER AD FALLBACK
function generateSimpleAd(adType = 'banner1') {
    const adConfig = AD_CODES[adType];
    return `
        <div class="ad-container">
            <div style="width: ${adConfig.width}px; height: ${adConfig.height}px; margin: 0 auto; background: linear-gradient(45deg, #1a1a1a, #333); border: 1px solid #444; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #888; font-size: 12px; font-weight: bold;">
                🎥 📢 ADVERTISEMENT
            </div>
        </div>
    `;
}

// 🆕 LOAD ADS MANUALLY
function loadAdsManually() {
    setTimeout(() => {
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach((container, index) => {
            if (!container.querySelector('iframe') && !container.querySelector('script[src*="highperformanceformat"]')) {
                // Determine which ad to load based on container size or position
                const containerHeight = container.offsetHeight;
                const adType = containerHeight > 100 ? 'banner2' : 'banner1';
                const adConfig = AD_CODES[adType];
                
                // Reload ad script
                const adScript = document.createElement('script');
                adScript.type = 'text/javascript';
                adScript.innerHTML = `
                    atOptions = {
                        'key' : '${adConfig.key}',
                        'format' : 'iframe',
                        'height' : ${adConfig.height},
                        'width' : ${adConfig.width},
                        'params' : {}
                    };
                `;
                container.appendChild(adScript);
                
                const invokeScript = document.createElement('script');
                invokeScript.type = 'text/javascript';
                invokeScript.src = '//www.highperformanceformat.com/' + adConfig.key + '/invoke.js';
                container.appendChild(invokeScript);
            }
        });
    }, 1000);
}

// 🆕 APK SHARE FUNCTION
function shareAPK() {
    const shareText = APK_SHARE_TEXT + APK_DOWNLOAD_URL;
    
    if (navigator.share) {
        // Mobile share API
        navigator.share({
            title: 'VideoHub Pro App',
            text: shareText,
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
    const shareText = APK_SHARE_TEXT + APK_DOWNLOAD_URL;
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('📱 App link copied to clipboard! Paste and share with your friends.');
        }).catch(() => {
            // If clipboard fails, show the link
            prompt('Copy this app link to share:', APK_DOWNLOAD_URL);
        });
    } else {
        // Fallback for older browsers
        prompt('Copy this app link to share:', APK_DOWNLOAD_URL);
    }
}

// 🆕 VIDEO SHARE FUNCTION
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
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('📋 Video link copied to clipboard! Share it with your friends.');
        }).catch(() => {
            prompt('Copy this video link to share:', shareText);
        });
    } else {
        prompt('Copy this video link to share:', shareText);
    }
}

// 📥 DOWNLOAD FUNCTION
function downloadVideo(downloadUrl, title) {
    if (!downloadUrl) {
        alert('❌ Download link not available');
        return;
    }
    
    // Validate URL
    if (!downloadUrl.startsWith('http')) {
        alert('❌ Invalid download URL');
        return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Try to set download attribute for direct download
    try {
        const filename = title.replace(/[^a-z0-9]/gi, '_') + '.mp4';
        link.download = filename;
    } catch (e) {
        console.log('Download attribute not supported, opening in new tab');
    }
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    alert(`📥 Download started for: ${title}`);
}

// 🔐 AUTH FUNCTIONS
function showAuthForm() {
    document.getElementById('authForm').style.display = 'block';
}

function hideAuthForm() {
    document.getElementById('authForm').style.display = 'none';
}

async function handleSignup() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) throw error;
        alert('✅ Signup successful! Please check your email for verification.');
        hideAuthForm();
        
    } catch (error) {
        alert('❌ Signup error: ' + error.message);
    }
}

async function handleLogin() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        currentUser = data.user;
        updateAuthUI();
        hideAuthForm();
        alert('✅ Login successful!');
        
    } catch (error) {
        alert('❌ Login error: ' + error.message);
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        currentUser = null;
        updateAuthUI();
        alert('✅ Logged out successfully!');
    } catch (error) {
        alert('❌ Logout error: ' + error.message);
    }
}

function updateAuthUI() {
    const authStatus = document.getElementById('authStatus');
    if (currentUser) {
        authStatus.innerHTML = `
            <span class="auth-badge">👤 ${currentUser.email}</span>
            <button class="btn btn-small btn-secondary" onclick="handleLogout()">Logout</button>
        `;
    } else {
        authStatus.innerHTML = `
            <button class="btn btn-small btn-info" onclick="showAuthForm()">🔐 Login/Signup</button>
        `;
    }
}

async function checkAuthState() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (data.session) {
            currentUser = data.session.user;
        }
        updateAuthUI();
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// 🎯 MOVIE FUNCTIONS
async function addMovie() {
    if (!currentUser) {
        alert('🔐 Please login to add videos');
        showAuthForm();
        return;
    }

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const desc = document.getElementById('desc').value;
    const downloadUrl = document.getElementById('downloadUrl').value;

    let iframeCode = '';

    const urlTabActive = document.getElementById('urlTab').classList.contains('active');
    
    if (urlTabActive) {
        const videoUrl = document.getElementById('videoUrl').value;
        if (!videoUrl) {
            alert('Please enter a video URL');
            return;
        }
        iframeCode = generateEmbedFromUrl(videoUrl);
    } else {
        const iframeInput = document.getElementById('iframeCode').value;
        if (!iframeInput) {
            alert('Please enter embed iframe code');
            return;
        }
        
        if (!validateIframeCode(iframeInput)) {
            alert('❌ Dangerous code detected! Please use only safe iframe code.');
            return;
        }
        
        iframeCode = sanitizeIframeCode(iframeInput);
    }

    if (!title || !category || !iframeCode) {
        alert('Please fill all required fields');
        return;
    }

    if (!fixedCategories.includes(category)) {
        alert('❌ Please select a valid category from the dropdown list.');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('movies')
            .insert([
                { 
                    title: title, 
                    category: category, 
                    iframe_code: iframeCode, 
                    description: desc,
                    download_url: downloadUrl,
                    user_id: currentUser.email
                }
            ]);

        if (error) throw error;
        alert('✅ Video added successfully!');
        hideForm();
        
        // Clear form fields
        document.getElementById('title').value = '';
        document.getElementById('category').value = '';
        document.getElementById('videoUrl').value = '';
        document.getElementById('iframeCode').value = '';
        document.getElementById('desc').value = '';
        document.getElementById('downloadUrl').value = '';
        
        loadCategories();
        loadMovies();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

function showForm() {
    if (!currentUser) {
        alert('🔐 Please login to add videos');
        showAuthForm();
        return;
    }
    document.getElementById('form').style.display = 'block';
    switchTab('urlTab');
    // Clear all form fields
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('videoUrl').value = '';
    document.getElementById('iframeCode').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('downloadUrl').value = '';
}

function hideForm() {
    document.getElementById('form').style.display = 'none';
}

async function deleteMovie(id) {
    if (!currentUser) {
        alert('🔐 Please login to delete videos');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
        const { error } = await supabase
            .from('movies')
            .delete()
            .eq('id', id);

        if (error) throw error;
        alert('✅ Video deleted successfully!');
        loadCategories();
        loadMovies();
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}

// 🔄 FORM FUNCTIONS
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// 🎥 VIDEO EMBED FUNCTIONS
function getYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function getVimeoVideoId(url) {
    const regex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function getDailymotionVideoId(url) {
    const regex = /(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function getInstagramEmbedCode(url) {
    const reelRegex = /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/;
    const storyRegex = /instagram\.com\/stories\/([a-zA-Z0-9_-]+)/;
    
    const reelMatch = url.match(reelRegex);
    const storyMatch = url.match(storyRegex);
    
    if (reelMatch) {
        const postId = reelMatch[1];
        return `
            <div class="instagram-container">
                <div class="platform-badge">📷 Instagram</div>
                <iframe 
                    src="https://www.instagram.com/p/${postId}/embed/"
                    width="100%" 
                    height="500" 
                    frameborder="0" 
                    scrolling="no" 
                    allowtransparency="true"
                    allowfullscreen
                    allow="fullscreen"
                    webkitallowfullscreen
                    mozallowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    if (storyMatch) {
        const storyId = storyMatch[1];
        return `
            <div class="instagram-container">
                <div class="platform-badge">📷 Instagram Story</div>
                <iframe 
                    src="https://www.instagram.com/stories/${storyId}/embed/"
                    width="100%" 
                    height="700" 
                    frameborder="0" 
                    scrolling="no" 
                    allowtransparency="true"
                    allowfullscreen
                    allow="fullscreen"
                    webkitallowfullscreen
                    mozallowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    return null;
}

function getFacebookEmbedCode(url) {
    const watchRegex = /facebook\.com\/watch\/\?v=(\d+)/;
    const reelRegex = /facebook\.com\/reel\/(\d+)/;
    const videoRegex = /facebook\.com\/[^\/]+\/videos\/(\d+)/;
    
    const watchMatch = url.match(watchRegex);
    const reelMatch = url.match(reelRegex);
    const videoMatch = url.match(videoRegex);
    
    let videoId = null;
    
    if (watchMatch) videoId = watchMatch[1];
    else if (reelMatch) videoId = reelMatch[1];
    else if (videoMatch) videoId = videoMatch[1];
    
    if (videoId) {
        return `
            <div class="facebook-container">
                <div class="platform-badge">👥 Facebook</div>
                <iframe 
                    src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=500"
                    width="100%" 
                    height="400" 
                    style="border:none;overflow:hidden" 
                    scrolling="no" 
                    frameborder="0" 
                    allowfullscreen="true" 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
                    webkitallowfullscreen
                    mozallowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    return null;
}

function fixIframePermissions(iframeCode) {
    let fixedCode = iframeCode;
    fixedCode = fixedCode.replace(/autoplay;?\s*/g, '');
    fixedCode = fixedCode.replace(/allowfullscreen/g, 'allowfullscreen webkitallowfullscreen mozallowfullscreen');
    fixedCode = fixedCode.replace(/<iframe/g, '<iframe allowfullscreen webkitallowfullscreen mozallowfullscreen');
    return fixedCode;
}

function generateEmbedFromUrl(url) {
    if (!url) return '';
    
    // YouTube
    const youtubeId = getYouTubeVideoId(url);
    if (youtubeId) {
        return `
            <div class="video-container">
                <div class="platform-badge">📺 YouTube</div>
                <iframe 
                    src="https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    webkitallowfullscreen
                    mozallowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    // Vimeo
    const vimeoId = getVimeoVideoId(url);
    if (vimeoId) {
        return `
            <div class="video-container">
                <div class="platform-badge">🎬 Vimeo</div>
                <iframe 
                    src="https://player.vimeo.com/video/${vimeoId}" 
                    frameborder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowfullscreen
                    webkitallowfullscreen
                    mozallowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    // Dailymotion
    const dailymotionId = getDailymotionVideoId(url);
    if (dailymotionId) {
        return `
            <div class="video-container">
                <div class="platform-badge">🎥 Dailymotion</div>
                <iframe 
                    src="https://www.dailymotion.com/embed/video/${dailymotionId}" 
                    frameborder="0" 
                    allowfullscreen
                    webkitallowfullscreen
                    mozallowfullscreen>
                </iframe>
            </div>
        `;
    }
    
    // Instagram
    const instagramEmbed = getInstagramEmbedCode(url);
    if (instagramEmbed) {
        return instagramEmbed;
    }
    
    // Facebook
    const facebookEmbed = getFacebookEmbedCode(url);
    if (facebookEmbed) {
        return facebookEmbed;
    }
    
    alert('❌ This platform is not supported yet. Please use YouTube, Instagram, or Facebook URLs.');
    return null;
}

// 📱 FULLSCREEN FUNCTION
function toggleFullscreen(button) {
    const videoContainer = button.closest('.movie').querySelector('.video-container, .instagram-container, .facebook-container');
    
    if (!document.fullscreenElement) {
        if (videoContainer.requestFullscreen) {
            videoContainer.requestFullscreen();
        } else if (videoContainer.webkitRequestFullscreen) {
            videoContainer.webkitRequestFullscreen();
        } else if (videoContainer.msRequestFullscreen) {
            videoContainer.msRequestFullscreen();
        }
        button.textContent = '⛶ Exit Full Screen';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        button.textContent = '⛶ Full Screen';
    }
}

// 📂 CATEGORY FUNCTIONS
async function loadCategories() {
    try {
        const { data: movies, error } = await supabase
            .from('movies')
            .select('category');

        if (error) throw error;

        const categoriesContainer = document.getElementById('categoriesList');
        let categoriesHTML = '';

        // Add "All" category
        categoriesHTML += `
            <button class="category-btn ${currentCategory === 'all' ? 'active' : ''}" 
                    onclick="filterByCategory('all')">
                📺 All Videos
            </button>
        `;

        // Add fixed categories
        fixedCategories.forEach(category => {
            const categoryCount = movies ? movies.filter(m => m.category === category).length : 0;
            categoriesHTML += `
                <button class="category-btn ${currentCategory === category ? 'active' : ''}" 
                        onclick="filterByCategory('${category}')">
                    ${category} (${categoryCount})
                </button>
            `;
        });

        categoriesContainer.innerHTML = categoriesHTML;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function filterByCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    loadMovies();
}

function handleSearch() {
    currentSearch = document.getElementById('searchInput').value.toLowerCase();
    loadMovies();
}

function showAllMovies() {
    currentCategory = 'all';
    currentSearch = '';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.category-btn')[0].classList.add('active');
    loadMovies();
}

// 🎬 MAIN MOVIES LOAD FUNCTION WITH WORKING ADS
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
            const iframeCode = fixIframePermissions(movie.iframe_code);
            const isCurrentUser = currentUser && movie.user_id === currentUser.email;
            
            // Add banner ad after every 2 videos (alternate between ad types)
            if (index > 0 && index % 2 === 0) {
                const adType = index % 4 === 0 ? 'banner2' : 'banner1';
                moviesHTML += generateBannerAd(adType);
            }
            
            // Download button HTML
            const downloadButton = movie.download_url ? 
                `<button class="btn-download" onclick="downloadVideo('${movie.download_url}', '${movie.title.replace(/'/g, "\\'")}')">
                    📥 Download
                </button>` : '';
            
            // Share button for each video
            const shareButton = `
                <button class="btn-share" onclick="shareVideo('${movie.title.replace(/'/g, "\\'")}', ${movie.id})">
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
                    
                    <!-- Video Actions Row -->
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
                
                <!-- Add banner ad after each video -->
                ${generateBannerAd('banner1')}
            `;
        });

        moviesContainer.innerHTML = moviesHTML;
        
        // Load ads after content is rendered
        setTimeout(() => {
            loadAdsManually();
        }, 1500);
        
    } catch (error) {
        console.error('Error loading movies:', error);
        moviesContainer.innerHTML = `
            <div class="empty-state">
                ❌ Error loading videos: ${error.message}
                <br><br>
                <button class="btn" onclick="loadMovies()">🔄 Try Again</button>
            </div>
        `;
    }
}

// 🚀 INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log('✅ VideoHub Pro with Adstera Ads initialized');
    
    // Check auth state and load data
    checkAuthState().then(() => {
        loadCategories();
        loadMovies();
    });
    
    // Touch handlers for mobile
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
    
    // Hide form by default
    hideForm();
    hideAuthForm();
});

// 📝 COMMENTS FUNCTIONS
async function loadComments(movieId) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('movie_id', movieId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const commentsContainer = document.getElementById(`comments-${movieId}`);
        const commentsPreview = document.getElementById(`comments-preview-${movieId}`);
        const commentsCount = document.getElementById(`comments-count-${movieId}`);
        
        if (commentsCount) {
            commentsCount.textContent = `${data.length} comment${data.length !== 1 ? 's' : ''}`;
        }
        
        if (commentsContainer) {
            if (data.length === 0) {
                commentsContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">No comments yet. Be the first to comment!</div>';
            } else {
                commentsContainer.innerHTML = data.map(comment => `
                    <div class="comment-item">
                        <div class="comment-user">${comment.user_name || 'Anonymous'}</div>
                        <div class="comment-text">${comment.comment_text}</div>
                        <div class="comment-time">${new Date(comment.created_at).toLocaleString()}</div>
                    </div>
                `).join('');
            }
        }
        
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

async function addComment(movieId) {
    const commentInput = document.getElementById(`comment-${movieId}`);
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please enter a comment');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([
                { 
                    movie_id: movieId,
                    comment_text: commentText,
                    user_name: currentUser?.email || 'Anonymous'
                }
            ]);

        if (error) throw error;
        commentInput.value = '';
        loadComments(movieId);
        
    } catch (error) {
        alert('❌ Error adding comment: ' + error.message);
    }
}

function toggleComments(button, movieId) {
    const commentsList = document.getElementById(`comments-${movieId}`);
    const toggleIcon = button.querySelector('.toggle-icon');
    
    if (commentsList.classList.contains('expanded')) {
        commentsList.classList.remove('expanded');
        toggleIcon.textContent = '▶';
        button.innerHTML = `Show Comments <span class="toggle-icon">▶</span>`;
    } else {
        commentsList.classList.add('expanded');
        toggleIcon.textContent = '▼';
        button.innerHTML = `Hide Comments <span class="toggle-icon">▼</span>`;
        loadComments(movieId);
    }
}
