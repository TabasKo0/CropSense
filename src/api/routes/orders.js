import express from 'express';
import dbManager from '../utils/database.js';

const router = express.Router();

// Orders API - Direct SQLite calls
const ordersAPI = {
    // POST - Place a new order
    async placeOrder(orderData, userId) {
        try {
            const { item_id, qty } = orderData;

            // Validation
            if (!item_id || !qty) {
                return {
                    success: false,
                    error: 'Item ID and quantity are required'
                };
            }

            if (qty <= 0) {
                return {
                    success: false,
                    error: 'Quantity must be greater than 0'
                };
            }
            //console.log(item_id);

            // First, get the current item data to check stock availability
            const itemData = await dbManager.get(
                'SELECT sold, qty FROM items WHERE item_id = ?',
                [item_id]
            );

            if (!itemData) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }

            const currentSold = itemData.sold || 0;
            const totalQuantity = itemData.qty;
            const newSoldCount = currentSold + parseInt(qty);

            // Check if there's enough stock
            if (totalQuantity && newSoldCount > totalQuantity) {
                return {
                    success: false,
                    error: 'Insufficient stock available'
                };
            }

            // Update the sold count and sold_out status
            let updateQuery = 'UPDATE items SET sold = ?';
            let updateParams = [newSoldCount];

            // If new sold count equals total quantity, mark as sold out
            if (totalQuantity && newSoldCount >= totalQuantity) {
                updateQuery += ', sold = 1';
            }

            updateQuery += ' WHERE item_id = ?';
            updateParams.push(item_id);

            await dbManager.run(updateQuery, updateParams);

            // Only if stock update succeeds, create the order
            const result = await dbManager.run(
                `INSERT INTO orders (item_id, qty, uuid, progress, created_at, updated_at) 
                 VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [item_id, parseInt(qty), userId]
            );

            // Get the created order
            const data = await dbManager.get(
                'SELECT * FROM orders WHERE rowid = ?',
                [result.lastID]
            );

            if (!data) {
                // Rollback the sold count update since order creation failed
                await dbManager.run(
                    'UPDATE items SET sold = ? WHERE item_id = ?',
                    [currentSold, item_id]
                );
                throw new Error('Failed to retrieve created order');
            }

            return {
                success: true,
                message: 'Order placed successfully',
                order: data
            };

        } catch (error) {
            console.error('Order creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to place order'
            };
        }
    },

    // GET - Fetch user orders with item details
    async getUserOrders(userId) {
        try {
            // First, get orders with basic data (item_id, quantity, status)
            const ordersData = await dbManager.all(
                'SELECT order_id, item_id, qty, progress, created_at, updated_at FROM orders WHERE uuid = ? ORDER BY created_at DESC',
                [userId]
            );

            if (!ordersData || ordersData.length === 0) {
                return {
                    success: true,
                    orders: [],
                    count: 0
                };
            }

            // Extract unique item_ids to fetch item details
            const itemIds = [...new Set(ordersData.map(order => order.item_id))];
            console.log(itemIds);
            
            // Fetch item details for all item_ids
            const placeholders = itemIds.map(() => '?').join(',');
            const itemsData = await dbManager.all(
                `SELECT item_id, title, price, type, description, image_link FROM items WHERE item_id IN (${placeholders})`,
                itemIds
            );
            
            console.log("Fetched item details:", itemsData);

            // Map item details to orders
            const ordersWithItems = ordersData.map(order => {
                const itemDetails = itemsData && Array.isArray(itemsData) ?
                    itemsData.find(item => item.item_id === order.item_id) :
                    null;

                return {
                    ...order,
                    items: itemDetails ? {
                        id: itemDetails.item_id,
                        title: itemDetails.title,
                        price: itemDetails.price,
                        type: itemDetails.type,
                        desp: itemDetails.description,
                        image_url: itemDetails.image_link,
                        farmer_name: itemDetails.farmer_name
                    } : null
                };
            });


            return {
                success: true,
                orders: ordersWithItems,
                count: ordersWithItems.length
            };

        } catch (error) {
            console.error('Orders retrieval error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch orders',
                orders: [],
                count: 0
            };
        }
    }
};

// Express routes that use the ordersAPI
// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await ordersAPI.placeOrder(req.body, userId);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/orders - Get user orders
router.get('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await ordersAPI.getUserOrders(userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;