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
            //console.log(item_id);

            // First, get the current item data to check stock availability
            const { data: itemData, error: fetchError } = await supabase
                .from('items')
                .select('sold, qty')
                .eq('item_id', item_id)
                .single();

            if (fetchError) {
                console.error('Failed to fetch item data:', fetchError);
                return {
                    success: false,
                    error: 'Failed to verify item availability'
                };
            }

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
            const updateData = {
                sold: newSoldCount
            };

            // If new sold count equals total quantity, mark as sold out
            if (totalQuantity && newSoldCount >= totalQuantity) {
                updateData.sold_out = true;
            }

            const { error: updateError } = await supabase
                .from('items')
                .update(updateData)
                .eq('item_id', item_id);

            if (updateError) {
                console.error('Failed to update sold count:', updateError);
                return {
                    success: false,
                    error: 'Failed to update stock. Please try again.'
                };
            }

            // Only if stock update succeeds, create the order
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    item_id: item_id,
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

                // Rollback the sold count update since order creation failed
                const rollbackData = {
                    sold: currentSold
                };
                if (totalQuantity && currentSold < totalQuantity) {
                    rollbackData.sold_out = false;
                }

                await supabase
                    .from('items')
                    .update(rollbackData)
                    .eq('item_id', item_id);

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

    // GET - Fetch user orders with item details
    async getUserOrders(userId) {
        try {
            // First, get orders with basic data (item_id, quantity, status)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('order_id, item_id, qty, progress, created_at, updated_at')
                .eq('uuid', userId)
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error('Orders fetch error:', ordersError);
                throw new Error(ordersError.message);
            }

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
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select('item_id, title, price, type, desp, type, image_link')
                .in('item_id', itemIds);
            console.log("Fetched item details:", itemsData);
            if (itemsError) {
                console.error('Items fetch error:', itemsError);
                // Continue without item details if items fetch fails
            }

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
                        desp: itemDetails.desp,
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

export default ordersAPI;