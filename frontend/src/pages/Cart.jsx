import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

function Cart() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore()

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId)
    toast.success(`${productName} removed from cart`)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
        <Link to="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4">
              <img
                src={item.images?.[0] || 'https://via.placeholder.com/100'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center mt-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              clearCart()
              toast.success('Cart cleared')
            }}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full flex items-center justify-center"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
