import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search, Filter } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCartStore()

  useEffect(() => {
    // Simulate API calls
    const timer = setTimeout(() => {
      setProducts([
        { id: 1, name: 'Laptop', price: 999, category_id: 1, images: ['https://via.placeholder.com/300'] },
        { id: 2, name: 'Phone', price: 699, category_id: 2, images: ['https://via.placeholder.com/300'] },
        { id: 3, name: 'Tablet', price: 399, category_id: 2, images: ['https://via.placeholder.com/300'] },
        { id: 4, name: 'Watch', price: 299, category_id: 3, images: ['https://via.placeholder.com/300'] },
        { id: 5, name: 'Headphones', price: 199, category_id: 3, images: ['https://via.placeholder.com/300'] },
        { id: 6, name: 'Keyboard', price: 99, category_id: 1, images: ['https://via.placeholder.com/300'] },
      ])
      setCategories([
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Mobile' },
        { id: 3, name: 'Accessories' },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)
    return matchesSearch && matchesCategory
  })

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
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts?.map((product) => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow">
            <Link to={`/products/${product.id}`}>
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
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

      {filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found</p>
        </div>
      )}
    </div>
  )
}

export default Products
