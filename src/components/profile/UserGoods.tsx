import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Trash2, TrendingUp, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface UserItem {
  item_id: string;
  uuid: string;
  title: string;
  desp: string;
  price: number;
  contact: string;
  type: string;
  qty?: number;
  sold?: number;
  sold_out?: boolean;
  image_link?: string;
  created_at: string;
  updated_at?: string;
}

const UserGoods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserItems = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Use the SQLite client through supabase interface
        const { data, error } = await supabase.from('items').select('*').eq('uuid', user.id);
        
        if (error) {
          setError(error.message || 'Failed to load items');
        } else {
          setItems(data || []);
        }
      } catch (err) {
        console.error('Error fetching user items:', err);
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, [user]);

  const handleDeleteItem = async (itemId: string) => {
    try {
      setDeletingItem(itemId);
      
      // Use direct API call for delete
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setItems(items.filter(item => item.item_id !== itemId));
        toast({
          title: "Item Deleted",
          description: "Your item has been successfully removed.",
          variant: "default",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: result.error || "Failed to delete item.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the item.",
        variant: "destructive",
      });
    } finally {
      setDeletingItem(null);
    }
  };

  const calculateProgress = (sold: number = 0, total: number = 0) => {
    if (total === 0) return 0;
    return Math.min((sold / total) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
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
            My Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
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
          My Products ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products listed</p>
            <p className="text-sm text-muted-foreground">Start selling by adding your first product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.item_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{item.title}</h4>
                      {item.sold_out && (
                        <Badge variant="destructive" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Sold Out
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.desp}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ₹{item.price.toFixed(2)}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingItem === item.item_id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{item.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteItem(item.item_id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingItem === item.item_id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium capitalize">{item.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock:</span>
                    <p className="font-medium">{item.qty || 'Unlimited'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sold:</span>
                    <p className="font-medium flex items-center gap-1">
                      {item.sold || 0}
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Listed:</span>
                    <p className="font-medium">{formatDate(item.created_at)}</p>
                  </div>
                </div>

                {/* Progress Bar for Stock vs Sold */}
                {item.qty && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sales Progress</span>
                      <span className="font-medium">
                        {item.sold || 0} / {item.qty} sold
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(item.sold, item.qty)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {calculateProgress(item.sold, item.qty).toFixed(1)}% of stock sold
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    {item.sold_out ? (
                      <Badge variant="destructive" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Not Available
                      </Badge>
                    ) : (
                      <Badge variant="default" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Revenue: ₹{((item.sold || 0) * item.price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserGoods;