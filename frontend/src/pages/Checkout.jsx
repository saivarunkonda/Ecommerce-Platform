import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Truck, MapPin, ChevronRight } from 'lucide-react'
import { useMutation } from 'react-query'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api/axios'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_default')

const schema = yup.object({
  email: yup.string().email().required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  address1: yup.string().required(),
  city: yup.string().required(),
  state: yup.string().required(),
  postalCode: yup.string().required(),
  country: yup.string().required(),
})

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      country: 'US',
    },
  })

  const orderMutation = useMutation(
    async (data) => {
      const orderData = {
        email: data.email,
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        items: items.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productImage: item.images?.[0],
        })),
        subtotal: getTotalPrice(),
        totalAmount: getTotalPrice(),
      }

      const response = await api.post('/api/orders', orderData)
      return response.data
    },
    {
      onSuccess: async (data) => {
        toast.success('Order placed successfully!')
        clearCart()
        navigate(`/orders/${data.order.id}`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to place order')
      },
    }
  )

  const onSubmit = async (data) => {
    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent
      const { data: paymentIntent } = await api.post('/api/payments/intent', {
        orderId: 0, // Will be updated after order creation
        amount: getTotalPrice(),
        currency: 'USD',
      })

      // Confirm card payment
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
            },
          },
        }
      )

      if (error) {
        toast.error(error.message)
      } else if (confirmedPayment.status === 'succeeded') {
        // Place order after successful payment
        orderMutation.mutate(data)
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input {...register('email')} type="email" className="input-field" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input {...register('firstName')} className="input-field" />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input {...register('lastName')} className="input-field" />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input {...register('address1')} className="input-field" placeholder="Street address" />
                  {errors.address1 && <p className="text-red-500 text-sm mt-1">{errors.address1.message}</p>}
                </div>
                <div>
                  <input {...register('address2')} className="input-field" placeholder="Apartment, suite, etc. (optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input {...register('city')} className="input-field" />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input {...register('state')} className="input-field" />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input {...register('postalCode')} className="input-field" />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select {...register('country')} className="input-field">
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Information
              </h2>
              <div className="border rounded-lg p-4">
                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={!stripe || isProcessing || orderMutation.isLoading}
              className="btn-primary w-full flex items-center justify-center text-lg py-3"
            >
              {isProcessing || orderMutation.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Pay ${getTotalPrice().toFixed(2)}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={item.images?.[0] || 'https://via.placeholder.com/60'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg mr-3"
                    />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>Calculated</span>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

export default Checkout
