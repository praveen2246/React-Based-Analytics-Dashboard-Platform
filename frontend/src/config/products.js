/**
 * FIXED PRODUCT LIST - Telecom Services
 * Only these 5 products are allowed in the system
 */

export const ALLOWED_PRODUCTS = [
  "Fiber Internet 300 Mbps",
  "5GUnlimited Mobile Plan",
  "Fiber Internet 1 Gbps",
  "Business Internet 500 Mbps",
  "VoIP Corporate Package"
];

// For quick reference
export const PRODUCT_NAMES = {
  FIBER_300: "Fiber Internet 300 Mbps",
  MOBILE_5G: "5GUnlimited Mobile Plan",
  FIBER_1GB: "Fiber Internet 1 Gbps",
  BUSINESS_500: "Business Internet 500 Mbps",
  VOIP: "VoIP Corporate Package"
};

/**
 * Validate if a product is in the allowed list
 * @param {string} product - Product name to validate
 * @returns {boolean}
 */
export const isValidProduct = (product) => {
  return ALLOWED_PRODUCTS.includes(product);
};

/**
 * Get all allowed products
 * @returns {array}
 */
export const getProducts = () => {
  return [...ALLOWED_PRODUCTS]; // Return copy to prevent mutations
};
