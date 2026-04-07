export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  return new Date(date).toLocaleDateString('en-US', defaultOptions)
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${timestamp}-${random}`
}

export function calculateDiscount(price, discountPercent) {
  return price - (price * discountPercent) / 100
}

export function getInitials(name) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
    return null
  }
}

export function isTokenExpired(token) {
  const decoded = parseJwt(token)
  if (!decoded) return true
  return decoded.exp * 1000 < Date.now()
}

export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key]
    result[group] = result[group] || []
    result[group].push(item)
    return result
  }, {})
}

export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (order === 'desc') {
      return b[key] > a[key] ? 1 : -1
    }
    return a[key] > b[key] ? 1 : -1
  })
}

export function filterBy(array, key, value) {
  return array.filter((item) => item[key] === value)
}

export function searchArray(array, searchTerm, keys) {
  const lowercasedTerm = searchTerm.toLowerCase()
  return array.filter((item) =>
    keys.some((key) =>
      String(item[key]).toLowerCase().includes(lowercasedTerm)
    )
  )
}
