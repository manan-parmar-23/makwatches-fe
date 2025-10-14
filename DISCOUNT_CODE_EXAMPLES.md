# Discount System - Code Examples

## Frontend Integration Examples

### 1. Using Discount in Product Card

```tsx
import { calculateDiscount } from "@/utils/discount";
import DiscountBadge, {
  PriceWithDiscount,
  SavingsBadge,
} from "./DiscountBadge";

// In your component
const product = {
  name: "Premium Watch",
  price: 5000,
  discountPercentage: 20,
  discountStartDate: "2025-10-15T00:00:00Z",
  discountEndDate: "2025-10-31T23:59:59Z",
};

const discountInfo = calculateDiscount(
  product.price,
  product.discountPercentage,
  product.discountAmount,
  product.discountStartDate,
  product.discountEndDate
);

// Returns:
// {
//   isActive: true,
//   originalPrice: 5000,
//   finalPrice: 4000,
//   discountAmount: 1000,
//   discountPercentage: 20,
//   savingsText: "Save ₹1,000"
// }
```

### 2. Display Components

```tsx
// Discount Badge (on product image)
{
  discountInfo.isActive && discountInfo.discountPercentage && (
    <DiscountBadge
      discountPercentage={discountInfo.discountPercentage}
      position="top-right"
      size="md"
      variant="premium"
    />
  );
}

// Price Display
<PriceWithDiscount
  originalPrice={discountInfo.originalPrice}
  finalPrice={discountInfo.finalPrice}
  isActive={discountInfo.isActive}
  size="md"
/>;

// Savings Badge
{
  discountInfo.isActive && (
    <SavingsBadge savingsText={discountInfo.savingsText} />
  );
}
```

### 3. Admin Form Integration

```tsx
import { DiscountSection } from "@/components/admin/DiscountSection";

// In your form state
const [form, setForm] = useState({
  // ... other fields
  discountPercentage: null,
  discountAmount: null,
  discountStartDate: null,
  discountEndDate: null,
});

const [discountType, setDiscountType] = useState<"percentage" | "amount">(
  "percentage"
);

// Handlers
const handleDiscountTypeChange = (type: "percentage" | "amount") => {
  setDiscountType(type);
  if (type === "percentage") {
    setForm((prev) => ({ ...prev, discountAmount: null }));
  } else {
    setForm((prev) => ({ ...prev, discountPercentage: null }));
  }
};

const handleClearDiscount = () => {
  setForm((prev) => ({
    ...prev,
    discountPercentage: null,
    discountAmount: null,
    discountStartDate: null,
    discountEndDate: null,
  }));
};

// Component usage
<DiscountSection
  discountType={discountType}
  discountPercentage={form.discountPercentage}
  discountAmount={form.discountAmount}
  discountStartDate={form.discountStartDate}
  discountEndDate={form.discountEndDate}
  onDiscountTypeChange={handleDiscountTypeChange}
  onDiscountPercentageChange={(value) =>
    setForm((prev) => ({ ...prev, discountPercentage: value }))
  }
  onDiscountAmountChange={(value) =>
    setForm((prev) => ({ ...prev, discountAmount: value }))
  }
  onDiscountStartDateChange={(value) =>
    setForm((prev) => ({ ...prev, discountStartDate: value }))
  }
  onDiscountEndDateChange={(value) =>
    setForm((prev) => ({ ...prev, discountEndDate: value }))
  }
  onClearDiscount={handleClearDiscount}
/>;
```

## Backend API Examples

### 1. Create Product with Discount (Go)

```go
// Product struct with discount fields
type Product struct {
    ID                 primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
    Name               string             `json:"name" bson:"name"`
    Price              float64            `json:"price" bson:"price"`
    DiscountPercentage *float64           `json:"discountPercentage,omitempty" bson:"discount_percentage,omitempty"`
    DiscountAmount     *float64           `json:"discountAmount,omitempty" bson:"discount_amount,omitempty"`
    DiscountStartDate  *time.Time         `json:"discountStartDate,omitempty" bson:"discount_start_date,omitempty"`
    DiscountEndDate    *time.Time         `json:"discountEndDate,omitempty" bson:"discount_end_date,omitempty"`
}

// Helper methods
func (p *Product) IsDiscountActive() bool {
    now := time.Now()

    if p.DiscountPercentage == nil && p.DiscountAmount == nil {
        return false
    }

    if p.DiscountStartDate != nil && now.Before(*p.DiscountStartDate) {
        return false
    }
    if p.DiscountEndDate != nil && now.After(*p.DiscountEndDate) {
        return false
    }

    return true
}

func (p *Product) GetFinalPrice() float64 {
    if !p.IsDiscountActive() {
        return p.Price
    }

    if p.DiscountPercentage != nil && *p.DiscountPercentage > 0 {
        discount := p.Price * (*p.DiscountPercentage / 100.0)
        return p.Price - discount
    }

    if p.DiscountAmount != nil && *p.DiscountAmount > 0 {
        finalPrice := p.Price - *p.DiscountAmount
        if finalPrice < 0 {
            return 0
        }
        return finalPrice
    }

    return p.Price
}
```

### 2. Update Category Discount (Go)

