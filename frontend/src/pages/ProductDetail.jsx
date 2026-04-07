import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ShoppingCart, ArrowLeft, Star, Minus, Plus } from 'lucide-react'
import api from '../api/axios'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

function ProductDetail() {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCartStore()

  const { data: product, isLoading } = useQuery(['product', id], async () => {
    const response = await api.get(`/api/products/${id}`)
    return response.data
  })

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, quantity })
      toast.success(`${product.name} added to cart`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Product not found</p>
        <Link to="/products" className="btn-primary mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/products" className="flex items-center text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/500'}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-4">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="ml-2 text-gray-600">
              {product.rating || '4.5'} ({product.reviews || '128'} reviews)
            </span>
          </div>

          <p className="text-4xl font-bold text-primary-600 mb-6">
            ${product.price}
          </p>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center mb-6">
            <span className="mr-4 font-semibold">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="btn-primary w-full md:w-auto flex items-center justify-center text-lg px-8 py-3"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </button>

          {/* Additional Info */}
          <div className="mt-8 border-t pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">SKU:</span> {product.sku || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Category:</span>{' '}
                {product.category?.name || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Stock:</span>{' '}
                {product.inventory_quantity > 0 ? (
                  <span className="text-green-600">In Stock ({product.inventory_quantity})</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
