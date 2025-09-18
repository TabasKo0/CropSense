import express from 'express';
import { runQuery, getRow, getAllRows } from '../database.js';

const router = express.Router();

// Items API - Direct SQLite calls
const itemsAPI = {
    // GET all items or filter by uuid
    async getItems(uuid = null) {
        try {
            let sql = 'SELECT * FROM items ORDER BY created_at DESC';
            let params = [];
            
            if (uuid) {
                sql = 'SELECT * FROM items WHERE uuid = ? ORDER BY created_at DESC';
                params = [uuid];
            }

            const data = await getAllRows(sql, params);

            return {
                success: true,
                items: data || [],
                count: data ? data.length : 0,
                filter: uuid ? `User: ${uuid}` : 'All items'
            };

        } catch (error) {
            console.error('Items retrieval error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch items',
                items: [],
                count: 0
            };
        }
    },

    // GET specific item by ID
    async getItemById(item_id) {
        try {
            const data = await getRow('SELECT * FROM items WHERE item_id = ?', [item_id]);
            
            if (!data) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }

            return {
                success: true,
                item: data
            };

        } catch (error) {
            console.error('Item fetch error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch item'
            };
        }
    },

    // POST - Add new item (requires authentication)
    async addItem(itemData, userId) {
        try {
            const { image_link, image_bucket, title, desp, price, contact, type, qty } = itemData;

            // Validation
            if (!title || !desp || !price || !contact || !type) {
                return {
                    success: false,
                    error: 'Title, description, price, contact, and type are required'
                };
            }
            if (price <= 0) {
                return {
                    success: false,
                    error: 'Price must be greater than 0'
                };
            }

            if (qty && qty <= 0) {
                return {
                    success: false,
                    error: 'Quantity must be greater than 0'
                };
            }

            const result = await runQuery(
                'INSERT INTO items (uuid, image_link, image_bucket, title, desp, price, contact, type, qty, created_at, updated_at, item_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, hex(randomblob(16)))',
                [
                    userId,
                    image_link || null,
                    image_bucket || null,
                    title.trim(),
                    desp.trim(),
                    parseFloat(price),
                    contact.trim(),
                    type.trim(),
                    qty ? parseInt(qty) : null,
                    new Date().toISOString(),
                    new Date().toISOString()
                ]
            );

            // Get the created item
            const item = await getRow('SELECT * FROM items WHERE id = ?', [result.lastID]);

            return {
                success: true,
                message: 'Item added successfully',
                item: item
            };

        } catch (error) {
            console.error('Item creation error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create item'
            };
        }
    },

    // PUT - Update item (only by owner)
    async updateItem(id, itemData, userId) {
        try {
            // First check if item exists and user owns it
            const existingItem = await getRow('SELECT uuid FROM items WHERE id = ?', [id]);
            
            if (!existingItem) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }

            if (existingItem.uuid !== userId) {
                return {
                    success: false,
                    error: 'You can only update your own items'
                };
            }

            const { image_link, image_bucket, title, desp, price, contact, type, qty } = itemData;

            // Build dynamic update query
            const updateFields = [];
            const params = [];

            if (title !== undefined) {
                updateFields.push('title = ?');
                params.push(title.trim());
            }
            if (desp !== undefined) {
                updateFields.push('desp = ?');
                params.push(desp.trim());
            }
            if (price !== undefined) {
                updateFields.push('price = ?');
                params.push(parseFloat(price));
            }
            if (contact !== undefined) {
                updateFields.push('contact = ?');
                params.push(contact.trim());
            }
            if (type !== undefined) {
                updateFields.push('type = ?');
                params.push(type.trim());
            }
            if (qty !== undefined) {
                updateFields.push('qty = ?');
                params.push(qty ? parseInt(qty) : null);
            }
            if (image_link !== undefined) {
                updateFields.push('image_link = ?');
                params.push(image_link);
            }
            if (image_bucket !== undefined) {
                updateFields.push('image_bucket = ?');
                params.push(image_bucket);
            }

            // Always update timestamp
            updateFields.push('updated_at = ?');
            params.push(new Date().toISOString());
            params.push(id); // for WHERE clause

            const sql = `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`;
            await runQuery(sql, params);

            // Get updated item
            const updatedItem = await getRow('SELECT * FROM items WHERE id = ?', [id]);

            return {
                success: true,
                message: 'Item updated successfully',
                item: updatedItem
            };

        } catch (error) {
            console.error('Item update error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update item'
            };
        }
    },

    // DELETE - Delete item (only by owner)
    async deleteItem(id, userId) {
        try {
            // First check if item exists and user owns it
            const existingItem = await getRow('SELECT uuid, title FROM items WHERE id = ?', [id]);
            
            if (!existingItem) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }

            if (existingItem.uuid !== userId) {
                return {
                    success: false,
                    error: 'You can only delete your own items'
                };
            }

            await runQuery('DELETE FROM items WHERE id = ?', [id]);

            return {
                success: true,
                message: `Item "${existingItem.title}" deleted successfully`
            };

        } catch (error) {
            console.error('Item deletion error:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete item'
            };
        }
    }
};

// Express routes using the itemsAPI
router.get('/', async (req, res) => {
    const { uuid } = req.query;
    const result = await itemsAPI.getItems(uuid);
    res.json(result);
});

router.get('/:item_id', async (req, res) => {
    const { item_id } = req.params;
    const result = await itemsAPI.getItemById(item_id);
    res.json(result);
});

router.post('/', async (req, res) => {
    // Extract user ID from auth token (simplified for this example)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authorization token required'
        });
    }
    
    // In a real implementation, you'd verify the JWT and extract user ID
    // For now, assuming userId is provided in body for testing
    const { userId, ...itemData } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID required'
        });
    }
    
    const result = await itemsAPI.addItem(itemData, userId);
    res.json(result);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { userId, ...itemData } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID required'
        });
    }
    
    const result = await itemsAPI.updateItem(id, itemData, userId);
    res.json(result);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({
            success: false,
            error: 'User ID required'
        });
    }
    
    const result = await itemsAPI.deleteItem(id, userId);
    res.json(result);
});

export default router;