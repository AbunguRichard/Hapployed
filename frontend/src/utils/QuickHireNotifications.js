// UBER-LIKE NOTIFICATION & ACCEPTANCE WORKFLOW
import { xhrFetch } from './xhrFetch';

class QuickHireNotifications {
    constructor() {
        this.workerSockets = new Map();
        this.pendingGigs = new Map();
        this.workerLocations = new Map();
        this.gigTimeouts = new Map();
        this.backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        
        this.initializeNotificationSystem();
    }

    initializeNotificationSystem() {
        console.log('QuickHire Notification System initialized');
    }

    // 1. GIG POSTING → WORKER MATCHING → NOTIFICATIONS
    async postAndNotifyGig(gigData) {
        try {
            // Create gig in database
            const gig = await this.createGig(gigData);
            this.pendingGigs.set(gig.id, gig);

            // Find nearby available workers
            const nearbyWorkers = await this.findNearbyWorkers(gig);
            
            if (nearbyWorkers.length > 0) {
                // Send real-time notifications to workers
                await this.sendWorkerNotifications(gig, nearbyWorkers);
                
                // Start acceptance timeout (like Uber's 15-30 second window)
                this.startAcceptanceTimeout(gig.id, nearbyWorkers);
                
                return {
                    success: true,
                    gigId: gig.id,
                    workersNotified: nearbyWorkers.length,
                    message: `Notified ${nearbyWorkers.length} nearby workers`
                };
            } else {
                // Expand search or queue gig
                return await this.handleNoWorkers(gig);
            }
            
        } catch (error) {
            console.error('Gig posting failed:', error);
            throw error;
        }
    }

