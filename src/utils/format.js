/** Prices are stored as whole rupees; render them the way local stores do. */
export const formatPrice = (value) =>
  `PKR ${Number(value).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`

export const discountPercent = (price, compareAt) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0

/** Free over this threshold — referenced by the cart, checkout and promo bar. */
export const FREE_SHIPPING_THRESHOLD = 10000
export const SHIPPING_FLAT_RATE = 350

export const shippingFor = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE

/** A cart line is identified by the product plus its chosen variant. */
export const lineKey = (productId, size, color, stitch) =>
  `${productId}__${size}__${color}${stitch ? `__stitch-${stitch}` : ''}`

/** "4.5m", or "4.5m · Stitched (M)" when the customer added stitching. */
export const variantLabel = ({ size, stitch }) =>
  stitch ? `${size} · Stitched (${stitch})` : size
