import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import api from '../api/axios'

function OrderDetail() {
  const { id } = useParams()

  const { data: order, isLoading } = useQuery(['order', id], async () => {
    const response = await api.get(`/api/orders/${id}`)
    return response.data.order
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-500" />
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Order not found</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/orders" className="flex items-center text-gray-600 hover:text-primary-600 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
        <div className="flex items-center">
          {getStatusIcon(order.status)}
          <span className={`ml-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b last:border-0">
                  <img
                    src={item.productImage || 'https://via.placeholder.com/80'}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    {item.variantTitle && (
                      <p className="text-gray-600 text-sm">{item.variantTitle}</p>
                    )}
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.totalPrice?.toFixed(2)}</p>
                    <p className="text-gray-600 text-sm">
                      ${item.unitPrice?.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                <p className="font-medium">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.address1}</p>
                {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.postalCode}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Contact Information</p>
                <p className="font-medium">{order.email}</p>
                {order.phone && <p>{order.phone}</p>}
              </div>
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                <p className="font-medium">{order.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>${order.shippingAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${order.taxAmount?.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discountAmount?.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t text-sm text-gray-600">
              <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
              <p>Payment Status: {order.paymentStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
