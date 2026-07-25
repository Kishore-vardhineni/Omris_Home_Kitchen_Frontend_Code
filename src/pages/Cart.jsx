import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';

const CartItem = ({ item, dispatch }) => {
  // Extract clean title and weight subtitle
  const cleanName = item.name ? item.name.replace(/\s*\([^)]*\)/, '') : '';
  const rawVariant = item.name && item.name.match(/\(([^)]+)\)/)?.[1];
  const displayWeight = item.weight || rawVariant || '250 gms';
  const displayPacking = item.packing && item.packing !== 'Without Bottle' ? ` • ${item.packing}` : '';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 border-b border-neutral-100 last:border-b-0">
      {/* Left section: Product Thumbnail Image & Details */}
      <div className="flex items-center gap-5 sm:gap-6">
        <img
          src={item.image || "https://images.unsplash.com/photo-1589301773950-a92c4c1538df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
          alt={cleanName || item.name}
          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-md bg-neutral-50 flex-shrink-0 border border-neutral-200/60"
        />
        <div>
          <h3 className="font-bold text-neutral-900 text-base sm:text-lg leading-snug">
            {cleanName || item.name}
          </h3>
          <p className="text-neutral-400 text-sm mt-1 font-normal">
            {displayWeight}{displayPacking}
          </p>
          
          {/* Highlighted Red Remove Button */}
          <button
            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item })}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors mt-3 w-fit cursor-pointer"
          >
            <Trash2 size={15} />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Right section: Segmented Quantity Box & Price */}
      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 w-full sm:w-auto">
        {/* Quantity Controls: [ - | 1 | + ] */}
        <div className="flex items-center bg-[#f5f5f5] rounded border border-neutral-200 overflow-hidden text-neutral-600">
          <button
            onClick={() => {
              if (item.quantity > 1) {
                dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } });
              }
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200 text-neutral-500 transition-colors text-sm font-medium"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-9 text-center text-sm font-medium text-neutral-800 select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => {
              dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } });
            }}
            className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200 text-neutral-500 transition-colors text-sm font-medium"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Formatted Price (e.g. Rs. 280.00) */}
        <div className="text-right font-medium text-neutral-700 text-base sm:text-lg min-w-[100px]">
          Rs. {(item.price * item.quantity).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const { state, dispatch } = useCart();

  const handleWhatsAppOrder = () => {
    if (state.items.length === 0) return;

    let message = `🛒 *New Order from Omris Home Kitchen*\n\n`;
    message += `*Items Ordered:*\n`;

    state.items.forEach((item, index) => {
      const cleanName = item.name ? item.name.replace(/\s*\([^)]*\)/, '') : item.name;
      const rawVariant = item.name && item.name.match(/\(([^)]+)\)/)?.[1];
      const displayWeight = item.weight || rawVariant || '250gm';
      const displayPacking = item.packing && item.packing !== 'Without Bottle' ? ` (${item.packing})` : '';
      const itemTotal = (item.price * item.quantity).toFixed(2);

      message += `${index + 1}. *${cleanName}*\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Variant: ${displayWeight}${displayPacking}\n`;
      message += `   • Subtotal: ₹${itemTotal} (₹${item.price} each)\n\n`;
    });

    message += `------------------------------\n`;
    message += `💰 *Total Amount:* ₹${state.total.toFixed(2)}\n\n`;
    message += `Please confirm my order and share payment details. Thank you!`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/917670851967?text=${encodedMsg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen font-sans text-neutral-800 p-4 sm:p-8 lg:p-12">
      <div className="max-w-[1000px] mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 mb-8 tracking-tight">
          Shopping Cart
        </h1>

        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-neutral-200/80">
          {state.items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto text-neutral-300 mb-4" size={56} strokeWidth={1.5} />
              <h2 className="text-2xl font-serif text-neutral-800 mb-2">Your cart is empty</h2>
              <p className="text-neutral-500 mb-6 text-sm sm:text-base">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium text-sm hover:bg-neutral-800 transition-colors shadow-sm"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div>
              <div className="divide-y divide-neutral-100">
                {state.items.map((item) => (
                  <CartItem key={item.id} item={item} dispatch={dispatch} />
                ))}
              </div>

              {/* Cart Footer Summary & Order on WhatsApp Button */}
              <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-neutral-400 text-xs sm:text-sm">
                  Clicking Order on WhatsApp will send your item list directly to our kitchen team!
                </p>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-neutral-500 block uppercase tracking-wider font-semibold">
                      Subtotal
                    </span>
                    <span className="text-xl font-bold text-neutral-900">
                      Rs. {state.total.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Order on WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppOrder}
                    className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer hover:shadow-lg hover:scale-[1.01]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span>Order on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
