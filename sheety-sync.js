/**
 * Sheety Sync Helper - Auto-sync orders with Sheety API
 * 
 * IMPORTANT: Column Mapping Configuration
 * ========================================
 * The payload keys in buildOrderPayloadFromForm() must match your Google Sheet column headers.
 * If your sheet uses different column names, update the mapping in that function.
 * 
 * Default mapping (based on existing order structure):
 * - orderNumber → Order Number column
 * - orderDate → Order Date column
 * - customerNumber → Customer Number column
 * - customerName → Customer Name column
 * - area → Area column
 * - block → Block column
 * - street → Street column
 * - houseNumber → House Number column
 * - floor → Floor column
 * - housingType → Housing Type column
 * - locationNotes → Location Notes column
 * - serviceType → Service Type column
 * - visitDate → Visit Date column
 * - visitTime → Visit Time column
 * - cleaningDate → Cleaning Date column
 * - cleaningTime → Cleaning Time column
 * - paymentMethod → Payment Method column
 * - totalAmount → Total Amount column
 * - paymentStatus → Payment Status column
 * - bookingStatus → Booking Status column
 * - departureTime → Departure Time column
 * - customerNotes → Customer Notes column
 * - teamNotes → Team Notes column
 * - customerRating → Customer Rating column
 * - ratingNotes → Rating Notes column
 * - cancellationReason → Cancellation Reason column
 */

