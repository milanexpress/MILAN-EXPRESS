import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShoppingCart,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ProductDetailsModal } from './ProductDetailsModal';

interface ShopViewProps {
  onNavigateToRequest: () => void;
  onProceedToCheckout: () => void;
  primaryPhone?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({
  onNavigateToRequest,
  onProceedToCheckout,
  primaryPhone,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [isLoading, setIsLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts({ category: selectedCategory, search: searchQuery }),
        api.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load shop products', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCartOpen(false);
    onProceedToCheckout();
  };

  // Sort logic
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-asc') return a.priceINR - b.priceINR;
    if (sortBy === 'price-desc') return b.priceINR - a.priceINR;
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-[#102A43] to-[#243B53] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F28C28] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authentic Indian Store & Worldwide Courier</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Shop Genuine Indian Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Handpicked South Indian degree coffee powder, authentic sweets, brass pooja essentials, stone-ground Chettinad spices, and herbal wellness formulations. Packed fresh and dispatched via DTDC Express.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coffee, laddu, deepam, spices..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#102A43]"
            />
          </form>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end text-xs">
            <span className="text-slate-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#102A43]"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#102A43] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 space-y-3"
            >
              <div className="h-44 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We could not find items matching your search. You can ask Milan Express to procure any custom Indian item for you!
          </p>
          <button
            onClick={onNavigateToRequest}
            className="px-6 py-2.5 rounded-xl bg-[#F28C28] text-white text-xs font-bold shadow-md hover:bg-[#E07817]"
          >
            Request a Custom Product from India
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const isAdded = addedItemMap[product.id];
            return (
              <div
                key={product.id}
                onClick={() => setActiveProduct(product)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group cursor-pointer"
              >
                {/* Image & Tags */}
                <div className="relative bg-slate-50 h-52 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.featured && (
                    <span className="absolute top-3 left-3 bg-[#102A43] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      Popular
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
                    {product.weightGrams}g
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C28]">
                      {product.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-[#102A43] mt-1 line-clamp-2 leading-snug group-hover:text-[#F28C28] transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-black text-[#102A43]">
                        ₹{product.priceINR.toLocaleString('en-IN')}
                      </span>
                      {product.stock > 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock <= 0}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                          isAdded
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-[#102A43] text-[#102A43] hover:bg-[#102A43] hover:text-white'
                        } disabled:opacity-40`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(e, product)}
                        disabled={product.stock <= 0}
                        className="py-2 px-2 rounded-xl bg-[#F28C28] hover:bg-[#E07817] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs disabled:opacity-40"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sourcing Banner Callout */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="font-extrabold text-[#102A43] text-lg">
            Looking for something specific from an Indian market?
          </h3>
          <p className="text-xs text-slate-600">
            We purchase directly from local stores in Tamil Nadu, Karnataka, Kerala, or North India and ship via DTDC.
          </p>
        </div>
        <button
          onClick={onNavigateToRequest}
          className="shrink-0 px-6 py-3 rounded-xl bg-[#102A43] hover:bg-[#243B53] text-white text-xs font-bold flex items-center gap-2 shadow-md"
        >
          <span>Request Custom Indian Item</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Active Product Modal */}
      <ProductDetailsModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onBuyNow={(prod, qty) => {
          setActiveProduct(null);
          onProceedToCheckout();
        }}
        primaryPhone={primaryPhone}
      />
    </div>
  );
};
