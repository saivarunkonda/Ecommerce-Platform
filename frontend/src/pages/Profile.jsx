import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string(),
  address: yup.string(),
})

function Profile() {
  const { user, updateUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: profile, isLoading } = useQuery(['profile'], async () => {
    const response = await api.get('/api/users/profile')
    return response.data
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  })

  const updateMutation = useMutation(
    async (data) => {
      const response = await api.put('/api/users/profile', data)
      return response.data
    },
    {
      onSuccess: (data) => {
        updateUser(data)
        queryClient.invalidateQueries('profile')
        toast.success('Profile updated successfully')
        setIsEditing(false)
      },
      onError: () => {
        toast.error('Failed to update profile')
      },
    }
  )

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                reset()
              }
              setIsEditing(!isEditing)
            }}
            className="btn-secondary"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input {...register('firstName')} className="input-field" />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input {...register('lastName')} className="input-field" />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Phone
              </label>
              <input {...register('phone')} className="input-field" placeholder="+1234567890" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Address
              </label>
              <textarea {...register('address')} className="input-field" rows="3" />
            </div>

            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn-primary flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center py-3 border-b">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center py-3 border-b">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{profile?.phone || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-start py-3 border-b">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{profile?.address || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center py-3">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium">
                  {new Date(profile?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
