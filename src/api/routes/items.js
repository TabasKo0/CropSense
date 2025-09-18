import express from 'express';
import dbManager from '../utils/database.js';

const router = express.Router();

// Items API - Direct SQLite calls
const itemsAPI = {
    // GET all items or filter by uuid
    async getItems(uuid = null) {
        try {
            let query;
            let params = [];
            
            if (uuid) {
                query = 'SELECT * FROM items WHERE uuid = ? ORDER BY created_at DESC';
                params = [uuid];
            } else {
                query = 'SELECT * FROM items ORDER BY created_at DESC';
            }

            const data = await dbManager.all(query, params);

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
            const data = await dbManager.get(
                'SELECT * FROM items WHERE item_id = ?',
                [item_id]
            );
            
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

            const result = await dbManager.run(
                `INSERT INTO items (uuid, image_link, image_bucket, title, description, price, contact, type, qty, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [
                    userId,
                    image_link || null,
                    image_bucket || null,
                    title.trim(),
                    desp.trim(),
                    parseFloat(price),
                    contact.trim(),
                    type.trim(),
                    qty ? parseInt(qty) : null
                ]
            );

            // Get the created item
            const data = await dbManager.get(
                'SELECT * FROM items WHERE rowid = ?',
                [result.lastID]
            );

            if (!data) {
                throw new Error('Failed to retrieve created item');
            }

            return {
                success: true,
                message: 'Item added successfully',
                item: data
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
            const existingItem = await dbManager.get(
                'SELECT uuid FROM items WHERE id = ?',
                [id]
            );
            
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

            // Prepare update data and parameters
            const updateFields = [];
            const updateParams = [];

            if (title !== undefined) {
                updateFields.push('title = ?');
                updateParams.push(title.trim());
            }
            if (desp !== undefined) {
                updateFields.push('description = ?');
                updateParams.push(desp.trim());
            }
            if (price !== undefined) {
                updateFields.push('price = ?');
                updateParams.push(parseFloat(price));
            }
            if (contact !== undefined) {
                updateFields.push('contact = ?');
                updateParams.push(contact.trim());
            }
            if (type !== undefined) {
                updateFields.push('type = ?');
                updateParams.push(type.trim());
            }
            if (qty !== undefined) {
                updateFields.push('qty = ?');
                updateParams.push(qty ? parseInt(qty) : null);
            }
            if (image_link !== undefined) {
                updateFields.push('image_link = ?');
                updateParams.push(image_link);
            }
            if (image_bucket !== undefined) {
                updateFields.push('image_bucket = ?');
                updateParams.push(image_bucket);
            }

            if (updateFields.length === 0) {
                return {
                    success: false,
                    error: 'No fields to update'
                };
            }

            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            updateParams.push(id);

            await dbManager.run(
                `UPDATE items SET ${updateFields.join(', ')} WHERE id = ?`,
                updateParams
            );

            // Get the updated item
            const data = await dbManager.get(
                'SELECT * FROM items WHERE id = ?',
                [id]
            );

            if (!data) {
                throw new Error('Failed to retrieve updated item');
            }

            return {
                success: true,
                message: 'Item updated successfully',
                item: data
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
            const existingItem = await dbManager.get(
                'SELECT uuid, title FROM items WHERE id = ?',
                [id]
            );
            
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

            await dbManager.run(
                'DELETE FROM items WHERE id = ?',
                [id]
            );

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

// Express routes that use the itemsAPI
// GET /api/items - Get all items or filter by user
router.get('/', async (req, res) => {
    try {
        const { uuid } = req.query;
        const result = await itemsAPI.getItems(uuid);
        
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

// GET /api/items/:id - Get specific item by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await itemsAPI.getItemById(id);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/items - Add new item (requires authentication)
router.post('/', async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await itemsAPI.addItem(req.body, userId);
        
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

// PUT /api/items/:id - Update item (only by owner)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await itemsAPI.updateItem(id, req.body, userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error.includes('not found') ? 404 : 403).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/items/:id - Delete item (only by owner)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id']; // Simple auth for now
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await itemsAPI.deleteItem(id, userId);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(result.error.includes('not found') ? 404 : 403).json(result);
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