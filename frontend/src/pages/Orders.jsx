import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import api from '../api/axios'

function Orders() {
  const { data: orders, isLoading } = useQuery('orders', async () => {
    const response = await api.get('/api/orders')
    return response.data.orders || []
  })

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders?.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="card flex items-center justify-between hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{order.orderNumber}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">${order.totalAmount?.toFixed(2)}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