```go
// Handler for updating category discount
func (h *CategoryHandler) UpdateCategoryDiscount(c *fiber.Ctx) error {
    ctx := c.Context()
    id := c.Params("id")

    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "success": false,
            "message": "Invalid category ID",
        })
    }

    var req models.CategoryDiscountRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "success": false,
            "message": "Invalid request body",
        })
    }

    update := bson.M{
        "$set": bson.M{
            "updated_at": time.Now(),
            "discount_percentage": req.DiscountPercentage,
            "discount_amount": req.DiscountAmount,
            "discount_start_date": req.DiscountStartDate,
            "discount_end_date": req.DiscountEndDate,
        },
    }

    collection := h.DB.Collections().Categories
    _, err = collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "success": false,
            "message": "Failed to update discount",
        })
    }

    return c.JSON(fiber.Map{
        "success": true,
        "message": "Category discount updated successfully",
    })
}
```

## API Request Examples

### 1. Create Product with 20% Discount

```bash
POST http://localhost:8080/products
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "name": "Luxury Watch",
  "brand": "Premium Brand",
  "price": 5000,
  "category": "Men/Watches",
  "mainCategory": "Men",
  "subcategory": "Watches",
  "stock": 10,
  "description": "Premium quality watch",
  "images": ["https://example.com/watch1.jpg"],
  "discountPercentage": 20,
  "discountStartDate": "2025-10-15T00:00:00Z",
  "discountEndDate": "2025-10-31T23:59:59Z"
}
```

### 2. Update Product Discount

```bash
PUT http://localhost:8080/products/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "discountPercentage": 30,
  "discountStartDate": "2025-10-20T00:00:00Z",
  "discountEndDate": "2025-10-25T23:59:59Z"
}
```

### 3. Clear Product Discount

```bash
PUT http://localhost:8080/products/507f1f77bcf86cd799439011
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "discountPercentage": null,
  "discountAmount": null,
  "discountStartDate": null,
  "discountEndDate": null
}
```

### 4. Apply Category-Wide Discount

```bash
PUT http://localhost:8080/admin/categories/507f1f77bcf86cd799439011/discount
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN

{
  "discountPercentage": 15,
  "discountStartDate": "2025-12-01T00:00:00Z",
  "discountEndDate": "2025-12-25T23:59:59Z"
}
```

## TypeScript Type Definitions

```typescript
// Product type
export interface Product {
  id: string;
  name: string;
  price: number;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
}

// Discount info returned by calculateDiscount
export interface DiscountInfo {
  isActive: boolean;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage?: number;
  savingsText: string;
}

// Component props
interface DiscountSectionProps {
  discountType: "percentage" | "amount";
  discountPercentage?: number | null;
  discountAmount?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  onDiscountTypeChange: (type: "percentage" | "amount") => void;
  onDiscountPercentageChange: (value: number | null) => void;
  onDiscountAmountChange: (value: number | null) => void;
  onDiscountStartDateChange: (value: string | null) => void;
  onDiscountEndDateChange: (value: string | null) => void;
  onClearDiscount: () => void;
}
```

## Styling Examples

### Custom Badge Variants

```tsx
// Premium gold variant
<DiscountBadge
  discountPercentage={20}
  variant="premium"  // Gold gradient background
  size="lg"
/>

// Default red variant
<DiscountBadge
  discountPercentage={20}
  variant="default"  // Red background
  size="md"
/>

// Minimal variant
<DiscountBadge
  discountPercentage={20}
  variant="minimal"  // Simple green badge
  size="sm"
/>
```

### Custom Colors (Tailwind CSS)

```tsx
// Override colors in your component
<motion.div
  className="..."
  style={{
    background: "linear-gradient(135deg, #D4AF37 0%, #F4CD68 100%)",
    color: "#0F0F0F",
  }}
>
  20% OFF
</motion.div>
```

## Testing Examples

### Jest/Testing Library

```typescript
import { calculateDiscount } from "@/utils/discount";

describe("calculateDiscount", () => {
  it("calculates percentage discount correctly", () => {
    const result = calculateDiscount(1000, 20);
    expect(result.finalPrice).toBe(800);
    expect(result.discountAmount).toBe(200);
    expect(result.isActive).toBe(true);
  });

  it("calculates fixed amount discount correctly", () => {
    const result = calculateDiscount(1000, null, 150);
    expect(result.finalPrice).toBe(850);
    expect(result.discountAmount).toBe(150);
  });

  it("respects start date", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const result = calculateDiscount(1000, 20, null, futureDate.toISOString());
    expect(result.isActive).toBe(false);
  });

  it("handles expired discount", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    const result = calculateDiscount(
      1000,
      20,
      null,
      null,
      pastDate.toISOString()
    );
    expect(result.isActive).toBe(false);
  });
});
```

## Environment Variables

No additional environment variables required. The discount system works with your existing setup:

```env
# Existing variables (no changes needed)
NEXT_PUBLIC_API_URL=http://localhost:8080
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/makwatches
```

## Database Schema

```javascript
// MongoDB Product Document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Premium Watch",
  price: 5000,
  discount_percentage: 20,  // Optional
  discount_amount: null,    // Optional
  discount_start_date: ISODate("2025-10-15T00:00:00Z"),  // Optional
  discount_end_date: ISODate("2025-10-31T23:59:59Z"),    // Optional
  created_at: ISODate("2025-10-14T12:00:00Z"),
  updated_at: ISODate("2025-10-14T12:00:00Z")
}
```

---

**Ready to Use!** Copy these examples and adapt them to your needs.