(function() {
    'use strict';

    // ============================================================================
    // CONFIGURATION - Update these values as needed
    // ============================================================================
    
    const SHEETY_BASE = 'https://api.sheety.co/984c17c54dafbc5e8fe827b90d39f223/orders';
    const SHEETY_HEADERS = {
        'Content-Type': 'application/json',
        // Add Authorization header if needed:
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
    };
    const POLL_INTERVAL = 30000; // 30 seconds (in milliseconds)

    // ============================================================================
    // HELPER FUNCTIONS
    // ============================================================================

    /**
     * Build Sheety payload from form fields
     * NOTE: Update the key names if your sheet column headers are different
     */
    function buildOrderPayloadFromForm() {
        // Get service type (handle "other" option)
        let serviceType = document.getElementById('service-type').value;
        if (serviceType === 'أخرى') {
            serviceType = document.getElementById('other-service').value;
        }
        
        // Get housing type (handle "other" option)
        let housingType = document.getElementById('housing-type').value;
        if (housingType === 'أخرى') {
            housingType = document.getElementById('other-housing').value;
        }

        return {
            order: {
                orderNumber: document.getElementById('order-number').value,
                orderDate: document.getElementById('order-date').value,
                customerNumber: document.getElementById('customer-number').value,
                customerName: document.getElementById('customer-name').value,
                area: document.getElementById('area').value,
                block: document.getElementById('block').value,
                street: document.getElementById('street').value,
                houseNumber: document.getElementById('house-number').value,
                floor: document.getElementById('floor').value,
                housingType: housingType,
                locationNotes: document.getElementById('location-notes').value,
                serviceType: serviceType,
                visitDate: document.getElementById('visit-date').value,
                visitTime: document.getElementById('visit-time').value,
                cleaningDate: '',
                cleaningTime: '',
                paymentMethod: document.getElementById('payment-method').value,
                totalAmount: 0,
                paymentStatus: 'غير مدفوع',
                bookingStatus: 'معاينة',
                departureTime: '',
                customerNotes: '',
                teamNotes: '',
                customerRating: 0,
                ratingNotes: '',
                cancellationReason: ''
            }
        };
    }

    /**
     * Normalize Sheety response rows to order objects
     */
    function normalizeSheetyRows(rows) {
        if (!rows || !Array.isArray(rows)) return [];
        
        return rows.map(row => {
            // Copy all properties from the row
            const normalized = { ...row };
            
            // Add sheety ID if present
            if (row.id) {
                normalized.sheetyId = row.id;
            }
            
            return normalized;
        });
    }

    // ============================================================================
    // CORE API FUNCTIONS
    // ============================================================================

    /**
     * Create a new order on Sheety
     */
    async function createOrderOnSheet(orderData) {
        try {
            const response = await fetch(`${SHEETY_BASE}/orders`, {
                method: 'POST',
                headers: SHEETY_HEADERS,
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error(`Sheety POST failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Order created on Sheety:', data);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('sheety:order:created', {
                detail: { order: data.order }
            }));

            return data.order;
        } catch (error) {
            console.error('Error creating order on Sheety:', error);
            throw error;
        }
    }

    /**
     * Update an existing order on Sheety
     */
    async function updateOrderOnSheet(sheetyId, updates) {
        try {
            const response = await fetch(`${SHEETY_BASE}/orders/${sheetyId}`, {
                method: 'PUT',
                headers: SHEETY_HEADERS,
                body: JSON.stringify({ order: updates })
            });

            if (!response.ok) {
                throw new Error(`Sheety PUT failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Order updated on Sheety:', data);

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('sheety:order:updated', {
                detail: { order: data.order, sheetyId }
            }));

            return data.order;
        } catch (error) {
            console.error('Error updating order on Sheety:', error);
            throw error;
        }
    }

    /**
     * Fetch all orders from Sheety
     */
    async function fetchOrdersFromSheet() {
        try {
            const response = await fetch(`${SHEETY_BASE}/orders`, {
                method: 'GET',
                headers: SHEETY_HEADERS
            });

            if (!response.ok) {
                throw new Error(`Sheety GET failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const normalized = normalizeSheetyRows(data.orders || []);
            
            console.log('Fetched orders from Sheety:', normalized);

            // Try to call existing hooks if they exist
            if (typeof window.applySheetyOrders === 'function') {
                window.applySheetyOrders(normalized);
            } else if (typeof window.loadOrdersFromSheet === 'function') {
                window.loadOrdersFromSheet(normalized);
            } else if (typeof window.renderAllOrders === 'function') {
                window.renderAllOrders(normalized);
            }

            // Always dispatch event for flexibility
            window.dispatchEvent(new CustomEvent('sheety:orders:fetched', {
                detail: { orders: normalized }
            }));

            return normalized;
        } catch (error) {
            console.error('Error fetching orders from Sheety:', error);
            throw error;
        }
    }

    // ============================================================================
    // FORM INTERCEPTION
    // ============================================================================

    function interceptFormSubmit() {
        const form = document.getElementById('new-order-form');
        if (!form) {
            console.warn('Form #new-order-form not found');
            return;
        }

        form.addEventListener('submit', async function(e) {
            // Let the existing handler run first (don't prevent default initially)
            // We'll add our Sheety sync after
            
            // Small delay to allow existing handlers to complete
            setTimeout(async () => {
                try {
                    const payload = buildOrderPayloadFromForm();
                    const createdOrder = await createOrderOnSheet(payload);
                    
                    // Add sheety ID to the local order object if possible
                    if (createdOrder && createdOrder.id) {
                        const orderNumber = payload.order.orderNumber;
                        
                        // Try to find and update the local order
                        if (window.orders && Array.isArray(window.orders)) {
                            const localOrder = window.orders.find(o => o.orderNumber == orderNumber);
                            if (localOrder) {
                                localOrder.sheetyId = createdOrder.id;
                            }
                        }

                        // Call existing hooks if present
                        if (typeof window.addOrderLocal === 'function') {
                            window.addOrderLocal(createdOrder);
                        } else if (typeof window.renderAllOrders === 'function') {
                            window.renderAllOrders();
                        }
                    }
                    
                    console.log('Order synced to Sheety successfully');
                } catch (error) {
                    console.error('Failed to sync order to Sheety:', error);
                    // Don't block the UI on sync failure
                }
            }, 100);
        }, true); // Use capture phase
    }

    // ============================================================================
    // DELEGATED CLICK LISTENER FOR DATA ATTRIBUTES
    // ============================================================================

    function setupDataAttributeListener() {
        document.addEventListener('click', async function(e) {
            const target = e.target.closest('[data-sheety-action][data-sheety-id]');
            if (!target) return;

            const action = target.getAttribute('data-sheety-action');
            const sheetyId = target.getAttribute('data-sheety-id');
            
            if (!sheetyId) {
                console.warn('No sheety ID found on element');
                return;
            }

            try {
                let updates = {};

                // Handle different action types
                if (action === 'update-status') {
                    const newStatus = target.getAttribute('data-status');
                    if (newStatus) {
                        updates.bookingStatus = newStatus;
                    }
                } else if (action === 'update-payment') {
                    const paymentStatus = target.getAttribute('data-payment-status');
                    if (paymentStatus) {
                        updates.paymentStatus = paymentStatus;
                    }
                } else if (action === 'update-payment-method') {
                    const paymentMethod = target.getAttribute('data-payment-method');
                    if (paymentMethod) {
                        updates.paymentMethod = paymentMethod;
                    }
                }

                // If we have updates, send them
                if (Object.keys(updates).length > 0) {
                    await updateOrderOnSheet(sheetyId, updates);
                    console.log(`Updated order ${sheetyId}:`, updates);
                }
            } catch (error) {
                console.error('Error handling data-attribute action:', error);
            }
        });
    }

    // ============================================================================
    // PERIODIC POLLING
    // ============================================================================

    function startPeriodicPolling() {
        // Initial fetch
        fetchOrdersFromSheet().catch(err => console.error('Initial fetch failed:', err));

        // Set up periodic polling
        setInterval(() => {
            fetchOrdersFromSheet().catch(err => console.error('Polling fetch failed:', err));
        }, POLL_INTERVAL);

        console.log(`Sheety polling started (every ${POLL_INTERVAL / 1000}s)`);
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('Sheety Sync initialized');

        // Set up all features
        interceptFormSubmit();
        setupDataAttributeListener();
        startPeriodicPolling();

        // Expose public API
        window.sheetySync = {
            createOrderOnSheet,
            updateOrderOnSheet,
            fetchOrdersFromSheet
        };
    }

    // Start initialization
    init();

})();