    async createGig(gigData) {
        const response = await fetch(`${this.backendUrl}/api/quickhire/gigs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gigData)
        });

        const responseClone = response.clone();

        if (!response.ok) {
            const errorData = await responseClone.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(errorData.detail || 'Failed to create gig');
        }

        return await response.json();
    }

    // 2. FIND NEARBY WORKERS WITH PUSH NOTIFICATION ELIGIBILITY
    async findNearbyWorkers(gig) {
        const { location, category, urgency } = gig;
        
        const response = await fetch(`${this.backendUrl}/api/workers/nearby`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: location.coordinates[1],
                longitude: location.coordinates[0],
                radius: urgency === 'ASAP' ? 5 : 2, // miles
                category,
                online: true,
                available: true
            })
        });

        const data = await response.json();
        const workers = data.workers || [];

        // Filter workers who should receive push notifications
        return workers.filter(worker => 
            this.shouldNotifyWorker(worker, gig)
        );
    }

    shouldNotifyWorker(worker, gig) {
        // Uber-like eligibility criteria
        return true; // Simplified for now, can add more criteria
    }

    wasRecentlyDeclined(workerId, category) {
        // Check if worker recently declined similar gigs
        return false; // Simplified for now
    }

    isInWorkingHours(worker) {
        // Check if worker is within their working hours
        return true; // Simplified for now
    }

    // 3. SEND REAL-TIME NOTIFICATIONS TO WORKERS
    async sendWorkerNotifications(gig, workers) {
        const notifications = workers.map(worker => 
            this.sendWorkerNotification(worker, gig)
        );

        // Send notifications in parallel
        await Promise.allSettled(notifications);
        
        // Log notification event
        await this.logNotificationEvent(gig.id, workers.map(w => w.id));
    }

    async sendWorkerNotification(worker, gig) {
        const notificationPayload = {
            type: 'NEW_GIG',
            gigId: gig.id,
            category: gig.category,
            urgency: gig.urgency,
            price: gig.estimatedPrice || gig.budget,
            location: gig.location.address || 'Nearby',
            estimatedEarnings: this.calculateEstimatedEarnings(gig),
            expiration: Date.now() + 30000, // 30 seconds to accept
            clientRating: 4.5
        };

        try {
            // Send in-app notification
            await this.sendInAppNotification(worker, notificationPayload);
            
            // Send push notification if available
            if (worker.pushToken) {
                await this.sendPushNotification(worker, notificationPayload);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Failed to send notification:', error);
            return { success: false, error };
        }
    }

    calculateEstimatedEarnings(gig) {
        return gig.estimatedPrice || gig.budget || 100;
    }

    // 4. WORKER NOTIFICATION CHANNELS
    async sendPushNotification(worker, payload) {
        try {
            await fetch(`${this.backendUrl}/api/push/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: worker.pushToken,
                    title: `New ${payload.category} Gig Available`,
                    body: `$${payload.price} • ${payload.location} • ${payload.urgency}`,
                    data: payload,
                    priority: 'high',
                    ttl: 30000
                })
            });
        } catch (error) {
            console.error('Push notification failed:', error);
        }
    }

    async sendInAppNotification(worker, payload) {
        try {
            await fetch(`${this.backendUrl}/api/notifications/worker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: worker.id,
                    type: 'GIG_OFFER',
                    payload: payload,
                    read: false
                })
            });
        } catch (error) {
            console.error('In-app notification failed:', error);
        }
    }

    async logNotificationEvent(gigId, workerIds) {
        try {
            await fetch(`${this.backendUrl}/api/notifications/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    workerIds,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Failed to log notification:', error);
        }
    }

    // 5. WORKER ACCEPTANCE FLOW
    async handleWorkerAcceptance(workerId, gigId) {
        try {
            const gig = this.pendingGigs.get(gigId);
            if (!gig) {
                throw new Error('Gig no longer available');
            }

            // Reserve gig for this worker
            const reserved = await this.reserveGigForWorker(gigId, workerId);
            if (!reserved) {
                throw new Error('Gig already accepted by another worker');
            }

            // Notify client that worker accepted
            await this.notifyClientWorkerAccepted(gigId, workerId);

            // Cancel other worker notifications
            await this.cancelOtherWorkerNotifications(gigId, workerId);

            // Clear timeout
            const timeout = this.gigTimeouts.get(gigId);
            if (timeout) {
                clearTimeout(timeout);
                this.gigTimeouts.delete(gigId);
            }

            return {
                success: true,
                message: 'Gig accepted successfully!',
                nextStep: 'proceed_to_gig'
            };

        } catch (error) {
            console.error('Acceptance failed:', error);
            throw error;
        }
    }

    // 6. GIG RESERVATION SYSTEM
    async reserveGigForWorker(gigId, workerId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/gigs/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    workerId,
                    reservedUntil: Date.now() + 120000 // 2 minutes to confirm
                })
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Reservation failed:', error);
            return false;
        }
    }

    // 7. CLIENT NOTIFICATION WHEN WORKER ACCEPTS
    async notifyClientWorkerAccepted(gigId, workerId) {
        try {
            const worker = await this.getWorkerProfile(workerId);
            const gig = this.pendingGigs.get(gigId);

            await fetch(`${this.backendUrl}/api/notifications/client`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: gig.clientId,
                    type: 'WORKER_ACCEPTED',
                    gigId,
                    workerId,
                    workerName: worker.name,
                    workerRating: worker.rating
                })
            });
        } catch (error) {
            console.error('Client notification failed:', error);
        }
    }

    async getWorkerProfile(workerId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/worker-profiles/${workerId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get worker profile:', error);
            return { name: 'Worker', rating: 5.0 };
        }
    }

    // 8. CANCEL OTHER NOTIFICATIONS
    async cancelOtherWorkerNotifications(gigId, acceptedWorkerId) {
        try {
            await fetch(`${this.backendUrl}/api/notifications/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gigId,
                    excludeWorkerId: acceptedWorkerId
                })
            });
        } catch (error) {
            console.error('Failed to cancel notifications:', error);
        }
    }

    // 9. ACCEPTANCE TIMEOUT SYSTEM
    startAcceptanceTimeout(gigId, workers) {
        const timeout = setTimeout(async () => {
            console.log(`Acceptance timeout reached for gig ${gigId}`);
            
            // Check if gig was accepted
            const gig = await this.checkGigStatus(gigId);
            
            if (gig.status === 'Dispatching' || gig.status === 'Posted') {
                // No one accepted in time, expand search
                await this.expandGigSearch(gigId);
            }
            
            this.pendingGigs.delete(gigId);
            this.gigTimeouts.delete(gigId);
        }, 30000); // 30 second acceptance window

        this.gigTimeouts.set(gigId, timeout);
    }

    async checkGigStatus(gigId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/quickhire/gigs/${gigId}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to check gig status:', error);
            return { status: 'unknown' };
        }
    }

    async expandGigSearch(gigId) {
        console.log(`Expanding search for gig ${gigId}`);
        // Implement radius expansion logic
        const gig = this.pendingGigs.get(gigId);
        if (gig) {
            // Increase radius and search again
            gig.radius = (gig.radius || 5) * 2;
            const moreWorkers = await this.findNearbyWorkers(gig);
            if (moreWorkers.length > 0) {
                await this.sendWorkerNotifications(gig, moreWorkers);
            }
        }
    }

    // 10. NO WORKERS HANDLER
    async handleNoWorkers(gig) {
        return {
            success: false,
            gigId: gig.id,
            workersNotified: 0,
            message: 'No workers available nearby. Expanding search...'
        };
    }

    // Cleanup
    cleanup() {
        this.gigTimeouts.forEach((timeout, gigId) => {
            clearTimeout(timeout);
        });
        this.gigTimeouts.clear();
        this.pendingGigs.clear();
    }
}

export default QuickHireNotifications;
