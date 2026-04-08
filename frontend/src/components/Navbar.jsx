import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ShoppingCart, User, Menu, X, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary-600">
            E-Shop
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-700 hover:text-primary-600">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600">
                  Orders
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="text-gray-700 hover:text-primary-600">
                  Register
                </Link>
              </>
            )}
            
            <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
              <ShoppingCart className="w-6 h-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/products" className="block py-2 text-gray-700">
              Products
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="block py-2 text-gray-700">
                  Orders
                </Link>
                <Link to="/profile" className="block py-2 text-gray-700">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-red-600 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700">
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-gray-700">
                  Register
                </Link>
              </>
            )}
            <Link to="/cart" className="block py-2 text-gray-700">
              Cart ({getTotalItems()})
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
