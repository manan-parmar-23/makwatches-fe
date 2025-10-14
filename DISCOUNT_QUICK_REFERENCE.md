# Discount System - Quick Reference

## 🎯 Admin: Add Discount to Product

1. Go to **Products** → **Add/Edit Product**
2. Scroll to **Discount Settings** section
3. Click to expand
4. Choose type: **Percentage** or **Fixed Amount**
5. Enter value (e.g., 20 for 20% or 500 for ₹500)
6. (Optional) Set start/end dates
7. Save product

## 📦 What Customers See

### Product Card with Active Discount:

```
┌─────────────────────────┐
│  [20% OFF] 🏷️          │  ← Gold badge
│                         │
│   Product Image         │
│                         │
└─────────────────────────┘
  Premium Watch
  ₹4,000  ₹5,000          ← Final & Original
  [Save ₹1,000]           ← Green savings badge
```

## 🎨 Visual Elements

| Element        | Color               | Purpose                |
| -------------- | ------------------- | ---------------------- |
| Discount Badge | Gold `#D4AF37`      | Show % off             |
| Original Price | Gray, strikethrough | Show comparison        |
| Final Price    | Black, bold         | Show savings           |
| Savings Badge  | Green `#006400`     | Highlight amount saved |

## ⚡ Discount Types

### Percentage Discount

- **Input**: 0-100 (e.g., 20 = 20% off)
- **Display**: "20% OFF" badge
- **Calculation**: Price × (percentage/100)

### Fixed Amount Discount

- **Input**: Amount in ₹ (e.g., 500)
- **Display**: Calculated % badge
- **Calculation**: Price - amount

## 📅 Date Scheduling

| Field      | Required | Purpose                 |
| ---------- | -------- | ----------------------- |
| Start Date | No       | When discount activates |
| End Date   | No       | When discount expires   |

**Leave blank** = Active immediately/indefinitely

## ✨ Key Features

✅ **Optional** - Products work without discounts  
✅ **Expandable UI** - Keeps form clean  
✅ **Date-aware** - Auto activate/expire  
✅ **Visual feedback** - "Active" badge when set  
✅ **Clear button** - Remove all discount settings  
✅ **Responsive** - Works on all devices

## 🔧 API Endpoints

```
POST   /products                    Create with discount
PUT    /products/:id                Update discount
PUT    /admin/categories/:id/discount      Category discount
```

## 💡 Pro Tips

1. **Round numbers work best** (20%, 30%, 50%)
2. **Set end dates** for urgency
3. **Test before launch** - Preview product cards
4. **One discount per product** (percentage OR amount)

## 🚫 Common Mistakes

❌ Setting both percentage AND amount  
❌ End date before start date  
❌ Discount > product price  
❌ Very small discounts (<5%)

## 📊 Calculation Examples

| Original | Discount | Final Price |
| -------- | -------- | ----------- |
| ₹5,000   | 20%      | ₹4,000      |
| ₹5,000   | ₹500     | ₹4,500      |
| ₹2,000   | 30%      | ₹1,400      |

## 🎓 Advanced

**Category Discounts**: Apply to all products in category  
**Subcategory Discounts**: Apply to specific subcategory  
**Scheduled Sales**: Set future dates for auto-activation

## 📱 Files Changed

**Backend**: 4 files (models, handlers, routes)  
**Frontend**: 6 files (components, utilities, types)

**Build Status**: ✅ Both compile successfully

---

**Need Help?** See `DISCOUNT_USER_GUIDE.md` for detailed instructions
