import { createClient } from '@supabase/supabase-js';

// Supabase configuration using environment variables
const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Items API - Direct Supabase calls
export const itemsAPI = {
    // GET all items or filter by uuid
    async getItems(uuid = null) {
        try {
            let query = supabase
                .from('items')
                .select('*')
                .order('created_at', { ascending: false }); // If uuid is provided, filter by that user
            if (uuid) {
                query = query.eq('uuid', uuid);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Items fetch error:', error);
                throw new Error(error.message);
            }

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
    async getItemById(id) {
        try {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('id', id)
                .single();
            if (error) {
                if (error.code === 'PGRST116') {
                    return {
                        success: false,
                        error: 'Item not found'
                    };
                }
                throw new Error(error.message);
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

            const { data, error } = await supabase
                .from('items')
                .insert([{
                    uuid: userId,
                    image_link: image_link || null,
                    image_bucket: image_bucket || null,
                    title: title.trim(),
                    desp: desp.trim(),
                    price: parseFloat(price),
                    contact: contact.trim(),
                    type: type.trim(),
                    qty: qty ? parseInt(qty) : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Item creation error:', error);
                throw new Error(error.message);
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
            const { data: existingItem, error: checkError } = await supabase
                .from('items')
                .select('uuid')
                .eq('id', id)
                .single();
            if (checkError || !existingItem) {
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

            // Prepare update data
            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (title !== undefined) updateData.title = title.trim();
            if (desp !== undefined) updateData.desp = desp.trim();
            if (price !== undefined) updateData.price = parseFloat(price);
            if (contact !== undefined) updateData.contact = contact.trim();
            if (type !== undefined) updateData.type = type.trim();
            if (qty !== undefined) updateData.qty = qty ? parseInt(qty) : null;
            if (image_link !== undefined) updateData.image_link = image_link;
            if (image_bucket !== undefined) updateData.image_bucket = image_bucket;

            const { data, error } = await supabase
                .from('items')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                console.error('Item update error:', error);
                throw new Error(error.message);
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
            const { data: existingItem, error: checkError } = await supabase
                .from('items')
                .select('uuid, title')
                .eq('id', id)
                .single();
            if (checkError || !existingItem) {
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

            const { error } = await supabase
                .from('items')
                .delete()
                .eq('id', id);
            if (error) {
                console.error('Item deletion error:', error);
                throw new Error(error.message);
            }

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

export default itemsAPI;