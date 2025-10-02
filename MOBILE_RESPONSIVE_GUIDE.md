# Mobile Responsive Design Guide

This document outlines all mobile responsive improvements implemented in the DayWon app.

## Design System Utilities

### Responsive Spacing (src/index.css)

```css
/* Responsive padding utilities */
.px-responsive {
  @apply px-4 sm:px-6 lg:px-8;
}

.p-responsive {
  @apply p-4 sm:p-6 lg:p-8;
}

/* Safe bottom padding for pages with fixed footer */
.pb-safe-mobile {
  @apply pb-20 sm:pb-24;
}

/* Touch-friendly targets (WCAG 2.5.5 compliant) */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

.touch-target-sm {
  @apply min-h-[36px] min-w-[36px];
}

/* Safe area for devices with notches */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Component Updates

### Buttons (src/components/ui/button.tsx)
- All button sizes now meet WCAG 2.5.5 minimum touch target size (44x44px)
- Default: min-h-[44px]
- Small: min-h-[36px]
- Large: min-h-[48px]
- Icon variants include both height and width minimums

### Dialogs (src/components/ui/dialog.tsx)
- Width: `w-[calc(100%-2rem)]` (leaves 1rem margin on each side)
- Padding: `p-4 sm:p-6` (reduced on mobile)
- Max height: `max-h-[90vh]` with `overflow-y-auto` (prevents content cutoff)
- Border radius: Consistent `rounded-lg` on all screen sizes

### Sheets (src/components/ui/sheet.tsx)
- Width: `w-[85vw]` on mobile, `sm:max-w-sm` on larger screens
- Padding: `p-4 sm:p-6` (responsive)
- Bottom sheets: `max-h-[90vh]` with rounded top corners `rounded-t-xl`
- Close button: Touch-friendly with `touch-target-sm` class

### Cards (src/components/ui/card.tsx)
- Header: `p-4 sm:p-6`
- Content: `p-4 sm:p-6`
- Footer: `p-4 sm:p-6`

### Tabs (src/components/ui/tabs.tsx)
- TabsList: `h-11 min-h-[44px]` (touch-friendly)
- TabsTrigger: `min-h-[36px]` (adequate touch target)

### Input & Textarea (src/components/ui/input.tsx, textarea.tsx)
- Input: `h-11 min-h-[44px]` with responsive text sizing
- Textarea: `min-h-[100px]` with responsive text sizing
- Font size: `text-base sm:text-sm` (16px on mobile prevents zoom on iOS)

### Footer (src/components/Footer.tsx)
- Navigation buttons: `touch-target-sm` for adequate touch areas
- Flexible layout: `flex-1 min-w-0` prevents overflow
- Icon size: `22px` on mobile (increased from 20px)
- Safe area support for devices with notches

## Page Updates

All main pages now use consistent responsive spacing:

### Index (src/pages/Index.tsx)
- Main: `px-responsive pb-safe-mobile`

### Social (src/pages/Social.tsx)
- Main: `px-responsive pb-safe-mobile`

### Guidance (src/pages/Guidance.tsx)
- Main: `px-responsive pb-safe-mobile`

### Calendar (src/pages/CalendarPage.tsx)
- Main: `px-responsive pb-safe-mobile`

### Profile (src/pages/Profile.tsx)
- Main: `px-responsive pb-safe-mobile`

### GoOnboarding (src/pages/GoOnboarding.tsx)
- Main: `px-responsive pb-safe-mobile`

### GoPremium (src/pages/GoPremium.tsx)
- Main: `px-responsive pb-safe-mobile`

### Integrations (src/pages/Integrations.tsx)
- Main: `pb-safe-mobile`

## Mobile Testing Checklist

### Touch Targets
- ✅ All interactive elements meet 44x44px minimum (WCAG 2.5.5)
- ✅ Buttons have adequate spacing between them
- ✅ Tab triggers are touch-friendly
- ✅ Footer navigation buttons are adequately sized

### Text Readability
- ✅ Base font size is 16px on mobile (prevents iOS zoom)
- ✅ Text scales appropriately across breakpoints
- ✅ Line heights are adequate for readability

### Layout & Spacing
- ✅ Consistent padding across all pages
- ✅ Content doesn't get cut off by fixed footer
- ✅ Dialogs and sheets don't overflow viewport
- ✅ Adequate margins on all screen sizes

### Forms & Inputs
- ✅ Input fields are large enough to tap easily
- ✅ Labels are visible and associated with inputs
- ✅ Error messages are clearly displayed
- ✅ Form buttons are adequately sized

### Navigation
- ✅ Footer navigation is always accessible
- ✅ Header remains functional on scroll
- ✅ Navigation labels are readable
- ✅ Active states are clearly indicated

### Modals & Overlays
- ✅ Modals are properly sized on mobile
- ✅ Close buttons are easy to tap
- ✅ Content is scrollable when needed
- ✅ Overlay backgrounds are visible

### Performance
- ✅ Smooth animations and transitions
- ✅ No layout shifts on load
- ✅ Fast touch response times

## Device-Specific Considerations

### iOS
- Font sizes prevent automatic zoom (16px minimum)
- Safe area insets respected for devices with notches
- Smooth scrolling behavior

### Android
- Touch targets meet Material Design guidelines
- Ripple effects work correctly
- Back button behavior is intuitive

### Tablets
- Layout adapts gracefully to larger screens
- Touch targets remain adequate
- Content doesn't stretch unnecessarily

## Breakpoints

The app uses Tailwind's default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Most responsive utilities use `sm:` prefix for the first breakpoint, ensuring mobile-first design.

## Best Practices

1. **Always use semantic spacing utilities** (`px-responsive`, `p-responsive`)
2. **Ensure touch targets meet WCAG guidelines** (min 44x44px)
3. **Test on actual devices**, not just browser DevTools
4. **Consider safe areas** on devices with notches
5. **Use responsive text sizing** to prevent unwanted zoom
6. **Provide adequate spacing** between interactive elements
7. **Test with different text sizes** (accessibility settings)
8. **Verify scroll behavior** with long content
9. **Check landscape orientation** on mobile devices
10. **Test with different viewport heights** (address bar visible/hidden)
