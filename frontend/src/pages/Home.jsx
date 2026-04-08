import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

function Home() {
  const { addToCart } = useCartStore()
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      setProducts([
        { id: 1, name: 'Laptop', price: 999, images: ['https://via.placeholder.com/300'] },
        { id: 2, name: 'Phone', price: 699, images: ['https://via.placeholder.com/300'] },
        { id: 3, name: 'Tablet', price: 399, images: ['https://via.placeholder.com/300'] },
        { id: 4, name: 'Watch', price: 299, images: ['https://via.placeholder.com/300'] },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleAddToCart = (product) => {
    addToCart(product)
    toast.success(`${product.name} added to cart`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 mb-12 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to E-Shop
        </h1>
        <p className="text-xl mb-6">
          Discover amazing products at great prices
        </p>
        <Link to="/products" className="btn-primary inline-block">
          Shop Now
        </Link>
      </div>

      {/* Featured Products */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <Link to={`/products/${product.id}`}>
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating || '4.5'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-primary-600">
                  ${product.price}
                </p>
              </Link>
              <button
                onClick={() => handleAddToCart(product)}
                className="btn-primary w-full mt-4 flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
