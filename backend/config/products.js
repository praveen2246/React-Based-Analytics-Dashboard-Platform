/**
 * FIXED PRODUCT LIST - Telecom Services (Backend)
 * Only these 5 products are allowed in the system
 * Must match frontend exactly
 */

const ALLOWED_PRODUCTS = [
  "Fiber Internet 300 Mbps",
  "5GUnlimited Mobile Plan",
  "Fiber Internet 1 Gbps",
  "Business Internet 500 Mbps",
  "VoIP Corporate Package"
];

/**
 * Validate if a product is in the allowed list
 * @param {string} product - Product name to validate
 * @returns {boolean}
 */
const isValidProduct = (product) => {
  return ALLOWED_PRODUCTS.includes(product);
};

/**
 * Get all allowed products
 * @returns {array}
 */
const getProducts = () => {
  return [...ALLOWED_PRODUCTS];
};

module.exports = {
  ALLOWED_PRODUCTS,
  isValidProduct,
  getProducts
};
