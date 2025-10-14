/**
 * Utility functions for discount calculations and display
 */

export interface DiscountInfo {
  isActive: boolean;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage?: number;
  savingsText: string;
}

export function calculateDiscount(
  price: number,
  discountPercentage?: number | null,
  discountAmount?: number | null,
  discountStartDate?: string | null,
  discountEndDate?: string | null
): DiscountInfo {
  const now = new Date();
  
  // Check if discount is active based on date range
  let isActive = false;
  
  if (discountPercentage !== null || discountAmount !== null) {
    if (discountStartDate && new Date(discountStartDate) > now) {
      isActive = false;
    } else if (discountEndDate && new Date(discountEndDate) < now) {
      isActive = false;
    } else {
      isActive = true;
    }
  }
  
  if (!isActive) {
    return {
      isActive: false,
      originalPrice: price,
      finalPrice: price,
      discountAmount: 0,
      savingsText: "",
    };
  }
  
  let finalPrice = price;
  let actualDiscountAmount = 0;
  let calculatedPercentage: number | undefined;
  
  // Apply percentage discount first if exists
  if (discountPercentage !== null && discountPercentage !== undefined && discountPercentage > 0) {
    actualDiscountAmount = price * (discountPercentage / 100);
    finalPrice = price - actualDiscountAmount;
    calculatedPercentage = discountPercentage;
  } 
  // Apply fixed amount discount
  else if (discountAmount !== null && discountAmount !== undefined && discountAmount > 0) {
    actualDiscountAmount = discountAmount;
    finalPrice = Math.max(0, price - discountAmount);
    calculatedPercentage = (actualDiscountAmount / price) * 100;
  }
  
  const savingsText = `Save ₹${actualDiscountAmount.toFixed(0)}`;
  
  return {
    isActive: true,
    originalPrice: price,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discountAmount: Math.round(actualDiscountAmount * 100) / 100,
    discountPercentage: calculatedPercentage,
    savingsText,
  };
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}
