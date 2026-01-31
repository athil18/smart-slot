# SmartSlot Design System

A lightweight, production-ready design system for SmartSlot with full WCAG 2.1 AA compliance.

## 🚀 Quick Start

### 1. Import Design Tokens

Add this to your main `index.css` or `App.css`:

```css
@import './design-system/tokens.css';
```

### 2. Use Components

```tsx
import { Button, Input, Card, Modal, useToast, ToastContainer } from './design-system';

function App() {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <Button variant="primary" size="md" onClick={() => addToast('success', 'Saved!')}>
        Save
      </Button>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
```

---

## 📦 Components

### Button
3 variants × 3 sizes × keyboard accessible

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" disabled>
  Disabled
</Button>

<Button variant="ghost" fullWidth>
  Full Width
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `fullWidth`: `boolean` (default: `false`)
- All standard `<button>` props

---

### Input
Accessible form inputs with labels, errors, and helper text

```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  required
  helperText="We'll never share your email"
/>

<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>
```

**Props:**
- `label`: Optional label text
- `helperText`: Optional helper text (shown below input)
- `error`: Error message (turns border red, adds aria-invalid)
- `fullWidth`: `boolean` (default: `false`)
- All standard `<input>` props

---

### Card
Container with optional header/footer

```tsx
<Card
  header={<h3>Card Title</h3>}
  footer={<Button>Action</Button>}
>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `header`: Optional header content
- `footer`: Optional footer content
- All standard `<div>` props

---

### Modal
Accessible modal with keyboard trap and Esc-to-close

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Are you sure?</p>
</Modal>
```

**Props:**
- `isOpen`: `boolean` - Controls visibility
- `onClose`: `() => void` - Called on Esc or backdrop click
- `title`: Optional title
- `footer`: Optional footer content

**Accessibility:**
- Focus trap (Tab cycles within modal)
- Esc key closes
- Auto-focuses close button
- Returns focus on close

---

### Toast
Auto-dismissing notifications with variants

```tsx
const { toasts, addToast, removeToast } = useToast();

// Add toast
addToast('success', 'Profile updated!');
addToast('error', 'Failed to save');
addToast('info', 'New message received');

// Render container (place once at app root)
<ToastContainer toasts={toasts} removeToast={removeToast} />
```

**Props (Toast):**
- `variant`: `'success' | 'error' | 'info'` (default: `'info'`)
- `message`: Toast message text
- `duration`: Auto-dismiss duration in ms (default: `3000`)
- `onClose`: Callback when toast is dismissed

**Hook: `useToast()`**
- `toasts`: Array of active toasts
- `addToast(variant, message)`: Add a new toast
- `removeToast(id)`: Remove a toast by ID

---

## 🎨 Design Tokens

All tokens are CSS variables defined in `tokens.css`:

### Spacing
- `--space-1` to `--space-16` (4px → 64px)

### Typography
- Font sizes: `--font-size-display` to `--font-size-caption`
- Weights: `--font-weight-regular` (400), `--font-weight-medium` (500), `--font-weight-bold` (700)
- Line heights: `--line-height-heading` (1.2), `--line-height-body` (1.5)

### Colors
- Primary, Secondary, Success, Error, Neutral (50-900 shades each)
- Semantic: `--color-text-primary`, `--color-bg-primary`, `--color-border`

### Shadows
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`

### Borders
- `--border-radius-sm/md/lg`, `--border-width`

### Transitions
- `--transition-fast` (150ms), `--transition-normal` (250ms)

---

## ♿ Accessibility

All components meet WCAG 2.1 AA standards:

✅ **Keyboard Navigation**: All interactive elements focusable via Tab  
✅ **Focus Indicators**: 2px solid outline with 3:1 contrast  
✅ **ARIA Labels**: All buttons/inputs have proper labels  
✅ **Screen Reader Support**: ARIA live regions for Toasts  
✅ **Color Contrast**: Minimum 4.5:1 for text  
✅ **Focus Traps**: Modal contains focus  
✅ **Semantic HTML**: Proper use of `<button>`, `<input>`, etc.

---

## 📏 File Structure

```
design-system/
├── tokens.css           # Design tokens (CSS variables)
├── Button.tsx / .css    # Button component
├── Input.tsx / .css     # Input component
├── Card.tsx / .css      # Card component
├── Modal.tsx / .css     # Modal component
├── Toast.tsx / .css     # Toast component
├── index.ts             # Barrel exports
└── README.md            # This file
```

---

## 🔧 Customization

Override tokens in your global CSS:

```css
:root {
  --color-primary-500: #your-brand-color;
  --border-radius-md: 12px;
  --font-size-body: 18px;
}
```

---

## 🧪 Testing Accessibility

Install axe DevTools:
```bash
npm i -D @axe-core/react
```

Run accessibility checks in development mode.

---

**Built with ❤️ for SmartSlot**
