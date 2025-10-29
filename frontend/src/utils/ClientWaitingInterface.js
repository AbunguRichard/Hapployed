// CLIENT-SIDE WAITING INTERFACE
class ClientWaitingInterface {
    constructor(gigId, clientId) {
        this.gigId = gigId;
        this.clientId = clientId;
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        this.pollInterval = null;
        this.workersNotified = 0;
        
        if (gigId) {
            this.setupWaitingInterface();
            this.startStatusPolling();
        }
    }

    setupWaitingInterface() {
        // Remove any existing waiting interface
        const existingUI = document.getElementById('client-waiting-interface');
        if (existingUI) {
            existingUI.remove();
        }

        const waitingUI = document.createElement('div');
        waitingUI.id = 'client-waiting-interface';
        waitingUI.innerHTML = `
            <div class="waiting-overlay">
                <div class="waiting-content">
                    <h3>🔍 Finding Available Workers</h3>
                    <div class="searching-animation">
                        <div class="pulse-dot"></div>
                        <div class="pulse-dot"></div>
                        <div class="pulse-dot"></div>
                    </div>
                    <div class="workers-notified">
                        <span id="workersCount">0</span> workers notified
                    </div>
                    <div class="search-status">
                        <p id="searchStatusText">Searching nearby workers...</p>
                    </div>
                    <div class="waiting-stats">
                        <div class="stat">
                            <span class="label">Average Response Time:</span>
                            <span class="value">45 seconds</span>
                        </div>
                        <div class="stat">
                            <span class="label">Success Rate:</span>
                            <span class="value">98%</span>
                        </div>
                    </div>
                    <div class="cancel-section">
                        <button id="cancelSearchBtn" class="cancel-btn">
                            Cancel Search
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(waitingUI);
        
        // Add event listener for cancel button
        document.getElementById('cancelSearchBtn')?.addEventListener('click', () => {
            this.cancelSearch();
        });
    }

    async startStatusPolling() {
        // Poll every 2 seconds
        this.pollInterval = setInterval(async () => {
            await this.checkGigStatus();
        }, 2000);
        
        // Also check immediately
        await this.checkGigStatus();
    }

    async checkGigStatus() {
        try {
            const response = await fetch(`${this.backendUrl}/api/quickhire/gigs/${this.gigId}/status`);
            const status = await response.json();
            this.updateWaitingInterface(status);
        } catch (error) {
            console.error('Failed to check gig status:', error);
        }
    }

    updateWaitingInterface(status) {
        // Update workers notified count
        const workersCountEl = document.getElementById('workersCount');
        if (workersCountEl && status.workersNotified !== undefined) {
            this.workersNotified = status.workersNotified;
            workersCountEl.textContent = status.workersNotified;
        }
        
        // Update search status text
        const statusTextEl = document.getElementById('searchStatusText');
        if (statusTextEl) {
            if (status.status === 'Dispatching') {
                statusTextEl.textContent = 'Notifying nearby workers...';
            } else if (status.status === 'Matched' || status.status === 'On-Route') {
                // Worker accepted
                this.showWorkerAccepted(status);
            } else if (status.searchExpanded) {
                statusTextEl.textContent = 'Expanding search radius...';
            }
        }
    }

    showWorkerAccepted(status) {
        // Stop polling
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        const waitingUI = document.getElementById('client-waiting-interface');
        if (!waitingUI) return;

        // Get worker info from assignment
        const worker = status.assignment?.workerProfile || {
            name: 'Worker',
            rating: 5.0
        };

        waitingUI.innerHTML = `
            <div class="accepted-overlay">
                <div class="accepted-content">
                    <div class="success-animation">✅</div>
                    <h3>🎉 ${worker.name} Accepted Your Gig!</h3>
                    <div class="worker-info">
                        <div class="worker-photo">👤</div>
                        <div class="worker-details">
                            <h4>${worker.name}</h4>
                            <p>⭐ ${worker.rating || '5.0'} rating</p>
                            ${status.eta ? `<p>🕒 ETA: ${status.eta} minutes</p>` : ''}
                            ${status.distance ? `<p>📍 ${status.distance} miles away</p>` : ''}
                        </div>
                    </div>
                    <div class="next-steps">
                        <p>${worker.name} is on the way to your location!</p>
                        <button id="viewDetailsBtn" class="details-btn">
                            View Gig Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for details button
        document.getElementById('viewDetailsBtn')?.addEventListener('click', () => {
            this.viewGigDetails();
        });
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
            this.viewGigDetails();
        }, 3000);
    }

    showExpandedSearch() {
        const statusTextEl = document.getElementById('searchStatusText');
        if (statusTextEl) {
            statusTextEl.textContent = 'Expanding search to more workers...';
        }
    }

    async cancelSearch() {
        try {
            await fetch(`${this.backendUrl}/api/quickhire/gigs/${this.gigId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: 'user_cancelled'
                })
            });
            
            this.cleanup();
            
            // Show cancellation message
            this.showCancellationMessage();
            
        } catch (error) {
            console.error('Failed to cancel search:', error);
        }
    }

    showCancellationMessage() {
        const waitingUI = document.getElementById('client-waiting-interface');
        if (waitingUI) {
            waitingUI.innerHTML = `
                <div class="waiting-overlay">
                    <div class="waiting-content">
                        <h3>Search Cancelled</h3>
                        <p>Your gig search has been cancelled.</p>
                        <button onclick="window.location.href='/dashboard'" class="details-btn">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                waitingUI.remove();
            }, 3000);
        }
    }

    viewGigDetails() {
        this.cleanup();
        window.location.href = `/quickhire/track/${this.gigId}`;
    }

    cleanup() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        
        const waitingUI = document.getElementById('client-waiting-interface');
        if (waitingUI) {
            waitingUI.remove();
        }
    }
}

export default ClientWaitingInterface;
