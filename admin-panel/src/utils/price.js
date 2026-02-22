/**
 * Quantity-based discount: product.quantityDiscounts = [{ minQty, discountPercent }, ...]
 * For a given quantity, the highest applicable tier (max minQty where quantity >= minQty) is used.
 */
export function getQuantityDiscount(product, quantity = 1) {
  const originalPrice = Number(product?.price ?? 0);
  const qty = Math.max(0, quantity);
  const tiers = product?.quantityDiscounts || [];
  const applicable = tiers
    .filter((t) => t.minQty != null && t.discountPercent != null && qty >= t.minQty)
    .sort((a, b) => (b.minQty || 0) - (a.minQty || 0))[0];

  if (!applicable) {
    return {
      originalPrice,
      unitPrice: originalPrice,
      totalPrice: originalPrice * qty,
      hasDiscount: false,
      discountPercent: 0,
      tiers,
    };
  }

  const discountPercent = Math.min(100, Math.max(0, applicable.discountPercent));
  const unitPrice = originalPrice * (1 - discountPercent / 100);
  return {
    originalPrice,
    unitPrice,
    totalPrice: unitPrice * qty,
    hasDiscount: true,
    discountPercent,
    tiers,
  };
}
