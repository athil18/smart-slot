# 🎨 Lovable Prompts for SmartSlot Components

This document provides ready-to-use Lovable prompts to enhance your SmartSlot UI components with modern, animated designs.

---

## 📋 Component Enhancement Checklist

- [ ] Booking Confirmation (High Priority)
- [ ] Advanced Booking Page
- [ ] Simplified Booking Page
- [ ] Dashboard
- [ ] Login/Register
- [ ] Admin Panel
- [ ] Slot Selection UI

---

## 1️⃣ Booking Confirmation Component

### Current Location:
`apps/frontend/src/components/booking/BookingConfirmation.tsx`

### Lovable Prompt:
```
Create a modern booking confirmation component for React + TypeScript with the following:

DESIGN STYLE:
- Glassmorphism card with backdrop blur
- Gradient background (purple to blue)
- Smooth entrance animation (slide up + fade in)
- Success checkmark animation with bounce effect
- Soft shadows and rounded corners

LAYOUT STRUCTURE:
1. Animated success checkmark icon at top
2. "Booking Confirmed!" heading with gradient text
3. Subtitle: "You're all set. We've sent a confirmation to your email."
4. Details card showing:
   - Amenity icon + name (row)
   - Resource name (bold)
   - Date with calendar icon
   - Time range with clock icon
   - Booking ID with hashtag icon
5. Action buttons:
   - Primary: "View My Bookings" (gradient button)
   - Secondary: "Cancel Booking" (outline button)
6. Bottom links:
   - "Email Confirmation" with mail icon
   - "Add to Calendar" with calendar icon

ANIMATIONS:
- Checkmark draws in with stroke animation
- Card slides up from bottom with spring physics
- Details fade in with stagger effect
- Buttons have hover scale effect (1.05x)
- Icons pulse on hover

PROPS INTERFACE:
interface BookingDetails {
  amenityIcon: string;
  amenityName: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}

interface BookingConfirmationProps {
  booking: BookingDetails;
  onViewBookings: () => void;
  onCancel: () => void;
}

TECH STACK:
- React + TypeScript
- TailwindCSS v4
- Framer Motion for animations
- Lucide React for icons
```

---

## 2️⃣ Advanced Booking Page

### Current Location:
`apps/frontend/src/pages/dashboard/AdvancedBooking.tsx`

### Lovable Prompt:
```
Create an advanced booking page component with modern UI:

PAGE LAYOUT:
- Two-column layout (desktop) / stacked (mobile)
- Left: Resource selection and filters
- Right: Calendar view with time slots

FEATURES:
1. Resource Selection:
   - Grid of resource cards with icons
   - Hover effect with scale + shadow
   - Selected state with gradient border
   - Capacity and availability badges

2. Date Picker:
   - Custom calendar component
   - Highlight available dates
   - Disable unavailable dates
   - Smooth month transitions

3. Time Slot Selection:
   - Grid of time slots (30-min intervals)
   - Color-coded availability:
     * Green: Available
     * Yellow: Limited availability
     * Red: Fully booked
     * Gray: Unavailable
   - Hover tooltip showing details
   - Selected state with checkmark

4. Filters Section:
   - Duration selector (dropdown)
   - Staff preference (autocomplete)
   - Priority toggle (urgent/normal)
   - Glassmorphic container

5. Summary Panel (sticky):
   - Selected resource preview
   - Date and time
   - Total duration
   - Estimated wait time
   - "Confirm Booking" button (gradient)

ANIMATIONS:
- Resource cards flip on hover
- Calendar dates scale on hover
- Time slots fade in with stagger
- Summary panel slides in from right
- Loading skeleton for async data

DESIGN:
- Dark mode support
- Glassmorphism throughout
- Gradient accents (purple/blue)
- Smooth transitions (300ms ease-out)
- Responsive breakpoints

TECH STACK:
- React + TypeScript
- TailwindCSS v4
- Framer Motion
- React Hook Form + Zod validation
- React Query for data fetching
```

---

## 3️⃣ Dashboard Overview

