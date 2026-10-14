import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Share2,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { openWhatsAppChat } from '../utils/whatsapp';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  primaryPhone?: string;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onBuyNow,
  primaryPhone,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    onBuyNow(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="bg-slate-100 p-6 flex items-center justify-center relative min-h-[300px]">
            <img
              src={product.image}
              alt={product.title}
              className="max-h-80 w-full object-contain rounded-2xl shadow-sm"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-[#F28C28] text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Featured Product
              </span>
            )}
          </div>

          {/* Product Specs & Purchase controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F28C28] bg-orange-50 px-2 py-0.5 rounded">
                  {product.category.replace('_', ' ')}
                </span>
                {product.origin && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {product.origin}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#102A43] leading-snug">
                {product.title}
              </h2>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#102A43]">
                  ₹{product.priceINR.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  (Net Weight: {product.weightGrams}g)
                </span>
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="text-red-600 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                    Temporarily Out of Stock
                  </span>
                )}

                {product.shelfLife && (
                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" /> Best before {product.shelfLife}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-2">
                {product.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="py-3 px-4 rounded-xl border-2 border-[#102A43] text-[#102A43] hover:bg-[#102A43] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-xs disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{addedNotice ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="py-3 px-4 rounded-xl bg-[#F28C28] hover:bg-[#E07817] text-white transition-all text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-40"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now</span>
                </button>
              </div>

              {/* WhatsApp enquiry */}
              <button
                onClick={() =>
                  openWhatsAppChat(
                    { type: 'product', context: { productName: product.title } },
                    primaryPhone
                  )
                }
                className="w-full py-2 text-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5"
              >
                <span>Have questions about this item? Ask on WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Authentic Indian Sourcing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>DTDC Priority Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
