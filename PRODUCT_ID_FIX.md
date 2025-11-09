# Product ID Fix - Frontend Guide

## Overview

Fixed the issue where clicking "Buy Now" on home page hero slides and collection features was opening the wrong product details page.

## What Changed

### Backend Now Provides

- `productId` field in hero slides and collection features
- `product` object with full product data when `productId` is set

### Frontend Already Had Support

The frontend code already had proper handling for `productId`:

#### Hero Content (`src/components/hero-content.tsx`)

```typescript
const handleShopNow = async () => {
  // Priority 1: Direct product ID from backend ✅
  if (currentProduct.productId) {
    router.push(
      `/product_details?id=${encodeURIComponent(currentProduct.productId)}`
    );
    return;
  }

  // Priority 2-4: Fallback matching algorithms
  // ...
};
```

#### Collection Component (`src/components/collection.tsx`)

```typescript
const handlePreOrder = async (ctaHref?: string, productId?: string) => {
  // Priority 1: Direct product ID from backend ✅
  if (productId) {
    router.push(`/product_details?id=${encodeURIComponent(productId)}`);
    return;
  }

  // Priority 2-4: Fallback methods
  // ...
};
```

## Navigation Priority

### 1. Direct Product ID (Highest Priority)

- If `productId` is present in the API response
- Navigates directly to: `/product_details?id={productId}`
- **Most reliable method** ✅

### 2. Matching Algorithm (Fallback)

- Matches based on:
  - Product name similarity
  - Image filename matching
  - Price comparison
  - Description matching
- Uses weighted scoring system
- Requires score ≥ 0.45 to be considered a match

### 3. Name Search (Fallback)

- Queries backend with product name
- Applies matching algorithm to results

### 4. First Product (Last Resort)

- Shows any available product

## Types (`src/types/home-content.ts`)

```typescript
export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  price?: string; // Deprecated
  description: string;
  image: string;
  features: string[];
  gradient: string;
  glowColor: string;
  position: number;
  productId?: string; // ✅ Reference to actual product
  product?: Product; // ✅ Populated product details
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeCollectionFeature {
  id: string;
  tagline: string;
  title: string;
  description: string;
  availability: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  layout: CollectionLayout;
  position: number;
  productId?: string; // ✅ Reference to actual product
  product?: Product; // ✅ Populated product details
  createdAt?: string;
  updatedAt?: string;
}
```

## API Response Example

```json
{
  "success": true,
  "data": {
    "heroSlides": [
      {
        "id": "slide_123",
        "title": "MAK Chronograph",
        "subtitle": "Precision Engineering",
        "productId": "507f1f77bcf86cd799439011",
        "product": {
          "id": "507f1f77bcf86cd799439011",
          "name": "MAK Chronograph Pro",
          "price": 45000,
          "images": ["..."],
          "stock": 10
        }
      }
    ],
    "collections": [
      {
        "id": "collection_456",
        "title": "Sport Collection",
        "productId": "507f1f77bcf86cd799439012",
        "product": {
          "id": "507f1f77bcf86cd799439012",
          "name": "MAK Sport Elite",
          "price": 35000
        }
      }
    ]
  }
}
```

## Testing

### Test Without Product ID

1. Clear any `productId` from hero slides in database
2. Click "Buy Now" on home page
3. Should use matching algorithm (may not be 100% accurate)

### Test With Product ID

1. Add a `productId` to a hero slide in database:
   ```javascript
   db.hero_slides.updateOne(
     { _id: ObjectId("slide_id") },
     { $set: { productId: ObjectId("product_id") } }
   );
   ```
2. Refresh home page
3. Click "Buy Now"
4. Should open the exact product specified

## Benefits

✅ **Accurate**: Always shows the correct product when `productId` is set
✅ **Fast**: Product data pre-fetched and embedded in API response
✅ **Reliable**: No more guessing which product to show
✅ **Compatible**: Falls back to matching if `productId` not set
✅ **User-Friendly**: Seamless navigation experience

## No Frontend Changes Needed

The frontend was already prepared for this feature! The only changes needed were on the backend to:

1. Add `productId` field to models
2. Populate `product` data in responses
3. Handle `productId` in update/create operations

The frontend's priority-based navigation system automatically uses the `productId` when available.
