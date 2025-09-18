import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Star, MapPin, Truck, Shield, Users, Plus, Package, DollarSign, Mail, Tag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import OrderConfirmation from "@/components/OrderConfirmation";

interface Item {
  item_id: string;
  uuid: string;
  image_link?: string;
  image_bucket?: string;
  title: string;
  desp: string;
  price: number;
  contact: string;
  type: string;
  qty?: number;
  created_at: string;
  updated_at?: string;
}

const Marketplace = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [orderingItems, setOrderingItems] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<{[key: string]: number}>({});
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [orderConfirmationDetails, setOrderConfirmationDetails] = useState({
    quantity: 0,
    itemTitle: "",
    message: ""
  });
  
  // Form data for adding new item
  const [formData, setFormData] = useState({
    title: "",
    desp: "",
    price: "",
    contact: "",
    type: "",
    qty: "",
    image_link: ""
  });

  // Fetch all items from API using SQLite backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Use the SQLite client through supabase interface
      const { data, error } = await supabase.from('items').select('*');
      
      if (error) {
        setError(error.message || 'Failed to load items');
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Failed to load marketplace items');
    } finally {
      setLoading(false);
    }
  };

  // Add new item using direct Supabase calls
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add items');
      return;
    }

    setAddingItem(true);
    try {
      // Use direct API call since Supabase interface doesn't support complex operations easily
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          desp: formData.desp,
          price: parseFloat(formData.price),
          contact: formData.contact,
          type: formData.type,
          qty: formData.qty ? parseInt(formData.qty) : null,
          image_link: formData.image_link || null,
          userId: user.id
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Reset form and close dialog
        setFormData({
          title: "", desp: "", price: "", contact: "", type: "", qty: "", image_link: ""
        });
        setIsAddDialogOpen(false);
        // Refresh items list
        fetchItems();
      } else {
        setError(result.error || 'Failed to add item');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  // Handle quantity changes for each item
  const updateQuantity = (itemId: string, newQuantity: number, maxQuantity?: number) => {
    if (newQuantity >= 1 && (!maxQuantity || newQuantity <= maxQuantity)) {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: newQuantity
      }));
    }
  };

  const handleQuantityInputChange = (itemId: string, value: string, maxQuantity?: number) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      const clampedValue = maxQuantity ? Math.min(numValue, maxQuantity) : numValue;
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: clampedValue
      }));
    } else if (value === '') {
      // Allow empty string temporarily for editing
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: 1
      }));
    }
  };

  const getItemQuantity = (itemId: string) => {
    return itemQuantities[itemId] || 1;
  };

  // Handle order placement
  const handleOrder = async (itemId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }

    // Add item to ordering state
    setOrderingItems(prev => new Set(prev).add(itemId));

    try {
      const selectedQuantity = getItemQuantity(itemId);
      
      // Use direct API call for order placement
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          qty: selectedQuantity,
          userId: user.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        const currentItem = items.find(item => item.item_id === itemId);
        setOrderConfirmationDetails({
          quantity: selectedQuantity,
          itemTitle: currentItem?.title || '',
          message: result.message || "Your order has been placed successfully!"
        });
        setShowOrderConfirmation(true);
      } else {
        toast({
          title: "Order Failed",
          description: result.error || "Failed to place order.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error placing order:', err);
      toast({
        title: "Order Failed",
        description: "An error occurred while placing your order.",
        variant: "destructive",
      });
    } finally {
      // Remove item from ordering state
      setOrderingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <section id="marketplace" className="relative top-[-10vh] h-[105vh] py-20 bg-gradient-sky bottom-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading marketplace...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="marketplace" className="relative h-100 py-5 bg-gradient-sky ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4" style={{transform:"translateY(5vh)",marginBottom:"6vh"}}>
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Agricultural Marketplace
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Buy and sell agricultural products with fellow farmers
          </p>
        </div>

        {/* Add Item Button and Error Display */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-semibold">Available Items ({items.length})</h3>
            {error && (
              <Badge variant="destructive" className="text-sm">
                {error}
              </Badge>
            )}
          </div>
          
          {user && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Item to Marketplace</DialogTitle>
                  <DialogDescription>
                    List your agricultural products for other farmers to purchase.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Fresh Tomatoes"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desp">Description *</Label>
                    <Textarea
                      id="desp"
                      name="desp"
                      value={formData.desp}
                      onChange={handleInputChange}
                      placeholder="Describe your product..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seeds">Seeds</SelectItem>
                          <SelectItem value="fertilizer">Fertilizer</SelectItem>
                          <SelectItem value="tools">Tools</SelectItem>
                          <SelectItem value="vegetables">Vegetables</SelectItem>
                          <SelectItem value="fruits">Fruits</SelectItem>
                          <SelectItem value="grains">Grains</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qty">Quantity (optional)</Label>
                      <Input
                        id="qty"
                        name="qty"
                        type="number"
                        min="1"
                        value={formData.qty}
                        onChange={handleInputChange}
                        placeholder="Available quantity"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact Info *</Label>
                      <Input
                        id="contact"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        placeholder="Email or phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image_link">Image URL (optional)</Label>
                      <Input
                        id="image_link"
                        name="image_link"
                        type="url"
                        value={formData.image_link}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      variant="hero" 
                      disabled={addingItem}
                      className="flex-1"
                    >
                      {addingItem ? "Adding..." : "Add Item"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Items Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {items.map((item) => (
              <Card key={item.item_id} className="shadow-strong hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  {item.image_link && (
                    <div className="w-full h-48 mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={item.image_link} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg mb-2 line-clamp-2">{item.title}</CardTitle>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {item.type}
                    </Badge>
                    <span className="text-lg font-bold text-primary">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.desp}
                  </p>
                  
                  <div className="space-y-2">
                    {item.qty && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span>Qty: {item.qty}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{item.contact}</span>
                    </div>
                  </div>
                  
                  {/* Quantity Selection */}
                  <div className="flex items-center justify-between pt-2 pb-2">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.item_id, getItemQuantity(item.item_id) - 1, item.qty)}
                        disabled={getItemQuantity(item.item_id) <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.qty || undefined}
                        value={getItemQuantity(item.item_id)}
                        onChange={(e) => handleQuantityInputChange(item.item_id, e.target.value, item.qty)}
                        className="w-16 text-center font-medium h-8 px-1"
                        onBlur={(e) => {
                          // Ensure minimum value of 1 on blur
                          if (!e.target.value || parseInt(e.target.value) < 1) {
                            updateQuantity(item.item_id, 1, item.qty);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.item_id, getItemQuantity(item.item_id) + 1, item.qty)}
                        disabled={item.qty && getItemQuantity(item.item_id) >= item.qty}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleOrder(item.item_id)}
                      disabled={orderingItems.has(item.item_id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {orderingItems.has(item.item_id) 
                        ? "Ordering..." 
                        : `Order (${getItemQuantity(item.item_id)})`
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Items Available</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to list an item in the marketplace!
            </p>
            {user && (
              <Button variant="hero" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            )}
          </div>
        )}
        
        {/* Marketplace Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center shadow-soft">
            <CardContent className="pt-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure Transactions</h3>
              <p className="text-sm text-muted-foreground">
                All transactions protected with enterprise-grade security
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="pt-6">
              <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Local Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Connect with farmers in your area for quick delivery
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Farmer Community</h3>
              <p className="text-sm text-muted-foreground">
                Join a trusted network of agricultural professionals
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Order Confirmation Modal */}
      <OrderConfirmation 
        isVisible={showOrderConfirmation}
        onClose={() => setShowOrderConfirmation(false)}
        orderDetails={orderConfirmationDetails}
      />
      
      <Toaster />
    </section>
  );
};

export default Marketplace;