### Lovable Prompt:
```
Create a modern dashboard for a booking management system:

LAYOUT:
1. Header Section:
   - Welcome message with user name
   - Current date/time
   - Quick action buttons (New Booking, View Schedule)
   - Glassmorphic header with blur

2. Stats Cards Row (4 cards):
   - Total Bookings (with trend arrow)
   - Upcoming Appointments
   - Pending Approvals (admin only)
   - Most Popular Resource
   - Each card has:
     * Icon (gradient background)
     * Value (large, bold)
     * Label (small text)
     * Trend indicator
     * Hover effect (lift + shadow)

3. Upcoming Appointments Section:
   - Timeline view of next 7 days
   - Each appointment card shows:
     * Resource icon + name
     * Date & time
     * Status badge (confirmed/pending)
     * Quick actions (reschedule/cancel)
   - Horizontal scroll on mobile
   - Vertical stack on desktop

4. Calendar Widget:
   - Mini calendar with dots for booked dates
   - Click date to see appointments
   - Smooth month transitions

5. Quick Booking Panel:
   - Fast booking form (resource + time)
   - Auto-suggest based on history
   - "Book Now" button

ANIMATIONS:
- Stats cards count up on mount
- Timeline items slide in with stagger
- Calendar dates pulse on hover
- Cards have parallax effect on scroll
- Smooth page transitions

DESIGN SYSTEM:
- Color palette: Purple (#8B5CF6), Blue (#3B82F6), Dark (#1F2937)
- Typography: Inter font family
- Spacing: 4px base unit
- Border radius: 12px default
- Shadows: Layered, soft

RESPONSIVE:
- Desktop: 4-column grid
- Tablet: 2-column grid
- Mobile: Single column, horizontal scrolls

TECH STACK:
- React + TypeScript
- TailwindCSS v4
- Framer Motion
- Recharts for mini graphs
- Lucide React icons
```

---

## 4️⃣ Login/Register Page

### Lovable Prompt:
```
Create a modern authentication page with login and register forms:

LAYOUT:
- Split screen design (50/50)
- Left: Animated background with gradient mesh
- Right: Auth forms (toggle between login/register)

LEFT PANEL:
- Animated gradient mesh background (purple/blue/pink)
- Floating shapes with parallax effect
- Brand logo at top
- Tagline: "Smart Booking, Simplified"
- Feature highlights (icons + text):
  * "AI-Powered Scheduling"
  * "Resource Optimization"
  * "Real-time Availability"

RIGHT PANEL:
1. Login Form:
   - Email input (with validation)
   - Password input (show/hide toggle)
   - "Remember me" checkbox
   - "Forgot password?" link
   - "Login" button (gradient, full width)
   - Divider with "or"
   - Social login buttons (Google, Microsoft)
   - "Don't have an account? Sign up" link

2. Register Form:
   - Full name input
   - Email input
   - Phone input
   - Role selector (dropdown: student/staff/scientist/etc.)
   - Organization input
   - Password input (strength meter)
   - Confirm password input
   - Terms checkbox
   - "Create Account" button
   - "Already have an account? Login" link

VALIDATION:
- Real-time validation with Zod
- Error messages below inputs
- Success checkmarks when valid
- Disabled submit until form is valid

ANIMATIONS:
- Forms slide in from right
- Background shapes float continuously
- Toggle between forms with smooth transition
- Input focus effects (border glow)
- Button hover effects (scale + shadow)
- Loading spinner during submission

DESIGN:
- Glassmorphic input fields
- Gradient buttons
- Smooth shadows
- Dark mode support
- Accessible (ARIA labels, keyboard nav)

MOBILE:
- Single panel (background becomes header)
- Full-screen form
- Bottom sheet for role selection

TECH STACK:
- React + TypeScript
- TailwindCSS v4
- Framer Motion
- React Hook Form + Zod
- Lucide React icons
```

---

## 5️⃣ Admin Panel - User Management

