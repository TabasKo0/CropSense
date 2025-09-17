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

// Orders API - Direct Supabase calls
export const ordersAPI = {
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

            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    item_id,
                    qty: parseInt(qty),
                    uuid: userId,
                    progress: 'pending',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) {
                console.error('Order creation error:', error);
                throw new Error(error.message);
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

    // GET - Fetch user orders
    async getUserOrders(userId) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items (
                        id,
                        title,
                        price,
                        type
                    )
                `)
                .eq('uuid', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Orders fetch error:', error);
                throw new Error(error.message);
            }

            return {
                success: true,
                orders: data || [],
                count: data ? data.length : 0
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

export default ordersAPI;