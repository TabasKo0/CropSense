import express from 'express';
import { runQuery, getRow, getAllRows } from '../database.js';

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
            const itemData = await getRow(
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

            // Update the sold count
            await runQuery(
                'UPDATE items SET sold = ? WHERE item_id = ?',
                [newSoldCount, item_id]
            );

            // Create the order
            const result = await runQuery(
                'INSERT INTO orders (item_id, qty, uuid, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [item_id, parseInt(qty), userId, 'pending', new Date().toISOString(), new Date().toISOString()]
            );

            // Get the created order
            const order = await getRow('SELECT * FROM orders WHERE order_id = ?', [result.lastID]);

            return {
                success: true,
                message: 'Order placed successfully',
                order: order
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
            // Get orders with item details using JOIN
            const ordersData = await getAllRows(`
                SELECT 
                    o.order_id, o.item_id, o.qty, o.progress, o.created_at, o.updated_at,
                    i.title, i.price, i.type, i.desp, i.image_link
                FROM orders o
                LEFT JOIN items i ON o.item_id = i.item_id
                WHERE o.uuid = ?
                ORDER BY o.created_at DESC
            `, [userId]);

            if (!ordersData || ordersData.length === 0) {
                return {
                    success: true,
                    orders: [],
                    count: 0
                };
            }

            // Map the data to match the expected format
            const ordersWithItems = ordersData.map(order => ({
                order_id: order.order_id,
                item_id: order.item_id,
                qty: order.qty,
                progress: order.progress,
                created_at: order.created_at,
                updated_at: order.updated_at,
                items: order.title ? {
                    id: order.item_id,
                    title: order.title,
                    price: order.price,
                    type: order.type,
                    desp: order.desp,
                    image_url: order.image_link
                } : null
            }));

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

// Express routes using the ordersAPI
router.post('/', async (req, res) => {
    const { userId, ...orderData } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID required'
        });
    }
    
    const result = await ordersAPI.placeOrder(orderData, userId);
    res.json(result);
});

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await ordersAPI.getUserOrders(userId);
    res.json(result);
});

export default router;