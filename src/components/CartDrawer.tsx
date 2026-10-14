import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onNavigateToShop,
}) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotalINR,
    totalWeightGrams,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 bg-[#102A43] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-[#F28C28]" />
              <div>
                <h3 className="font-bold text-base sm:text-lg">Your Shopping Cart</h3>
                <p className="text-xs text-slate-300">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'} • {(totalWeightGrams / 1000).toFixed(2)} kg approx
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-base mb-1">Your cart is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Explore our authentic Indian sweets, degree coffee, pooja items, and spices.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigateToShop();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#102A43] text-white text-xs font-bold hover:bg-[#243B53] transition-colors"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs sm:text-sm text-[#102A43] truncate">
                      {product.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-extrabold text-sm text-[#102A43]">
                        ₹{product.priceINR.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({product.weightGrams}g)
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-slate-800">
                  ₹{subtotalINR.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Estimated Packaging & Courier Weight</span>
                <span className="font-semibold text-slate-700">
                  {(totalWeightGrams / 1000).toFixed(2)} kg
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#102A43] pt-2 border-t border-slate-200">
                <span>Total Items Value</span>
                <span className="text-[#F28C28] text-base">
                  ₹{subtotalINR.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Shipping charges calculated transparently at checkout based on destination pin code or international country.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onProceedToCheckout();
                  }}
                  className="flex-1 bg-[#F28C28] hover:bg-[#E07817] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine Indian Products • Direct Courier Dispatch</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
