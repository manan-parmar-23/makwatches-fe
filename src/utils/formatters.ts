/**
 * Format a number as Indian Rupees
 * @param amount - The amount to format
 * @returns Formatted price string
 */
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate discount percentage between original and sale price
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage as a string with % symbol
 */
export const calculateDiscountPercentage = (originalPrice: number, salePrice: number): string => {
  if (!originalPrice || !salePrice || originalPrice <= 0) return '0%';
  const discount = ((originalPrice - salePrice) / originalPrice) * 100;
  return `${Math.round(discount)}%`;
};

/**
 * Truncate text to a specific length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
