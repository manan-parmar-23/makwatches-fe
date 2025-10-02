# Product Images - Frontend Guide

## Quick Reference for Multiple Image Upload

### How to Use (Admin Dashboard)

#### Adding a New Product with Images

1. **Navigate to Products:**

   ```
   Admin Dashboard → Products → Add Product
   ```

2. **Fill Product Details:**

   - Name, Brand, Description, Price, Stock, Category

3. **Upload Multiple Images:**

   - Click "Choose Files" button
   - Select multiple images at once (Ctrl+Click or Shift+Click)
   - Supported formats: JPG, PNG, GIF, WebP, SVG
   - Wait for upload to complete

4. **Manage Images:**

   - First image = Main product image (marked as "MAIN")
   - Hover over any image to see "×" button
   - Click "×" to remove unwanted images
   - Must have at least 1 image to save

5. **Save Product:**
   - Click "Save" button
   - Product will be created with all images

#### Editing Product Images

1. **Open Product for Editing:**

   ```
   Products List → Click Edit icon
   ```

2. **View Existing Images:**

   - All current images are displayed
   - First image is marked as "MAIN"

3. **Add More Images:**

   - Click "Choose Files"
   - Select additional images
   - New images are appended to existing ones

4. **Remove Images:**

   - Hover over any image
   - Click the "×" button to remove
   - Must keep at least 1 image

5. **Save Changes:**
   - Click "Save"
   - Updated product is saved

## Image Display on Frontend

### Product List Page

```tsx
// Shows first image from images array
{
  product.images && product.images[0] ? (
    <img src={product.images[0]} alt={product.name} />
  ) : (
    <PhotoIcon /> // Fallback icon
  );
}
```

### Product Details Page

You can display all images in a gallery:

```tsx
// Example implementation for product details page
import { useState } from "react";

function ProductGallery({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div>
      {/* Main Image */}
      <img
        src={images[selectedImage]}
        alt="Product"
        className="w-full h-96 object-cover rounded-lg"
      />

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={`border-2 rounded ${
              idx === selectedImage ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-20 h-20 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Component Reference

### ProductFormModal.tsx

**Key Features:**

- Multiple file selection with `<input type="file" multiple accept="image/*" />`
- Real-time upload progress indicator
- Image thumbnail grid with remove functionality
- Main image indicator
- Validation for at least one image

**State Management:**

```tsx
const [form, setForm] = useState({
  name: "",
  brand: "",
  mainCategory: "Men" as "Men" | "Women",
  subcategory: "",
  price: 0,
  stock: 0,
  description: "",
  images: [] as string[], // Multiple image URLs
});
```

**Upload Handler:**

```tsx
const onFiles = async (files: FileList | null) => {
  if (!files || files.length === 0) return;
  setUploading(true);
  try {
    const arr = Array.from(files);
    const { data } = await uploadImages(arr); // Upload to /upload endpoint
    handleChange("images", [...form.images, ...(data.data.urls || [])]);
  } catch {
    setError("Image upload failed");
  } finally {
    setUploading(false);
  }
};
```

### API Functions (utils/api.ts)

**Upload Images:**

```typescript
export const uploadImages = (files: File[]) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  return api.post<ApiResponse<{ urls: string[] }>>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

**Create Product:**

```typescript
export const createProduct = (payload: Partial<Product>) =>
  api.post<ApiResponse<Product>>("/products/", payload);
```

**Update Product:**

```typescript
export const updateProduct = (id: string, payload: Partial<Product>) =>
  api.put<ApiResponse<Product>>(`/products/${id}`, payload);
```

## Product Type

```typescript
export interface Product {
  id: string;
  name: string;
  brand?: string;
  mainCategory?: "Men" | "Women";
  subcategory?: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  images: string[]; // Multiple images (PRIMARY)
  imageUrl?: string; // Main image (backward compatibility)
  createdAt?: string;
  updatedAt?: string;
}
```

## Styling Reference

### Enhanced Image Upload Section

```tsx
<div className="space-y-2">
  {/* File Input with Custom Button */}
  <div className="flex items-center gap-2">
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={handleFiles}
      className="text-sm flex-1"
      id="product-images"
    />
    <label
      htmlFor="product-images"
      className="cursor-pointer px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium"
    >
      Choose Files
    </label>
  </div>

  {/* Upload Progress */}
  {uploading && (
    <div className="text-xs text-blue-600 flex items-center gap-2">
      <SpinnerIcon />
      Uploading images to Firebase Storage...
    </div>
  )}

  {/* Image Grid */}
  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
    {images.map((url, i) => (
      <div key={i} className="relative group">
        {i === 0 && <span className="badge">MAIN</span>}
        <img src={url} alt={`Image ${i + 1}`} />
        <button onClick={() => removeImage(i)}>×</button>
      </div>
    ))}
  </div>
</div>
```

## Best Practices

### Image Selection

1. **Multiple Selection:** Hold Ctrl (Windows) or Cmd (Mac) to select multiple files
2. **Range Selection:** Click first image, hold Shift, click last image
3. **File Size:** Keep images under 5MB for better performance
4. **Dimensions:** Recommended minimum 800x800px for product images

### Image Management

1. **Order Matters:** First image is always the main product image
2. **Consistency:** Use consistent aspect ratios (square recommended)
3. **Quality:** Use high-quality images but compress before upload
4. **Naming:** Backend automatically handles naming with timestamps

### Performance Tips

1. Upload images one product at a time
2. Wait for upload to complete before saving
3. Remove unnecessary images before saving
4. Use modern image formats (WebP) for better compression

## Error Handling

### Common Errors and Solutions

**"Please upload at least one product image"**

- You must upload at least one image before saving
- Select images and wait for upload to complete

**"Image upload failed"**

- Check internet connection
- Verify backend server is running
- Check Firebase Storage is enabled
- Try uploading one image at a time

**"Failed to upload image to Firebase Storage"**

- Backend issue - check server logs
- Verify Firebase credentials are valid
- Ensure Storage rules allow uploads

**Images not appearing after save**

- Refresh the page
- Check browser console for errors
- Verify image URLs in the product data

## Testing Checklist

- [ ] Can select multiple images at once
- [ ] Upload progress indicator appears
- [ ] All images appear in thumbnail grid
- [ ] First image is marked as "MAIN"
- [ ] Can remove individual images
- [ ] Cannot save without at least one image
- [ ] Images persist after save and reload
- [ ] Edit shows all existing images
- [ ] Can add more images when editing
- [ ] Product list shows first image

## Future Enhancements

Potential improvements to consider:

1. **Drag-and-Drop Reordering:**

   ```tsx
   // Allow users to reorder images by dragging
   <DraggableImageGrid images={images} onReorder={setImages} />
   ```

2. **Image Cropping:**

   ```tsx
   // Crop images before upload
   <ImageCropper
     image={selectedImage}
     onCrop={handleCroppedImage}
     aspectRatio={1}
   />
   ```

3. **Bulk Upload:**

   ```tsx
   // Upload multiple products with images via CSV
   <BulkUploadForm onSubmit={handleBulkUpload} />
   ```

4. **Image Optimization:**

   ```tsx
   // Compress images on the client before upload
   const compressed = await compressImage(file, {
     maxWidth: 1200,
     maxHeight: 1200,
     quality: 0.8,
   });
   ```

5. **Image Zoom:**
   ```tsx
   // Add zoom functionality to product images
   <ImageZoom src={product.images[0]} />
   ```
