import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";

interface OrderConfirmationProps {
  isVisible: boolean;
  onClose: () => void;
  orderDetails: {
    quantity: number;
    itemTitle?: string;
    message?: string;
  };
}

const OrderConfirmation = ({ isVisible, onClose, orderDetails }: OrderConfirmationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger animation after component mounts
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div 
        className={`
          w-full h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto
          transition-all duration-500 ease-out transform
          ${showAnimation 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-90 opacity-0 translate-y-8'
          }
        `}
      >
        {/* Animated Check Icon */}
        <div className="relative mb-8">
          <div className={`
            w-32 h-32 mx-auto rounded-full bg-green-100 flex items-center justify-center
            transition-all duration-700 ease-out transform
            ${showAnimation ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
          `}>
            <CheckCircle 
              className={`
                h-20 w-20 text-green-600
                transition-all duration-500 delay-300
                ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `} 
            />
          </div>
          
          {/* Pulse animation rings */}
          <div className={`
            absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-green-400
            transition-all duration-1000 ease-out
            ${showAnimation ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}
          `} />
          <div className={`
            absolute inset-0 w-32 h-32 mx-auto rounded-full border-2 border-green-300
            transition-all duration-1000 ease-out delay-200
            ${showAnimation ? 'scale-200 opacity-0' : 'scale-100 opacity-100'}
          `} />
        </div>

        {/* Success Message */}
        <div className={`
          transition-all duration-500 delay-500 ease-out transform mb-12
          ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Order Confirmed!
          </h2>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Package className="h-8 w-8 text-primary" />
            <p className="text-xl md:text-2xl text-gray-600">
              Successfully ordered {orderDetails.quantity} item{orderDetails.quantity > 1 ? 's' : ''}
            </p>
          </div>

          {orderDetails.itemTitle && (
            <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-lg mx-auto">
              {orderDetails.itemTitle}
            </p>
          )}

          {orderDetails.message && (
            <p className="text-base md:text-lg text-gray-600 mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-soft max-w-2xl mx-auto">
              {orderDetails.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`
          space-y-4 max-w-md mx-auto w-full
          transition-all duration-500 delay-700 ease-out transform
          ${showAnimation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
        `}>
          <Button 
            onClick={onClose}
            size="lg"
            className="w-full text-xl py-8 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <CheckCircle className="mr-3 h-6 w-6" />
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="w-full text-lg py-6"
            onClick={onClose}
          >
            View Order History
            <ArrowRight className="ml-3 h-5 w-5" />
          </Button>
        </div>

        {/* Enhanced confetti-like decoration */}
        <div className="absolute top-8 left-8 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="absolute top-12 right-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        <div className="absolute top-1/4 left-12 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-8 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/4 left-16 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.9s' }} />
        <div className="absolute bottom-1/3 right-16 w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '1.1s' }} />
        <div className="absolute bottom-12 left-8 w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '1.3s' }} />
        <div className="absolute bottom-8 right-12 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
};

export default OrderConfirmation;