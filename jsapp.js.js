// الملف الرئيسي للجافاسكريبت

class YacineTVApp {
    constructor() {
        this.config = {
            apiBase: 'http://localhost:3000/api',
            proxyBase: 'http://localhost:3001',
            cacheEnabled: true,
            autoRefresh: true
        };
        
        this.state = {
            playlists: [https://live-edge-eu-1.cdn.enetres.net/56495F77FD124FECA75590A906965F2C022/live-3000/index.m3u8
],
            channels: [],
            currentChannel: null,
            favorites: new Set(),
            filters: {
                category: 'all',
                quality: 'all',
                search: ''
            }
        };
        
        this.init();
    }
    
    async init() {
        await this.checkServerStatus();
        await this.loadPlaylists();
        this.setupEventListeners();
        this.setupAutoRefresh();
    }
    
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.config.apiBase}/status`);
            const data = await response.json();
            
            if (data.status === 'running') {
                console.log('✅ Server is running');
                return true;
            }
        } catch (error) {
            console.error('❌ Server is not reachable:', error);
            this.showError('الخادم غير متاح. تأكد من تشغيل الخادم.');
            return false;
        }
    }
    
    async loadPlaylists() {
        try {
            const response = await fetch(`${this.config.apiBase}/playlists`);
            const data = await response.json();
            
            if (data.success) {
                this.state.playlists = data.playlists;
                this.renderPlaylists();
                
                // إذا كان هناك قوائم، قم بتحليل القنوات
                if (data.playlists.length > 0) {
                    await this.parseAllPlaylists();
                }
            }
        } catch (error) {
            console.error('Error loading playlists:', error);
        }
    }
    
    async parseAllPlaylists() {
        this.state.channels = [];
        
        for (const playlist of this.state.playlists) {
            try {
                const response = await fetch(`${this.config.apiBase}/parse-m3u`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: playlist.content
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // إضافة معلومات القائمة إلى كل قناة
                    const channelsWithPlaylist = data.channels.map(channel => ({
                        ...channel,
                        playlistName: playlist.name,
                        playlistId: playlist.name
                    }));
                    
                    this.state.channels.push(...channelsWithPlaylist);
                }
            } catch (error) {
                console.error(`Error parsing playlist ${playlist.name}:`, error);
            }
        }
        
        this.renderChannels();
        this.updateStats();
    }
    
    renderPlaylists() {
        // Render playlists to the UI
        const container = document.getElementById('playlistsContainer');
        if (!container) return;
        
        // Implementation here
    }
    
    renderChannels() {
        // Render channels to the UI
        const container = document.getElementById('channelsContainer');
        if (!container) return;
        
        // Filter channels based on current filters
        const filteredChannels = this.getFilteredChannels();
        
        // Implementation here
    }
    
    getFilteredChannels() {
        return this.state.channels.filter(channel => {
            // Filter by category
            if (this.state.filters.category !== 'all' && 
                channel.category !== this.state.filters.category) {
                return false;
            }
            
            // Filter by quality
            if (this.state.filters.quality !== 'all' && 
                !channel.resolution.includes(this.state.filters.quality)) {
                return false;
            }
            
            // Filter by search
            if (this.state.filters.search) {
                const searchTerm = this.state.filters.search.toLowerCase();
                if (!channel.name.toLowerCase().includes(searchTerm) &&
                    !channel.category.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    async playChannel(channel) {
        this.state.currentChannel = channel;
        
        // Use proxy URL
        const proxyUrl = `${this.config.proxyBase}/proxy/stream?url=${encodeURIComponent(channel.url)}`;
        
        // Implementation for playing the video
        console.log('Playing channel:', channel.name, 'via proxy:', proxyUrl);
    }
    
    updateStats() {
        // Update statistics in the UI
        const stats = {
            totalChannels: this.state.channels.length,
            totalCategories: new Set(this.state.channels.map(c => c.category)).size,
            categories: this.getCategoryStats()
        };
        
        // Update DOM elements
    }
    
    getCategoryStats() {
        const categories = {};
        this.state.channels.forEach(channel => {
            categories[channel.category] = (categories[channel.category] || 0) + 1;
        });
        return categories;
    }
    
    setupEventListeners() {
        // Setup event listeners for UI interactions
    }
    
    setupAutoRefresh() {
        if (this.config.autoRefresh) {
            // Auto-refresh every 5 minutes
            setInterval(() => {
                this.loadPlaylists();
            }, 5 * 60 * 1000);
        }
    }
    
    showError(message) {
        console.error('App Error:', message);
        // Show error in UI
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.yacineApp = new YacineTVApp();
});
