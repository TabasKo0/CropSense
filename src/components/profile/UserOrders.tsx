import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { ordersAPI } from "@/api/routes/orders";
import { useAuth } from "@/contexts/AuthContext";

interface Order {
  order_id: string;
  item_id: string;
  qty: number;
  progress: string;
  created_at: string;
  updated_at?: string;
  items?: {
    id: string;
    title: string;
    price: number;
    type: string;
    desp?: string;
    category?: string;
    image_url?: string;
    farmer_name?: string;
  } | null;
}

const UserOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const result = await ordersAPI.getUserOrders(user.id);
        //console.log('Fetched orders:', result);
        if (result.success) {
          setOrders(result.orders || []);
        } else {
          setError(result.error || 'Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          My Orders ({orders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground">Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.order_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-4 flex-1">
                    {order.items?.image_url && (
                      <img 
                        src={order.items.image_url} 
                        alt={order.items.title || 'Product image'}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {order.items?.title || 'Unknown Item'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {order.order_id}
                      </p>
                      {order.items?.farmer_name && (
                        <p className="text-sm text-muted-foreground">
                          Seller: {order.items.farmer_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusColor(order.progress)} className="flex items-center gap-1">
                    {getStatusIcon(order.progress)}
                    {order.progress}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{order.qty} items</p>
                  </div>
                  
                  {order.items?.price && (
                    <div>
                      <span className="text-muted-foreground">Unit Price:</span>
                      <p className="font-medium">${order.items.price}</p>
                    </div>
                  )}
                  
                  {order.items?.price && (
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">${(order.items.price * order.qty).toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2 flex-wrap">
                  {order.items?.type && (
                    <Badge variant="outline" className="text-xs">
                      {order.items.type}
                    </Badge>
                  )}
                  {order.items?.category && (
                    <Badge variant="secondary" className="text-xs">
                      {order.items.category}
                    </Badge>
                  )}
                </div>

                {order.items?.desp && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {order.items.desp}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserOrders;