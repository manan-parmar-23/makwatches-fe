# Discount System User Guide

## 🎯 Quick Start

### For Admins: Adding Discounts to Products

1. **Navigate to Admin Dashboard**

   - Go to `/admin/dashboard/products`
   - Click "Add Product" or edit an existing product

2. **Fill Basic Product Information**

   - Product Name, Brand, Category
   - Price, Stock, Description
   - Upload Images

3. **Configure Discount (Optional)**

   - Scroll to the "Discount Settings" section
   - Click to expand the section

4. **Choose Discount Type**

   - **Percentage (%)**: e.g., 20% off
   - **Fixed Amount (₹)**: e.g., ₹500 off

5. **Set Discount Value**

   - For percentage: Enter 0-100 (e.g., 20 for 20% off)
   - For fixed amount: Enter amount in rupees (e.g., 500)

6. **Set Schedule (Optional)**

   - **Start Date**: When discount becomes active
   - **End Date**: When discount expires
   - Leave blank for immediate/indefinite discount

7. **Save Product**
   - The discount will automatically apply based on date range

### Visual Indicators on Product Cards

When a discount is active, customers will see:

```
┌─────────────────────────────┐
│  [20% OFF] ← Gold Badge     │
│                              │
│     Product Image            │
│                              │
│                              │
└─────────────────────────────┘
  Premium Watch
  ₹4,000  ₹5,000 ← Strikethrough
  [💫 Save ₹1,000] ← Green Badge
```

## 📊 Discount Display Components

### 1. Discount Badge

- **Position**: Top-right corner of product image
- **Color**: Luxury gold gradient (#D4AF37)
- **Shows**: Discount percentage (e.g., "20% OFF")
- **Icon**: Sparkles icon for premium feel

### 2. Price Display

- **Final Price**: Bold, prominent (₹4,000)
- **Original Price**: Strikethrough, gray (₹5,000)
- **Layout**: Side-by-side for easy comparison

### 3. Savings Badge

- **Color**: Green (#006400 background)
- **Shows**: Actual savings amount (e.g., "Save ₹1,000")
- **Icon**: Sparkles icon
- **Position**: Below price

## 🛠️ Admin Form Features

### Discount Settings Section

**Collapsed State:**

```
┌─────────────────────────────────────┐
│ 🏷️ Discount Settings    [Active] ▼│
│ Optional: Add a discount...         │
└─────────────────────────────────────┘
```

**Expanded State:**

```
┌─────────────────────────────────────────┐
│ 🏷️ Discount Settings         [Active] ▲│
│ Discount configured                     │
├─────────────────────────────────────────┤
│ Discount Type                           │
│ [Percentage (%)] [Fixed Amount (₹)]    │
│                                         │
│ ✨ Discount Percentage                 │
│ [   20   ] %                           │
│                                         │
│ 📅 Start Date (Optional)               │
│ [2025-10-15 00:00]                     │
│                                         │
│ 📅 End Date (Optional)                 │
│ [2025-10-31 23:59]                     │
│                                         │
│ [Clear Discount]                        │
└─────────────────────────────────────────┘
```

## 🎨 Design System

### Colors

- **Primary Gold**: `#D4AF37` - Luxury brand color
- **Dark Gold**: `#A67C00` - Hover states
- **Success Green**: `#006400` - Savings badges
- **Error Red**: `#B00020` - Discount badges (alternate)

### Typography

- **Badge Text**: Bold, uppercase
- **Discount Price**: 2xl, bold
- **Original Price**: sm, line-through

### Animations

- Badges: Fade in with scale effect
- Expand/Collapse: Smooth height transition
- Hover: Scale 1.05 on hover

## 💡 Use Cases

### 1. Flash Sale

```
Discount: 30% off
Start: 2025-10-20 00:00
End: 2025-10-20 23:59
```

Result: Discount active for 24 hours only

### 2. Seasonal Discount

```
Discount: 20% off
Start: 2025-12-01 00:00
End: 2025-12-31 23:59
```

Result: Entire month discount

### 3. Fixed Amount Off

```
Discount: ₹1000 off
Start: (empty)
End: (empty)
```

Result: Always active until removed

### 4. Scheduled Future Sale

```
Discount: 25% off
Start: 2025-11-01 00:00
End: 2025-11-15 23:59
```

Result: Discount shows on product page but not active until start date

## 🔍 Discount Logic

### Priority

1. **Percentage discount** takes precedence if both are set
2. **Fixed amount** used only if percentage is not set

### Validation

- Start date must be before end date (frontend validation)
- Discount percentage: 0-100
- Discount amount: >= 0
- Negative prices prevented (minimum ₹0)

### Date Handling

- Uses user's local timezone for display
- Stores in ISO 8601 format (UTC)
- Automatic activation/expiration based on dates

## 📱 Responsive Design

### Mobile

- Touch-friendly expand/collapse
- Stacked discount type buttons
- Full-width date inputs
- Optimized badge sizes

### Desktop

- Side-by-side layouts
- Hover effects enabled
- Larger badge sizes
- More prominent animations

## 🚀 Best Practices

### For Maximum Impact

1. **Use round numbers**: 20%, 30%, 50% (easier to understand)
2. **Set end dates**: Creates urgency
3. **Test previews**: Check product cards before publishing
4. **Monitor sales**: Track which discounts perform best

### Avoid

- Very small discounts (<5%) - not impactful
- Permanent discounts - reduces perceived value
- Both percentage AND fixed amount - confusing

## 🐛 Troubleshooting

### Discount Not Showing?

- Check start/end dates are correct
- Verify discount value is > 0
- Clear browser cache
- Check product has been saved

### Wrong Price Displayed?

- Refresh the product page
- Verify original price is correct
- Check discount calculation in admin panel

### Badge Not Appearing?

- Ensure product has images uploaded
- Check discount is active (within date range)
- Verify badge CSS is not overridden

## 📚 API Reference

### Create Product with Discount

```javascript
POST /products
{
  "name": "Premium Watch",
  "price": 5000,
  "discountPercentage": 20,
  "discountStartDate": "2025-10-15T00:00:00Z",
  "discountEndDate": "2025-10-31T23:59:59Z"
}
```

### Update Product Discount

```javascript
PUT /products/:id
{
  "discountPercentage": 25,
  "discountAmount": null,
  "discountStartDate": "2025-10-20T00:00:00Z",
  "discountEndDate": "2025-10-25T23:59:59Z"
}
```

### Clear Product Discount

```javascript
PUT /products/:id
{
  "discountPercentage": null,
  "discountAmount": null,
  "discountStartDate": null,
  "discountEndDate": null
}
```

## 🎓 Advanced: Category Discounts

### Apply Discount to Entire Category

```javascript
PUT /admin/categories/:id/discount
{
  "discountPercentage": 15,
  "discountStartDate": "2025-12-01T00:00:00Z",
  "discountEndDate": "2025-12-25T23:59:59Z"
}
```

### Apply to Subcategory

```javascript
PUT /admin/categories/:id/subcategories/:subId/discount
{
  "discountPercentage": 20
}
```

**Note**: Category discount UI is not yet implemented in admin panel. Use API directly or wait for future update.

## 📞 Support

For issues or questions:

1. Check this guide first
2. Review the DISCOUNT_SYSTEM_SUMMARY.md
3. Check browser console for errors
4. Contact development team

---

**Version**: 1.0  
**Last Updated**: October 14, 2025  
**Compatible With**: makwatches-fe v0.1.0, makwatches-be latest