### Lovable Prompt:
```
Create an admin panel for user verification and management:

LAYOUT:
1. Header:
   - "User Management" title
   - Search bar (filter by name/email)
   - Filter dropdowns (role, status, date range)
   - "Export to CSV" button

2. Stats Overview (4 cards):
   - Total Users
   - Pending Verifications (highlighted)
   - Verified Users
   - Rejected Users
   - Interactive (click to filter table)

3. Data Table:
   COLUMNS:
   - Checkbox (multi-select)
   - Avatar + Name
   - Email
   - Role badge
   - Organization
   - Verification Status (color-coded badge)
   - Registered Date
   - Actions (dropdown menu)

   ROW ACTIONS:
   - View Details (modal)
   - Approve Verification
   - Reject Verification
   - Edit User
   - Delete User (confirmation modal)

4. Pagination:
   - Page numbers
   - "Previous/Next" buttons
   - Rows per page selector
   - Total count display

VERIFICATION MODAL:
- User details (name, email, role, org)
- Uploaded verification documents (expandable)
- Verification data (role-specific fields)
- Admin decision:
  * "Approve" button (green)
  * "Reject" button (red)
  * Rejection reason textarea
- Action history timeline

FEATURES:
- Sortable columns (click header)
- Multi-select for bulk actions
- Real-time search/filter
- Infinite scroll option
- Export selected rows
- Drag-to-reorder columns

ANIMATIONS:
- Table rows fade in with stagger
- Selected rows highlight with pulse
- Modal slides in from bottom
- Dropdown menus slide down
- Loading skeleton for async data

DESIGN:
- Clean, minimal table design
- Alternating row colors
- Sticky table header
- Glassmorphic modal backdrop
- Status badges with icons
- Tooltips on hover

RESPONSIVE:
- Desktop: Full table
- Tablet: Horizontal scroll
- Mobile: Card view (stacked rows)

TECH STACK:
- React + TypeScript
- TailwindCSS v4
- TanStack Table (React Table v8)
- Framer Motion
- React Query
```

---

## 🚀 How to Use These Prompts

### Step-by-Step Process:

1. **Visit Lovable**: Go to https://lovable.dev

2. **Create Project**: Start a new project or component

3. **Paste Prompt**: Copy one of the prompts above

4. **Review & Iterate**: 
   - Lovable will generate the component
   - Review the code and design
   - Ask for adjustments if needed (e.g., "Make the gradient more vibrant")

5. **Copy Code**: Download/copy the generated code

6. **Integrate**:
   ```bash
   # Location in your project
   apps/frontend/src/components/[component-name].tsx
   ```

7. **Update Imports**:
   ```typescript
   // Replace Lovable's generic imports with your project's
   import { Button } from '@/design-system';
   import { useQuery } from '@tanstack/react-query';
   ```

8. **Connect to API**:
   ```typescript
   // Your backend API is already proxied
   const { data } = useQuery({
     queryKey: ['appointments'],
     queryFn: () => axios.get('/api/v1/appointments')
   });
   ```

9. **Test**: Run `npm run dev` and test the component

---

## 💡 Customization Tips

### To Make Components More "You":

1. **Adjust Colors**: Update Tailwind classes
   ```tsx
   // Change from
   className="bg-purple-500"
   // To your brand color
   className="bg-indigo-600"
   ```

2. **Modify Animations**: Adjust Framer Motion values
   ```tsx
   // Speed up animations
   transition={{ duration: 0.2 }}
   // Add spring physics
   transition={{ type: "spring", stiffness: 300 }}
   ```

3. **Add Features**: Extend with your own logic
   ```tsx
   // Add analytics tracking
   onClick={() => {
     trackEvent('booking_confirmed');
     onViewBookings();
   }}
   ```

---

## 🎯 Priority Order

We recommend enhancing components in this order:

1. **Booking Confirmation** (High user visibility)
2. **Dashboard** (First screen users see)
3. **Advanced Booking Page** (Core functionality)
4. **Login/Register** (First impression)
5. **Admin Panel** (Lower priority, admin-only)

---

## 📞 Need Help?

If a Lovable-generated component doesn't work:
1. Check import paths
2. Verify TailwindCSS classes are compatible
3. Ensure Framer Motion is installed: `npm install framer-motion`
4. Check for TypeScript errors in VS Code

---

**Happy Building! Your SmartSlot UI is about to get a major upgrade! 🚀**
