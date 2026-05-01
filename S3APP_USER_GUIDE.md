# S3App Website Builder - Complete User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Website Design Features](#website-design-features)
3. [Building Your Website](#building-your-website)
4. [Managing Products](#managing-products)
5. [Viewing Results](#viewing-results)
6. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites
- Install Node.js and npm
- Have the Backend API running
- Have the Frontend development server running

### Starting the Application

**Backend:**
```bash
cd Backend
dotnet run
# API runs on http://localhost:5000
```

**Frontend:**
```bash
cd Frontend
npm install
ng serve
# Frontend runs on http://localhost:4200
```

### Login/Register
1. Navigate to `http://localhost:4200`
2. Click **Register** to create a new account
3. Enter your email and password
4. Once registered, you'll be redirected to the Dashboard

---

## Website Design Features

### Available Design Sections

S3App allows you to customize **5 main website sections**:

| Section | Purpose | Elements |
|---------|---------|----------|
| **Home/Hero** | Landing section with background image | Background, text overlays, animation effects |
| **About Us** | Company information | HTML content, background styling |
| **Services & Products** | Product showcase | HTML content, links to store |
| **Our Team** | Team members display | HTML content, custom styling |
| **Additional Sections** | Custom sections | Unlimited custom sections with custom styling |

### Design Customization Options

Each section supports:
- **Background Image**: URL to any image
- **Background Filters**: Blur, brightness, grayscale, sepia, etc.
- **Animations**: Fade-in, slide-in, zoom effects
- **Text Overlays**: 
  - Color customization
  - Font family selection (Arial, Roboto, Georgia, etc.)
  - Font size adjustment
  - Bold/Italic styling
- **HTML Content**: Rich text with full HTML support

---

## Building Your Website

### Step 1: Access the Dashboard

1. After login, click **Dashboard** in the navigation
2. You'll see the **Builder tab** by default

### Step 2: Design the Home Section (Hero)

**Form Fields:**
- **Background Image URL**: Enter URL to your hero image
  ```
  Example: https://example.com/images/hero.jpg
  ```
- **Background Filter**: Select an effect (None, Blur 5px, Brightness 110%, etc.)
- **Animation**: Choose animation type (None, Fade In, Slide In, Zoom In)
- **Text Overlays**: Add multiple text elements
  - Text content (supports translation keys)
  - Color (e.g., #FFFFFF for white)
  - Font size (14-72px)
  - Font family (Arial, Roboto, Georgia, Courier)
  - Style (Normal, Bold, Italic)

**Example Configuration:**
```
Background Image: https://images.unsplash.com/photo-1...
Filter: Brightness 80%
Animation: Fade In
Text Overlay 1:
  - Text: "Welcome to Our Store"
  - Color: #FFFFFF
  - Font Size: 48px
  - Font: Roboto
  - Style: Bold
```

### Step 3: Design About Us Section

1. In the Dashboard, scroll to **About Us section**
2. Enter **HTML content** describing your company
   ```html
   <h3>Our Story</h3>
   <p>We've been serving customers since 2020...</p>
   <ul>
     <li>Quality products</li>
     <li>Fast shipping</li>
     <li>24/7 support</li>
   </ul>
   ```
3. Set optional background and styling
4. Add text overlays if desired

### Step 4: Design Services & Products Section

1. Add **HTML content** about your services
2. This section includes a **"Shop Our Products"** button that links to your store
3. Customize appearance with background and filters

### Step 5: Design Team Section

1. Create content about your team members
2. Supports HTML for adding team member cards:
   ```html
   <div class="team-card">
     <h4>John Smith</h4>
     <p>Product Manager</p>
   </div>
   ```

### Step 6: Add Custom Additional Sections

1. Click **"Add Additional Section"** button
2. Configure:
   - **Section Title**: Displayed in editor
   - **Content Type**: HTML or structured content
   - **Background Image**: Optional
   - **Custom CSS Classes**: For advanced styling

**Example Additional Section:**
```
Title: Testimonials
Content: <h3>What Our Customers Say</h3>
         <blockquote>"Great products!" - Customer A</blockquote>
```

### Step 7: Save Your Design

1. After making changes to any section, click **"Save"** button
2. A green message appears: "Website saved successfully"
3. Changes are instantly stored to the database

---

## Viewing Results

### View Your Public Website

**Method 1: After saving, click the "View Website" button**
- Opens your website in a new tab
- URL: `http://localhost:4200/` (default webpage)
- URL with ID: `http://localhost:4200/webpage/1` (your specific page)

**Method 2: Direct URL access**
```
http://localhost:4200/
http://localhost:4200/webpage/{your-webpage-id}
```

### What You'll See

Your live website displays:
1. **Navigation header** with menu items
2. **Hero section** with your background, filters, animations, and text overlays
3. **About Us** section with your content
4. **Services section** with "Shop Our Products" button
5. **Team section** with team information
6. **Additional sections** in order
7. **Footer** with contact information

### Real-Time Preview

**Design changes appear on your public site immediately after saving:**

```
Design Dashboard (port 4200/dashboard) ←→ Database ←→ Public Site (port 4200/)
    |                                              |
    Save changes                            Changes reflect instantly
```

### Mobile Responsiveness

The website is fully responsive and adapts to:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

---

## Managing Products

### Access Products Section

1. In Dashboard, click the **Products tab**
2. You'll see your current products and pending uploads

### Add a New Product

**Form Fields:**
```
Product Name:        [Required] Name of your product
Category:           [Required] e.g., Electronics, Clothing
Subcategory:        Optional subcategory
Price:              [Required] Product price (min 0)
Quantity Available: [Required] Stock quantity
Company:            Optional manufacturer name
Description:        Detailed product description
Image:              Upload or provide URL
Specifications:     Add key-value pairs (e.g., Color: Blue)
Hidden:             Toggle to hide from store
```

### Upload Product Images

**Option 1: Upload from Computer**
1. Click **"Upload Image"** button
2. Select image from your computer
3. Wait for upload to complete
4. Image preview appears

**Option 2: Use Image URL**
1. Click **"Use Image URL"** button
2. Paste image URL
3. Image preview appears

### Edit a Product

1. Click the **Edit** icon on any product
2. Modify fields as needed
3. Click **"Update Product"**

### Delete a Product

1. Click the **Delete** icon
2. Confirm deletion
3. Product is removed from store

### Search and Filter Products

**Search:**
- Type product name or category in search box
- Results filter in real-time

**Filter by Category:**
- Select category from dropdown
- View only products in that category

**Sort Products:**
- By Price (Ascending/Descending)
- By Name (A-Z / Z-A)

---

## Best Practices

### Website Design Best Practices

1. **Hero Section**
   - Use high-quality, professional images
   - Keep text overlays readable (use contrasting colors)
   - Avoid too many overlays (2-3 maximum)
   - Use animations sparingly for professional look

2. **Content Sections**
   - Keep text concise and scannable
   - Use proper HTML formatting (h3, p, ul, li tags)
   - Ensure background images are website-appropriate

3. **Branding**
   - Maintain consistent color scheme
   - Use 1-2 primary fonts
   - Keep your company logo prominent

4. **Mobile Optimization**
   - Test design on mobile devices
   - Ensure text is readable on small screens
   - Use responsive font sizes

### Image URLs to Try

**Free Image Services:**
- Unsplash: `https://unsplash.com` (free high-quality images)
- Pixabay: `https://pixabay.com`
- Pexels: `https://pexels.com`

**Example Usage:**
```
https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900
```

### Recommended Background Filters

| Effect | Use Case |
|--------|----------|
| Brightness 70% | Darken bright images for text readability |
| Blur 3px | Soften background to highlight text |
| Grayscale 50% | Professional, muted look |
| Sepia 30% | Warm, vintage feel |
| None | Natural image appearance |

---

## Complete Workflow Example

### Scenario: Create a Coffee Shop Website

**Step 1: Hero Section**
```
Background Image: https://unsplash.com/photos/coffee.jpg
Filter: Brightness 80%
Animation: Fade In
Text Overlay 1:
  - "Welcome to Joe's Coffee"
  - Color: #FFFFFF
  - Size: 48px
  - Font: Roboto
  - Style: Bold
```

**Step 2: About Us**
```html
<h3>Our Story Since 2015</h3>
<p>Serving the finest specialty coffee...</p>
<ul>
  <li>Single-origin beans</li>
  <li>Expert baristas</li>
  <li>Cozy atmosphere</li>
</ul>
```

**Step 3: Services**
```html
<h3>Our Services</h3>
<p>Explore our premium coffee selection and pastries</p>
```

**Step 4: Add Product**
- Product Name: "Arabica Single Origin Blend"
- Category: "Coffee Beans"
- Price: 12.99
- Quantity: 100
- Description: "Hand-roasted Ethiopian Arabica beans"

**Step 5: Save & View**
1. Click Save on all sections
2. Click "View Website"
3. See your coffee shop website live!

---

## Troubleshooting

### Changes Not Appearing?
- **Solution**: Refresh the browser (Ctrl+R or Cmd+R)
- Clear browser cache if needed
- Ensure backend API is running

### Image Not Loading?
- Check the image URL is correct
- Ensure image is accessible (not private)
- Try using HTTPS URLs instead of HTTP

### Product Upload Fails?
- Check file size (max 5MB recommended)
- Ensure image format is supported (JPG, PNG, WebP)
- Check internet connection

### Styling Not Applied?
- Ensure you clicked the "Save" button
- Verify font name is correct
- Check color format is valid (hex: #FFFFFF or rgb: rgb(255,255,255))

---

## Support

For additional help:
1. Check the application's built-in help documentation
2. Review your browser's developer console for errors (F12)
3. Ensure both backend and frontend services are running

---

**Happy designing! 🎨**
