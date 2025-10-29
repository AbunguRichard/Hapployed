// UBER-LIKE QUICKHIRE WORKFLOW SYSTEM
import { xhrFetch } from './xhrFetch';

class QuickHireWorkflow {
    constructor() {
        this.currentGig = null;
        this.workers = [];
        this.selectedWorker = null;
        this.isMatching = false;
        this.conversationHistory = [];
        this.voiceRecognition = null;
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        this.trackingInterval = null;
        
        this.initialize();
    }

    initialize() {
        this.setupVoiceRecognition();
    }

    // UBER-LIKE GIG MATCHING WORKFLOW
    async postQuickHireGig(formData) {
        try {
            // 1. Create gig in system
            this.currentGig = await this.createGig(formData);
            
            // 2. Start immediate matching with nearby workers
            await this.startWorkerMatching();
            
            // 3. Show real-time matching progress
            this.showMatchingProgress();
            
            return this.currentGig;
            
        } catch (error) {
            console.error('Gig posting failed:', error);
            this.handleError('Failed to post gig. Please try again.');
            throw error;
        }
    }

    async createGig(formData) {
        try {
            const response = await xhrFetch(`${this.backendUrl}/api/quickhire/gigs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorMessage = response.data?.detail || response.data?.message || 'Failed to create gig';
                throw new Error(errorMessage);
            }

            const result = response.data;
            return result;
            
        } catch (error) {
            console.error('Error creating gig:', error);
            throw error;
        }
    }

    // UBER-STYLE WORKER MATCHING ALGORITHM
    async startWorkerMatching() {
        this.isMatching = true;
        
        // Show matching UI
        this.showMatchingUI();
        
        // Step 1: Find immediate nearby workers (0-2 miles)
        let workers = await this.findNearbyWorkers(2);
        this.updateSearchStep(0);
        
        if (workers.length === 0) {
            // Step 2: Expand search radius (2-5 miles)
            workers = await this.findNearbyWorkers(5);
            this.updateSearchStep(1);
        }
        
        if (workers.length === 0) {
            // Step 3: Expand to city-wide (5-15 miles)
            workers = await this.findNearbyWorkers(15);
            this.updateSearchStep(2);
        }
        
        if (workers.length === 0) {
            // Step 4: Post to general marketplace
            workers = await this.postToMarketplace();
            this.updateSearchStep(3);
        }
        
        this.workers = workers;
        this.isMatching = false;
        
        // Show available workers
        if (workers.length > 0) {
            this.showAvailableWorkers(workers);
        } else {
            this.showNoWorkersFound();
        }
    }

    updateSearchStep(stepIndex) {
        const steps = document.querySelectorAll('.search-steps .step');
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    async findNearbyWorkers(radiusMiles) {
        try {
            const response = await fetch(`${this.backendUrl}/api/workers/nearby`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId: this.currentGig?.id,
                    category: this.currentGig?.category,
                    latitude: this.currentGig?.location?.coordinates?.[1],
                    longitude: this.currentGig?.location?.coordinates?.[0],
                    radius: radiusMiles,
                    urgency: this.currentGig?.urgency
                })
            });
            
            const result = await response.json();
            return result.workers || [];
            
        } catch (error) {
            console.error('Error finding workers:', error);
            return [];
        }
    }

    async postToMarketplace() {
        try {
            const response = await fetch(`${this.backendUrl}/api/gigs/marketplace`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.currentGig)
            });
            
            const result = await response.json();
            return result.workers || [];
            
        } catch (error) {
            console.error('Error posting to marketplace:', error);
            return [];
        }
    }

    // REAL-TIME WORKER SELECTION
    async selectWorker(workerId) {
        this.selectedWorker = this.workers.find(w => w.id === workerId);
        
        if (!this.selectedWorker) {
            this.handleError('Worker not found');
            return;
        }

        // Send gig invitation to worker
        const accepted = await this.sendGigInvitation(workerId);
        
        if (accepted) {
            this.startGigExecution();
        } else {
            this.workerDeclined();
        }
    }

    async sendGigInvitation(workerId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/gigs/invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId: this.currentGig.id,
                    workerId: workerId
                })
            });
            
            const result = await response.json();
            
            // Wait for worker response (real-time polling)
            return await this.waitForWorkerResponse(workerId);
            
        } catch (error) {
            console.error('Error sending invitation:', error);
            return false;
        }
    }

    async waitForWorkerResponse(workerId, timeout = 30000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const checkResponse = async () => {
                try {
                    const response = await fetch(`${this.backendUrl}/api/gigs/response/${this.currentGig.id}`);
                    const result = await response.json();
                    
                    if (result.status === 'accepted') {
                        resolve(true);
                        return;
                    } else if (result.status === 'declined') {
                        resolve(false);
                        return;
                    }
                    
                    // Continue polling if within timeout
                    if (Date.now() - startTime < timeout) {
                        setTimeout(checkResponse, 2000); // Check every 2 seconds
                    } else {
                        resolve(false); // Timeout
                    }
                    
                } catch (error) {
                    console.error('Error checking response:', error);
                    resolve(false);
                }
            };
            
            checkResponse();
        });
    }

    // VOICE RECOGNITION FOR FORM FILLING
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = true;
            this.voiceRecognition.interimResults = true;
            this.voiceRecognition.lang = 'en-US';
            
            this.voiceRecognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                        this.processVoiceCommand(transcript);
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Update UI with voice input
                this.updateVoiceUI(interimTranscript, finalTranscript);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.handleError('Voice recognition error. Please try again.');
            };
        }
    }

    processVoiceCommand(transcript) {
        const command = transcript.toLowerCase().trim();
        this.conversationHistory.push({ type: 'user', text: command });
        
        // Process different voice commands to fill form
        const categories = ['plumber', 'electrician', 'cleaning', 'handyman', 'moving', 'locksmith', 'hvac', 'painting', 'carpentry', 'landscaping'];
        
        // Check for category mentions
        for (const category of categories) {
            if (command.includes(category)) {
                this.fillFormField('category', category.charAt(0).toUpperCase() + category.slice(1));
                this.voiceResponse(`Setting category to ${category}. What type of ${category} work do you need?`);
                return;
            }
        }
        
        if (command.includes('urgent') || command.includes('asap')) {
            this.fillFormField('urgency', 'ASAP');
            this.voiceResponse('Marked as urgent. When do you need help?');
        }
        else if (command.includes('today')) {
            this.fillFormField('urgency', 'Today');
            this.voiceResponse('Looking for workers available today.');
        }
        else if (command.includes('budget') || command.includes('price') || command.includes('dollar')) {
            const priceMatch = command.match(/\$?(\d+)/);
            if (priceMatch) {
                this.fillFormField('budget', priceMatch[1]);
                this.voiceResponse(`Budget set to $${priceMatch[1]}. Any other details?`);
            }
        }
        else if (command.includes('location') || command.includes('address')) {
            this.voiceResponse('Please type your address or enable location services.');
        }
        else {
            // Store in notes/description field
            this.addToDescription(command);
            this.voiceResponse('Noted. Anything else?');
        }
        
        this.updateConversationUI();
    }

    fillFormField(fieldName, value) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            if (field.tagName === 'SELECT') {
                // For select fields, find and select the option
                const option = Array.from(field.options).find(opt => 
                    opt.value.toLowerCase() === value.toLowerCase()
                );
                if (option) {
                    field.value = option.value;
                }
            } else {
                field.value = value;
            }
            // Trigger change event for any dependent logic
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    addToDescription(text) {
        const descriptionField = document.querySelector('textarea[name="description"]') || document.querySelector('[name="description"]');
        if (descriptionField) {
            const currentText = descriptionField.value;
            descriptionField.value = currentText ? `${currentText}\n${text}` : text;
            descriptionField.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    voiceResponse(text) {
        this.conversationHistory.push({ type: 'system', text: text });
        
        // Use speech synthesis if available
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
        
        this.updateConversationUI();
    }

    // UI MANAGEMENT
    showMatchingUI() {
        // Remove any existing matching UI
        const existingUI = document.getElementById('quickhire-matching');
        if (existingUI) existingUI.remove();

        // Create matching overlay
        const matchingUI = document.createElement('div');
        matchingUI.id = 'quickhire-matching';
        matchingUI.className = 'quickhire-matching';
        matchingUI.innerHTML = `
            <div class="matching-overlay">
                <div class="matching-content">
                    <h3>🚀 Finding Nearby Workers</h3>
                    <div class="matching-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <div class="search-steps">
                            <span class="step active">🔍 Nearby (0-2 mi)</span>
                            <span class="step">📍 Expanded (2-5 mi)</span>
                            <span class="step">🏙️ City-wide (5-15 mi)</span>
                            <span class="step">🌐 Marketplace</span>
                        </div>
                    </div>
                    <p style="margin-top: 20px; color: #666;">Please wait while we find the best workers for you...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(matchingUI);
    }

    showMatchingProgress() {
        // This is called after showMatchingUI, just updates the UI state
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.animation = 'progressAnimation 2s infinite';
        }
    }

    showAvailableWorkers(workers) {
        const matchingUI = document.getElementById('quickhire-matching');
        if (matchingUI) {
            matchingUI.innerHTML = `
                <div class="matching-overlay">
                    <div class="workers-content">
                        <h3>✅ Found ${workers.length} Available Worker${workers.length > 1 ? 's' : ''}</h3>
                        <div class="workers-list">
                            ${workers.map(worker => `
                                <div class="worker-card" data-worker-id="${worker.id}">
                                    <div class="worker-photo">${worker.photo || '👤'}</div>
                                    <div class="worker-info">
                                        <h4>${worker.name}</h4>
                                        <p>⭐ ${worker.rating || '5.0'} • ${worker.distance || 'Nearby'}</p>
                                        <p>${worker.responseTime || 'Quick response'} • $${worker.hourlyRate || '50'}/hr</p>
                                    </div>
                                    <div class="worker-status available">Available Now</div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="expand-search-btn">🔍 Expand Search Area</button>
                        <button class="close-matching-btn">✕ Close</button>
                    </div>
                </div>
            `;

            // Add click handlers
            matchingUI.querySelectorAll('.worker-card').forEach(card => {
                card.addEventListener('click', () => {
                    const workerId = card.getAttribute('data-worker-id');
                    this.selectWorker(workerId);
                });
            });

            matchingUI.querySelector('.expand-search-btn')?.addEventListener('click', () => {
                this.expandSearch();
            });

            matchingUI.querySelector('.close-matching-btn')?.addEventListener('click', () => {
                matchingUI.remove();
            });
        }
    }

    showNoWorkersFound() {
        const matchingUI = document.getElementById('quickhire-matching');
        if (matchingUI) {
            matchingUI.innerHTML = `
                <div class="matching-overlay">
                    <div class="matching-content">
                        <h3>😔 No Workers Found Nearby</h3>
                        <p>We couldn't find any available workers in your area right now.</p>
                        <div style="margin-top: 20px;">
                            <button class="retry-btn" style="margin: 10px;">🔄 Try Again</button>
                            <button class="marketplace-btn" style="margin: 10px;">🌐 Post to Marketplace</button>
                            <button class="close-btn" style="margin: 10px;">✕ Close</button>
                        </div>
                    </div>
                </div>
            `;

            matchingUI.querySelector('.retry-btn')?.addEventListener('click', () => {
                this.startWorkerMatching();
            });

            matchingUI.querySelector('.marketplace-btn')?.addEventListener('click', async () => {
                const workers = await this.postToMarketplace();
                if (workers.length > 0) {
                    this.showAvailableWorkers(workers);
                }
            });

            matchingUI.querySelector('.close-btn')?.addEventListener('click', () => {
                matchingUI.remove();
            });
        }
    }

    updateVoiceUI(interim, final) {
        let voiceUI = document.getElementById('voice-interface');
        if (!voiceUI) {
            voiceUI = document.createElement('div');
            voiceUI.id = 'voice-interface';
            voiceUI.className = 'voice-interface';
            document.body.appendChild(voiceUI);
        }
        
        voiceUI.innerHTML = `
            <div class="voice-container">
                <div class="voice-input">
                    <span class="listening-indicator">🎤</span>
                    <span class="voice-text">${interim || final || 'Listening...'}</span>
                </div>
                <div class="conversation-history">
                    ${this.conversationHistory.slice(-5).map(msg => `
                        <div class="message ${msg.type}">${msg.text}</div>
                    `).join('')}
                </div>
                <button class="stop-voice-btn">Stop</button>
            </div>
        `;

        voiceUI.querySelector('.stop-voice-btn')?.addEventListener('click', () => {
            this.stopVoiceRecognition();
        });
    }

    updateConversationUI() {
        this.updateVoiceUI('', '');
    }

    // GIG EXECUTION FLOW
    startGigExecution() {
        // Hide matching UI
        const matchingUI = document.getElementById('quickhire-matching');
        if (matchingUI) matchingUI.remove();
        
        // Show gig in progress UI
        this.showGigInProgress();
        
        // Navigate to tracking page
        if (this.currentGig?.id) {
            window.location.href = `/quickhire/track/${this.currentGig.id}`;
        }
    }

    showGigInProgress() {
        const progressUI = document.createElement('div');
        progressUI.className = 'gig-progress-ui';
        progressUI.innerHTML = `
            <div class="progress-overlay">
                <div class="progress-content">
                    <h3>✅ Worker Accepted!</h3>
                    <p>Redirecting to tracking page...</p>
                </div>
            </div>
        `;
        document.body.appendChild(progressUI);

        setTimeout(() => {
            progressUI.remove();
        }, 2000);
    }

    // VOICE CONTROL
    toggleVoiceRecognition() {
        if (this.voiceRecognition) {
            try {
                this.voiceRecognition.start();
                this.voiceResponse('Voice recognition started. Speak to fill the form.');
                this.updateVoiceUI('', '');
            } catch (error) {
                console.error('Voice error:', error);
                this.handleError('Voice recognition not available. Please check your browser settings.');
            }
        } else {
            this.handleError('Voice recognition not supported in your browser.');
        }
    }

    stopVoiceRecognition() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
            const voiceUI = document.getElementById('voice-interface');
            if (voiceUI) voiceUI.remove();
        }
    }

    // ERROR HANDLING
    handleError(message) {
        console.error('QuickHire Error:', message);
        
        // Remove existing error
        const existingError = document.querySelector('.quickhire-error');
        if (existingError) existingError.remove();

        // Show error to user
        const errorUI = document.createElement('div');
        errorUI.className = 'quickhire-error';
        errorUI.innerHTML = `
            <div class="error-message">
                <span>⚠️</span>
                <span>${message}</span>
                <button class="error-close-btn">×</button>
            </div>
        `;
        
        document.body.appendChild(errorUI);

        errorUI.querySelector('.error-close-btn')?.addEventListener('click', () => {
            errorUI.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorUI.parentElement) {
                errorUI.remove();
            }
        }, 5000);
    }

    // UTILITY METHODS
    expandSearch() {
        this.startWorkerMatching();
    }

    workerDeclined() {
        this.workers = this.workers.filter(w => w.id !== this.selectedWorker.id);
        this.selectedWorker = null;
        if (this.workers.length > 0) {
            this.showAvailableWorkers(this.workers);
            this.voiceResponse('Worker declined. Showing other available options.');
        } else {
            this.showNoWorkersFound();
        }
    }

    // Cleanup
    cleanup() {
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
        }
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        const voiceUI = document.getElementById('voice-interface');
        if (voiceUI) voiceUI.remove();
        const matchingUI = document.getElementById('quickhire-matching');
        if (matchingUI) matchingUI.remove();
    }
}

export default QuickHireWorkflow;
