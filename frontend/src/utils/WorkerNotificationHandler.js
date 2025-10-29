// WORKER-SIDE NOTIFICATION HANDLER
class WorkerNotificationHandler {
    constructor(workerId) {
        this.workerId = workerId;
        this.currentOffers = new Map();
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        if (workerId) {
            this.setupPolling(); // Use polling instead of WebSocket for now
        }
    }

    // Polling-based notification system (fallback to WebSocket)
    setupPolling() {
        this.pollInterval = setInterval(() => {
            this.checkForNewOffers();
        }, 5000); // Check every 5 seconds
    }

    async checkForNewOffers() {
        try {
            const response = await fetch(`${this.backendUrl}/api/notifications/worker/${this.workerId}`);
            const notifications = await response.json();
            
            notifications.forEach(notification => {
                if (notification.type === 'GIG_OFFER' && !notification.read) {
                    this.handleGigOffer(notification.payload);
                }
            });
        } catch (error) {
            console.error('Failed to check notifications:', error);
        }
    }

    handleGigOffer(gigOffer) {
        // Store the offer
        if (!this.currentOffers.has(gigOffer.gigId)) {
            this.currentOffers.set(gigOffer.gigId, {
                ...gigOffer,
                receivedAt: Date.now(),
                expiresAt: gigOffer.expiration
            });

            // Show notification to worker
            this.showGigNotification(gigOffer);
            
            // Play notification sound
            this.playNotificationSound();
        }
    }

    showGigNotification(gigOffer) {
        // Remove any existing notification for this gig
        const existingNotif = document.querySelector(`[data-gig-id="${gigOffer.gigId}"]`);
        if (existingNotif) {
            existingNotif.remove();
        }

        // Create notification UI (like Uber's popup)
        const notification = document.createElement('div');
        notification.className = 'gig-offer-notification';
        notification.setAttribute('data-gig-id', gigOffer.gigId);
        notification.innerHTML = `
            <div class="gig-offer-content">
                <div class="gig-header">
                    <h3>New ${gigOffer.category} Gig</h3>
                    <span class="urgency-badge ${gigOffer.urgency.toLowerCase()}">${gigOffer.urgency}</span>
                </div>
                <div class="gig-details">
                    <p class="price">💰 $${gigOffer.price}</p>
                    <p class="location">📍 ${gigOffer.location}</p>
                    <p class="client-rating">⭐ Client Rating: ${gigOffer.clientRating}</p>
                </div>
                <div class="offer-actions">
                    <button class="decline-btn" data-gig-id="${gigOffer.gigId}">
                        Decline
                    </button>
                    <button class="accept-btn" data-gig-id="${gigOffer.gigId}">
                        Accept Gig
                    </button>
                </div>
                <div class="offer-timer">
                    <div class="timer-bar" data-gig-id="${gigOffer.gigId}"></div>
                    <span class="timer-text" data-gig-id="${gigOffer.gigId}">30s</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Add event listeners
        notification.querySelector('.accept-btn').addEventListener('click', () => {
            this.acceptOffer(gigOffer.gigId);
        });
        
        notification.querySelector('.decline-btn').addEventListener('click', () => {
            this.declineOffer(gigOffer.gigId);
        });
        
        // Start countdown timer
        this.startOfferTimer(gigOffer.gigId, gigOffer.expiration);
    }

    async acceptOffer(gigId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/gigs/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    workerId: this.workerId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAcceptanceSuccess(result);
                this.removeNotification(gigId);
            } else {
                this.showAcceptanceError(result.message || 'Gig no longer available');
            }
            
        } catch (error) {
            console.error('Acceptance error:', error);
            this.showAcceptanceError('Failed to accept gig. Please try again.');
        }
    }

    async declineOffer(gigId, reason = 'not_interested') {
        try {
            await fetch(`${this.backendUrl}/api/gigs/decline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    workerId: this.workerId,
                    reason
                })
            });

            this.removeNotification(gigId);
        } catch (error) {
            console.error('Decline error:', error);
            this.removeNotification(gigId);
        }
    }

    startOfferTimer(gigId, expiration) {
        const timerInterval = setInterval(() => {
            const timeLeft = expiration - Date.now();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                this.removeNotification(gigId);
                return;
            }
            
            // Update timer display
            const timerBar = document.querySelector(`[data-gig-id="${gigId}"].timer-bar`);
            const timerText = document.querySelector(`[data-gig-id="${gigId}"].timer-text`);
            
            if (timerBar && timerText) {
                const percentage = (timeLeft / 30000) * 100;
                timerBar.style.width = `${percentage}%`;
                timerText.textContent = `${Math.ceil(timeLeft / 1000)}s`;
                
                // Change color when time is running out
                if (timeLeft < 10000) {
                    timerBar.style.background = '#ff6b6b';
                }
            }
        }, 100);
    }

    removeNotification(gigId) {
        const notification = document.querySelector(`[data-gig-id="${gigId}"].gig-offer-notification`);
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
        this.currentOffers.delete(gigId);
    }

    showAcceptanceSuccess(result) {
        const successUI = document.createElement('div');
        successUI.className = 'acceptance-success';
        successUI.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✅</div>
                <h3>Gig Accepted!</h3>
                <p>Redirecting you to gig details...</p>
            </div>
        `;
        document.body.appendChild(successUI);
        
        setTimeout(() => {
            successUI.remove();
            // Redirect to gig details
            if (result.gigId) {
                window.location.href = `/quickhire/track/${result.gigId}`;
            }
        }, 2000);
    }

    showAcceptanceError(message) {
        const errorUI = document.createElement('div');
        errorUI.className = 'acceptance-error';
        errorUI.innerHTML = `
            <div class="error-content">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(errorUI);
        
        setTimeout(() => {
            errorUI.remove();
        }, 3000);
    }

    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGM0fPTgjMGHm7A7+OZSR8JTazn77dpHQ==');
            audio.play().catch(e => console.log('Could not play sound:', e));
        } catch (error) {
            console.log('Notification sound failed:', error);
        }
    }

    formatDistance(distance) {
        if (typeof distance === 'string') return distance;
        return `${distance.toFixed(1)} mi`;
    }

    cleanup() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
        
        // Remove all notifications
        document.querySelectorAll('.gig-offer-notification').forEach(notif => notif.remove());
        
        this.currentOffers.clear();
    }
}

export default WorkerNotificationHandler;
