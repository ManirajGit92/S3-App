# S3App - Quick Start Guide (5 Minutes)

## 🚀 Quick Setup

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd Backend
dotnet run
# Wait for: "Application started. Press Ctrl+C to shut down."
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
ng serve
# Wait for: "✔ Compiled successfully"
```

### 2. Open Your Browser
- Go to: `http://localhost:4200`
- Register with email/password
- You're logged in!

---

## 🎨 Design Your Website (10 Steps)

### Step 1: Go to Dashboard
- Click **Dashboard** in top navigation

### Step 2: Fill Home Section (Hero)
In the **"Home Section"** form:
```
Background Image URL: 
  https://images.unsplash.com/photo-1522869635100-1f5c9017e4c6?w=1600

Background Filter: 
  Brightness 80%

Animation: 
  Fade In

Text Overlay - Add:
  Text: "Welcome!"
  Color: #FFFFFF
  Font Size: 48
  Font Family: Roboto
  Style: Bold
```
Click **Add Overlay** → **Save**

### Step 3: Fill About Section
```html
Enter as HTML Content:

<h3>About Our Company</h3>
<p>We provide quality products since 2020.</p>
<ul>
  <li>✓ Quality Guaranteed</li>
  <li>✓ Fast Shipping</li>
  <li>✓ Great Support</li>
</ul>
```
Click **Save**

### Step 4: Fill Services Section
```html
<h3>Our Products & Services</h3>
<p>Browse our wide selection of premium items.</p>
```
Click **Save**

### Step 5: Fill Team Section
```html
<div style="text-align: center;">
  <h3>Meet Our Team</h3>
  <p><strong>John Doe</strong> - Founder & CEO</p>
  <p><strong>Jane Smith</strong> - Operations Manager</p>
</div>
```
Click **Save**

### Step 6: View Your Website
- After saving, click **"View Website"** button
- Or go to: `http://localhost:4200/`
- You'll see your hero section with background, text, and animation!

---

## 📦 Add Products

### Step 1: Go to Products Tab
- In Dashboard, click **Products** tab

### Step 2: Click "Add New Product"

### Step 3: Fill the Form
```
Product Name:        Coffee Beans Premium
Category:            Beverages
Price:               $15.99
Available Quantity:  50
Description:         100% Arabica, hand-roasted
Company:             Joe's Coffee Roasters
```

### Step 4: Upload Image
- Click **Upload Image** button
- Choose image from computer
- Or paste image URL:
  ```
  https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=500
  ```

### Step 5: Add Specifications (Optional)
- Click **Add Specification**
- Enter: Key = "Roast Level", Value = "Medium"
- Click **Add Specification** again
- Enter: Key = "Grind", Value = "Whole Beans"

### Step 6: Save Product
- Click **Add Product** button
- Success! Product appears in your list

### Step 7: View Your Store
- Click **Shop Our Products** button on website
- See your product in the store!

---

## ✅ Verify Changes

### Your Website Now Has:

**Before (Blank)**
```
Empty website
No content
No products
```

**After (Your Design)**
```
✓ Beautiful hero section with background & text
✓ About us information  
✓ Services description
✓ Team information
✓ Professional styling and animations
✓ Working product store
```

### Test Real-Time Updates:

1. **Change Hero Text**
   - Edit overlay text to "Hello World!"
   - Click Save
   - Refresh website (F5)
   - See the change instantly! ✨

2. **Add Another Product**
   - Add new product in Products tab
   - Save product
   - Go to store
   - New product appears immediately! 

---

## 🎯 Common Actions

### Change Website Background
1. Go to Dashboard
2. Find "Background Image URL" field
3. Paste new image URL
4. Click Save
5. Refresh website to see changes

### Change Text Color
1. Find "Text Overlay" section
2. Click on color field (shows current color)
3. Pick new color
4. Click Save

### Change Font Size
1. Find "Font Size" field
2. Change number (try 32, 48, 64)
3. Click Save

### Hide/Show Product
1. In Products tab, find product
2. Check "Hidden" checkbox
3. Click Update
4. Product won't show in store

### Edit Product Price
1. In Products tab, click Edit
2. Change price value
3. Click Save
4. Price updates in store immediately

---

## 🎨 Design Examples

### Professional Tech Company
```
Hero: Sleek tech image
Text: "Innovative Solutions"
Filter: Brightness 90%
About: "We deliver cutting-edge technology"
Services: "Software, Consulting, Support"
```

### Coffee Shop
```
Hero: Cozy coffee shop photo
Text: "Welcome to Joe's ☕"
Filter: Sepia 30%
About: "Specialty coffee since 2015"
Services: "Fresh brewed daily"
```

### E-commerce Store
```
Hero: Product showcase image
Text: "Shop Now"
Filter: None
About: "Quality products, great prices"
Services: "Free shipping on orders over $50"
Products: List all items with images
```

---

## 🔗 Useful Links

**Your Application:**
- Dashboard: `http://localhost:4200/dashboard`
- Website: `http://localhost:4200/`
- Backend API: `http://localhost:5000`

**Free Images:**
- Unsplash: `https://unsplash.com`
- Pixabay: `https://pixabay.com`
- Pexels: `https://pexels.com`

---

## ❓ FAQ

**Q: How long does it take to design a website?**
A: 10-15 minutes! (5 minutes with this guide)

**Q: Can I change my design later?**
A: Yes! Anytime. Just go to Dashboard and edit.

**Q: Do I need to restart the app to see changes?**
A: No. Just save and refresh the browser.

**Q: Can I have multiple products?**
A: Yes! Add as many as you want.

**Q: Is my data saved automatically?**
A: No. You must click "Save" button to save.

**Q: Can I delete a section?**
A: You can leave it empty (don't fill the form).

**Q: Does the website work on mobile?**
A: Yes! It's fully responsive.

---

## ✨ You're All Set!

Your website is now live and ready to impress! 🎉

**Next Steps:**
1. ✓ Designed 5 website sections
2. ✓ Added products
3. ✓ Viewed live results
4. ✓ Ready to share with others!

**To share your website:** 
Send them: `http://localhost:4200/` (or your public URL)

Happy building! 🚀
