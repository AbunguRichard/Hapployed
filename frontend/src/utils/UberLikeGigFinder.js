// Uber-Like Real-Time Gig Finder
import { xhrFetch } from './xhrFetch';

class UberLikeGigFinder {
    constructor() {
        this.gigs = [];
        this.userLocation = null;
        this.filters = {
            availableNow: true,
            within20mi: true,
            nearestFirst: true
        };
        this.socket = null;
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        
        this.initialize();
    }

    async initialize() {
        await this.getUserLocation();
        this.setupRealTimeUpdates();
        this.loadNearbyGigs();
        this.setupEventListeners();
    }

    async getUserLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        console.log('Location obtained:', this.userLocation);
                        resolve(this.userLocation);
                    },
                    (error) => {
                        console.warn('Geolocation error:', error);
                        // Fallback to default location
                        this.userLocation = { lat: 38.8816, lng: -77.0910 }; // Arlington, VA
                        resolve(this.userLocation);
                    }
                );
            } else {
                this.userLocation = { lat: 38.8816, lng: -77.0910 };
                resolve(this.userLocation);
            }
        });
    }

    setupRealTimeUpdates() {
        // Use polling instead of WebSocket for compatibility
        this.pollInterval = setInterval(() => {
            this.loadNearbyGigs();
        }, 30000); // Poll every 30 seconds
    }

    handleRealTimeUpdate(update) {
        switch (update.type) {
            case 'NEW_GIG':
                this.addNewGig(update.gig);
                break;
            case 'GIG_TAKEN':
                this.removeGig(update.gigId);
                break;
            case 'GIG_UPDATED':
                this.updateGig(update.gig);
                break;
        }
    }

    async loadNearbyGigs() {
        try {
            const response = await xhrFetch(`${this.backendUrl}/api/quickhire/gigs/nearby`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: this.userLocation.lat,
                    longitude: this.userLocation.lng,
                    radius: this.filters.within20mi ? 20 : 50, // miles
                    availableNow: this.filters.availableNow
                })
            });

            if (response.ok && response.data) {
                this.gigs = response.data.gigs || [];
                this.renderGigs();
                this.updateGigCount();
            }

        } catch (error) {
            console.error('Error loading gigs:', error);
        }
    }

    renderGigs() {
        const feed = document.getElementById('gigsFeed');
        
        if (!feed) return;

        if (this.gigs.length === 0) {
            feed.innerHTML = `
                <div class="no-gigs">
                    <div class="no-gigs-icon">🔍</div>
                    <h3>No gigs found nearby</h3>
                    <p>We'll notify you when new gigs match your skills</p>
                    <button onclick="window.gigFinder.expandSearch()" class="btn-expand">
                        🔍 Expand Search Area
                    </button>
                </div>
            `;
            return;
        }

        feed.innerHTML = this.gigs.map(gig => this.createGigCard(gig)).join('');
    }

    createGigCard(gig) {
        const distance = this.calculateDistance(gig.location);
        const matchScore = this.calculateMatchScore(gig, distance);
        const isUrgent = gig.urgency === 'ASAP' || gig.urgency === 'high';
        
        return `
            <div class="gig-card ${isUrgent ? 'urgent' : ''}" data-gig-id="${gig.id || gig._id}">
                <div class="gig-header">
                    <div class="gig-category">${gig.category || 'General'}</div>
                    <div class="availability-badge">
                        ${isUrgent ? '⚡ Available Now' : `📍 ${distance}mi away`}
                    </div>
                </div>
                
                <div class="gig-price">$${gig.budget || gig.estimatedPrice || 'TBD'}</div>
                <h3 class="gig-title">${gig.description || gig.title || 'Gig opportunity'}</h3>
                
                <div class="gig-meta">
                    <div class="gig-client">
                        <div class="client-avatar">${(gig.clientName || 'C').charAt(0)}</div>
                        <div>
                            <div class="client-name">${gig.clientName || 'Client'}</div>
                            <div class="client-location">${gig.location?.address || 'Nearby'}</div>
                        </div>
                    </div>
                    <div class="gig-posted">Posted ${this.formatTimeAgo(gig.createdAt || gig.postedAt)}</div>
                </div>
                
                <div class="match-score">
                    <div class="match-percentage">${matchScore}% Match</div>
                    <div class="match-details">${this.getMatchDetails(gig, distance)}</div>
                </div>
                
                <div class="gig-actions">
                    <button class="btn-quick-apply" onclick="window.gigFinder.quickApply('${gig.id || gig._id}')">
                        ⚡ Quick Apply
                    </button>
                    <button class="btn-details" onclick="window.gigFinder.viewDetails('${gig.id || gig._id}')">
                        📋 Details
                    </button>
                </div>
                
                ${isUrgent ? '<div class="urgent-flash"></div>' : ''}
            </div>
        `;
    }

    calculateDistance(gigLocation) {
        if (!this.userLocation || !gigLocation) return 'N/A';
        
        const lat = gigLocation.coordinates ? gigLocation.coordinates[1] : gigLocation.lat;
        const lng = gigLocation.coordinates ? gigLocation.coordinates[0] : gigLocation.lng;
        
        if (!lat || !lng) return 'N/A';
        
        const R = 3959; // Earth's radius in miles
        const dLat = this.deg2rad(lat - this.userLocation.lat);
        const dLng = this.deg2rad(lng - this.userLocation.lng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(this.deg2rad(this.userLocation.lat)) * Math.cos(this.deg2rad(lat)) *
                 Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c * 10) / 10; // Round to 1 decimal place
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    calculateMatchScore(gig, distance) {
        let score = 100;
        
        // Distance penalty
        if (distance > 10) score -= 20;
        if (distance > 20) score -= 30;
        
        // Urgency bonus
        if (gig.urgency === 'ASAP' || gig.urgency === 'high') score += 10;
        
        // Budget bonus
        if (gig.budget && gig.budget > 100) score += 5;
        
        return Math.max(0, Math.min(100, score));
    }

    getMatchDetails(gig, distance) {
        const details = [];
        
        if (distance < 5) details.push('Very close');
        else if (distance < 15) details.push('Nearby');
        
        if (gig.urgency === 'ASAP') details.push('Urgent');
        if (gig.budget && gig.budget > 100) details.push('Good pay');
        
        return details.join(' • ') || 'Good match';
    }

    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Recently';
        
        const date = new Date(timestamp);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    async quickApply(gigId) {
        const gig = this.gigs.find(g => (g.id || g._id) === gigId);
        
        try {
            const response = await xhrFetch(`${this.backendUrl}/api/gigs/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    quickApply: true,
                    workerId: 'current_user' // This should come from auth context
                })
            });

            if (response.ok) {
                this.showApplicationSuccess(gig);
                this.removeGig(gigId);
            } else {
                this.showApplicationError();
            }
        } catch (error) {
            console.error('Quick apply error:', error);
            this.showApplicationError();
        }
    }

    showApplicationSuccess(gig) {
        const successUI = document.createElement('div');
        successUI.className = 'application-success';
        successUI.innerHTML = `
            <div class="success-overlay">
                <div class="success-content">
                    <div class="success-icon">✅</div>
                    <h3>Application Sent!</h3>
                    <p>We've notified ${gig?.clientName || 'the client'} about your interest</p>
                    <div class="success-actions">
                        <button onclick="this.closest('.application-success').remove()">Keep Browsing</button>
                        <button onclick="window.location.href='/me/gigs'">View My Gigs</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(successUI);
        
        setTimeout(() => {
            if (successUI.parentElement) successUI.remove();
        }, 5000);
    }

    showApplicationError() {
        alert('Failed to apply for gig. Please try again.');
    }

    viewDetails(gigId) {
        window.location.href = `/quickhire/track/${gigId}`;
    }

    removeGig(gigId) {
        this.gigs = this.gigs.filter(g => (g.id || g._id) !== gigId);
        this.renderGigs();
        this.updateGigCount();
    }

    addNewGig(gig) {
        this.gigs.unshift(gig);
        this.renderGigs();
        this.updateGigCount();
    }

    updateGig(gig) {
        const index = this.gigs.findIndex(g => (g.id || g._id) === (gig.id || gig._id));
        if (index !== -1) {
            this.gigs[index] = gig;
            this.renderGigs();
        }
    }

    expandSearch() {
        this.filters.within20mi = false;
        this.loadNearbyGigs();
    }

    updateGigCount() {
        const countElement = document.getElementById('gigCount');
        if (countElement) {
            const urgentCount = this.gigs.filter(g => g.urgency === 'ASAP' || g.urgency === 'high').length;
            const availableCount = this.gigs.filter(g => g.immediate || g.urgency === 'ASAP').length;
            
            countElement.textContent = 
                `${urgentCount} urgent gigs • ${availableCount} available now`;
        }
    }

    filterGigs(searchTerm) {
        const filtered = this.gigs.filter(gig => {
            const searchLower = searchTerm.toLowerCase();
            return (
                gig.category?.toLowerCase().includes(searchLower) ||
                gig.description?.toLowerCase().includes(searchLower) ||
                gig.title?.toLowerCase().includes(searchLower)
            );
        });
        
        const feed = document.getElementById('gigsFeed');
        if (feed) {
            feed.innerHTML = filtered.map(gig => this.createGigCard(gig)).join('');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('gigSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterGigs(e.target.value);
            });
        }

        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('active');
                this.updateFilters();
            });
        });
    }

    updateFilters() {
        const activeFilters = Array.from(document.querySelectorAll('.filter-chip.active'))
            .map(chip => chip.dataset.filter);
        
        this.filters = {
            availableNow: activeFilters.includes('available-now'),
            within20mi: activeFilters.includes('within-20mi'),
            nearestFirst: activeFilters.includes('nearest-first')
        };
        
        this.loadNearbyGigs();
    }

    cleanup() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
}

export default UberLikeGigFinder;
