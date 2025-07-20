# ExploreCamp Design System

## 🎨 Color Palette

### Primary Colors
- **Blue Primary:** `#2563eb` (rgb(37, 99, 235))
- **Blue Hover:** `#1d4ed8` (rgb(29, 78, 216))
- **Green Primary:** `#22c55e` (rgb(34, 197, 94))
- **Green Hover:** `#16a34a` (rgb(22, 163, 74))

### Neutral Colors
- **Text Primary:** `#374151` (rgb(55, 65, 81))
- **Text Secondary:** `#6b7280` (rgb(107, 114, 128))
- **Text Muted:** `#9ca3af` (rgb(156, 163, 175))
- **Border:** `#e5e7eb` (rgb(229, 231, 235))
- **Background:** `#ffffff` (rgb(255, 255, 255))
- **Background Secondary:** `#f9fafb` (rgb(249, 250, 251))

### Status Colors
- **Success:** `#22c55e` (Green)
- **Warning:** `#f59e0b` (Yellow)
- **Error:** `#ef4444` (Red)
- **Info:** `#3b82f6` (Blue)

## 📐 Spacing System

### Padding
- **Small:** `p-2` (8px)
- **Medium:** `p-4` (16px)
- **Large:** `p-6` (24px)
- **Extra Large:** `p-8` (32px)

### Margins
- **Small:** `mb-2` (8px)
- **Medium:** `mb-4` (16px)
- **Large:** `mb-6` (24px)
- **Extra Large:** `mb-8` (32px)

### Gaps
- **Small:** `gap-2` (8px)
- **Medium:** `gap-3` (12px)
- **Large:** `gap-4` (16px)

## 🔤 Typography

### Font Sizes
- **Extra Small:** `text-xs` (12px)
- **Small:** `text-sm` (14px)
- **Base:** `text-base` (16px)
- **Large:** `text-lg` (18px)
- **Extra Large:** `text-xl` (20px)
- **2XL:** `text-2xl` (24px)

### Font Weights
- **Normal:** `font-normal`
- **Medium:** `font-medium`
- **Semibold:** `font-semibold`
- **Bold:** `font-bold`

## 🧩 Component Library

### Cards
```css
.card-standard {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-4;
}

.card-standard-hover {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer;
}
```

### Buttons
```css
.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 rounded-lg px-4 py-2 font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200 rounded-lg px-4 py-2 font-medium transition-colors;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 rounded-lg px-4 py-2 font-medium transition-colors;
}
```

### Inputs
```css
.input-standard {
  @apply bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-base shadow-sm focus:border-blue-500 transition-colors;
}
```

### Badges
```css
.badge-success {
  @apply bg-green-50 text-green-700 border-green-200 border rounded-full px-2 py-1 text-xs font-medium;
}

.badge-warning {
  @apply bg-yellow-50 text-yellow-700 border-yellow-200 border rounded-full px-2 py-1 text-xs font-medium;
}

.badge-error {
  @apply bg-red-50 text-red-700 border-red-200 border rounded-full px-2 py-1 text-xs font-medium;
}

.badge-info {
  @apply bg-blue-50 text-blue-700 border-blue-200 border rounded-full px-2 py-1 text-xs font-medium;
}
```

### Headers
```css
.header-standard {
  @apply bg-gradient-to-r from-blue-600 to-green-600 text-white;
}

.header-admin {
  @apply bg-white shadow-sm border-b border-gray-200;
}
```

## 📱 Layout Guidelines

### Container
- **Mobile Container:** `max-width: 428px`
- **Safe Area:** Use `mobile-safe-area` class for iOS safe areas
- **Padding:** `px-4` for horizontal padding

### Grid System
```css
.grid-standard {
  @apply grid gap-3;
}

.grid-2-cols {
  @apply grid grid-cols-2 gap-3;
}

.grid-3-cols {
  @apply grid grid-cols-3 gap-3;
}
```

### Section Spacing
```css
.section-standard {
  @apply px-4 mb-6;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 mb-3;
}
```

## 🎯 Usage Guidelines

### 1. Always Use Design System Classes
❌ **Don't:**
```jsx
<div className="bg-white rounded-lg shadow p-4">
```

✅ **Do:**
```jsx
<div className="card-standard">
```

### 2. Consistent Button Usage
❌ **Don't:**
```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded">
```

✅ **Do:**
```jsx
<button className="btn-primary">
```

### 3. Consistent Badge Usage
❌ **Don't:**
```jsx
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
```

✅ **Do:**
```jsx
<span className="badge-success">
```

### 4. Consistent Spacing
❌ **Don't:**
```jsx
<div className="p-3 mb-5">
```

✅ **Do:**
```jsx
<div className="section-standard">
```

## 🔄 Migration Checklist

### Components to Update:
- [ ] HomeScreen - Use `card-standard` for product cards
- [ ] AdminDashboard - Use `header-admin` for admin header
- [ ] ProfileScreen - Use `badge-success/warning/error` for status badges
- [ ] LoginScreen - Use `input-standard` for form inputs
- [ ] SearchScreen - Use `section-standard` for spacing
- [ ] SavedScreen - Use `card-standard-hover` for saved items
- [ ] CampsiteDetails - Use `btn-primary` for booking buttons

### Benefits:
- ✅ **Consistent visual hierarchy**
- ✅ **Easier maintenance**
- ✅ **Better user experience**
- ✅ **Faster development**
- ✅ **Reduced design debt**

## 🎨 Theme Support

The design system supports both light and dark themes through CSS variables defined in `index.css`. All components automatically adapt to theme changes. 