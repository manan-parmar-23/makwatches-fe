# Pehnaw Shop Page Documentation

## Overview

The shop page is a central feature of the Pehnaw e-commerce platform, providing users with the ability to browse products, apply filters, search, sort, add products to cart, and manage their wishlist.

## Features Implemented

### Product Display

- Responsive grid layout for product cards
- Optimized image loading with Next.js Image component
- Animated transitions using Framer Motion
- Quick view functionality for product details

### Filtering and Sorting

- Price range filtering
- Multiple sorting options (newest, oldest, price high/low, name A-Z/Z-A)
- Responsive filter sidebar (different views for mobile and desktop)
- Clear filter options

### Search

- Instant search with visual feedback
- Clear search option
- Search across product names and descriptions

### Shopping Features

- Add to cart functionality
- Add to wishlist functionality
- Visual indicators for products in cart/wishlist
- Stock status display

### User Experience

- Loading state with skeleton loaders
- Pagination for large product collections
- Responsive design for all screen sizes
- Smooth animations and transitions
- Error handling and user feedback

## Implementation Details

### API Integration

The shop page interacts with the backend API for:

- Fetching products with filters
- Managing cart items
- Managing wishlist items

### State Management

- React context for cart and wishlist state
- Local state for UI components and filters

### Performance Optimizations

- Image optimization with Next.js Image component
- Debounced search to reduce API calls
- Pagination to limit data loading
- Optimized rerenders with memoization

### UI/UX Design Considerations

- Clean, minimalist design language
- Intuitive filtering and sorting controls
- Consistent visual feedback for user actions
- Mobile-first responsive approach

## Usage Guidelines

1. Browse products using the grid layout
2. Use the filter sidebar to narrow down product selection
3. Sort products using the dropdown at the top right
4. Search for specific products using the search bar
5. Click on product cards for detailed view
6. Use quick view to see product details without leaving the page
7. Add products to cart or wishlist with the respective buttons
