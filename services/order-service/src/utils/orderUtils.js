function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

function calculateOrderTotals(items, taxRate = 0, shippingAmount = 0, discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0);
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    shippingAmount,
    discountAmount,
    totalAmount
  };
}

module.exports = {
  generateOrderNumber,
  formatCurrency,
  calculateOrderTotals
};
