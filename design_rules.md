# Design Rules for This Project

## Project Design Pattern: ---

## Visual Style

### Color Palette:
- Primary background: #22242A (deep charcoal, main workspace and sidebar)
- Secondary backgrounds: #282A30, #24262C (subtle card and panel distinctions)
- Accent colors: 
  - Yellow: #F6D365 (used for status tags and highlights)
  - Green: #4ADE80 (task progress, labels)
  - Blue: #60A5FA (status indicators, toggles)
  - Pink: #F472B6 (avatars, minor accents)
- Text: 
  - Primary: #F3F4F6 (off-white, high contrast)
  - Secondary: #A1A1AA (muted gray, secondary info)
  - Disabled: #6B7280 (low emphasis/disabled states)
- Borders and separators: #303136 (very subtle, low-contrast lines)
- Status/priority: 
  - High: #F87171 (red)
  - Medium: #FBBF24 (amber)
  - Low: #6EE7B7 (mint green)

### Typography & Layout:
- Font Family: Inter, sans-serif (modern, geometric, highly legible)
- Font Weights: 400 (regular) for body, 600-700 (semibold/bold) for headings and key labels
- Hierarchy: 
  - Large bold titles for main sections (e.g., project name)
  - Medium weight for list items and card titles
  - Smaller, regular weight for secondary info (dates, labels)
- Layout: 
  - 3-column Kanban grid for main content
  - Vertical sidebar navigation, fixed to the left
  - Consistent padding (20-32px in main areas), generous spacing between cards (16px)
  - Rounded corners (10-16px radius) on cards and interactive elements
  - Center-aligned icons and vertical rhythm maintained via equalized margins

### Key Design Elements
#### Card Design:
- Surface: Elevated cards with soft drop shadows (#1A1B20, low opacity) and subtle, smooth gradients for depth
- Borders: Minimal, if any; separation via shadow and color layering
- Hover States: Slightly lighter background shade, intensified shadow, subtle scaling (1.02x) on hover
- Hierarchy: Clear separation of card header (title, status badges), main content, and footer (avatars, actions)

#### Navigation:
- Sidebar: Vertical, dark, collapsible with grouped sections and clear iconography
- Active State: Accent color bar (e.g., #F6D365 yellow) and bold text highlight, subtle background shift
- Collapsible Groups: Chevron icons indicate expand/collapse, smooth animation for group transitions
- Top Bar: Minimal, with key action buttons and breadcrumbs

#### Data Visualization:
- Status Indicators: Pill-shaped badges with color-coding (green, amber, red) for task status/priority
- Progress Bars: Flat, thin, rounded ends, using accent green
- Minimal use of charts—focus on task and status visualization via tags and progress indicators

#### Interactive Elements:
- Buttons: Rounded, ghost or solid styles; primary actions in accent colors, secondary in muted gray
- Form Fields: Rounded, filled backgrounds, soft focus ring (#60A5FA blue glow), clear label and placeholder text
- Toggles/Switches: Rounded, blue-accent active state, subtle shadow
- Micro-interactions: Smooth transitions for hovers, button presses, and card movements (drag & drop)

### Design Philosophy
This interface embodies:
- A modern, minimalist, and professional aesthetic with a focus on clarity and hierarchy
- Dark mode-first design for reduced eye strain and a sleek, tech-forward look
- Friendly, rounded components to convey approachability while maintaining enterprise-grade polish
- Consistent use of color to signal status and guide user attention without visual clutter
- User experience goals: quick comprehension, efficient navigation, and delightful micro-interactions for productivity-focused users
- Visual strategy: balance between functional density and breathing room, ensuring users feel empowered, not overwhelmed

---

This project follows the "---

## Visual Style

### Color Palette:
- Primary background: #22242A (deep charcoal, main workspace and sidebar)
- Secondary backgrounds: #282A30, #24262C (subtle card and panel distinctions)
- Accent colors: 
  - Yellow: #F6D365 (used for status tags and highlights)
  - Green: #4ADE80 (task progress, labels)
  - Blue: #60A5FA (status indicators, toggles)
  - Pink: #F472B6 (avatars, minor accents)
- Text: 
  - Primary: #F3F4F6 (off-white, high contrast)
  - Secondary: #A1A1AA (muted gray, secondary info)
  - Disabled: #6B7280 (low emphasis/disabled states)
- Borders and separators: #303136 (very subtle, low-contrast lines)
- Status/priority: 
  - High: #F87171 (red)
  - Medium: #FBBF24 (amber)
  - Low: #6EE7B7 (mint green)

### Typography & Layout:
- Font Family: Inter, sans-serif (modern, geometric, highly legible)
- Font Weights: 400 (regular) for body, 600-700 (semibold/bold) for headings and key labels
- Hierarchy: 
  - Large bold titles for main sections (e.g., project name)
  - Medium weight for list items and card titles
  - Smaller, regular weight for secondary info (dates, labels)
- Layout: 
  - 3-column Kanban grid for main content
  - Vertical sidebar navigation, fixed to the left
  - Consistent padding (20-32px in main areas), generous spacing between cards (16px)
  - Rounded corners (10-16px radius) on cards and interactive elements
  - Center-aligned icons and vertical rhythm maintained via equalized margins

### Key Design Elements
#### Card Design:
- Surface: Elevated cards with soft drop shadows (#1A1B20, low opacity) and subtle, smooth gradients for depth
- Borders: Minimal, if any; separation via shadow and color layering
- Hover States: Slightly lighter background shade, intensified shadow, subtle scaling (1.02x) on hover
- Hierarchy: Clear separation of card header (title, status badges), main content, and footer (avatars, actions)

#### Navigation:
- Sidebar: Vertical, dark, collapsible with grouped sections and clear iconography
- Active State: Accent color bar (e.g., #F6D365 yellow) and bold text highlight, subtle background shift
- Collapsible Groups: Chevron icons indicate expand/collapse, smooth animation for group transitions
- Top Bar: Minimal, with key action buttons and breadcrumbs

#### Data Visualization:
- Status Indicators: Pill-shaped badges with color-coding (green, amber, red) for task status/priority
- Progress Bars: Flat, thin, rounded ends, using accent green
- Minimal use of charts—focus on task and status visualization via tags and progress indicators

#### Interactive Elements:
- Buttons: Rounded, ghost or solid styles; primary actions in accent colors, secondary in muted gray
- Form Fields: Rounded, filled backgrounds, soft focus ring (#60A5FA blue glow), clear label and placeholder text
- Toggles/Switches: Rounded, blue-accent active state, subtle shadow
- Micro-interactions: Smooth transitions for hovers, button presses, and card movements (drag & drop)

### Design Philosophy
This interface embodies:
- A modern, minimalist, and professional aesthetic with a focus on clarity and hierarchy
- Dark mode-first design for reduced eye strain and a sleek, tech-forward look
- Friendly, rounded components to convey approachability while maintaining enterprise-grade polish
- Consistent use of color to signal status and guide user attention without visual clutter
- User experience goals: quick comprehension, efficient navigation, and delightful micro-interactions for productivity-focused users
- Visual strategy: balance between functional density and breathing room, ensuring users feel empowered, not overwhelmed

---" design pattern.
All design decisions should align with this pattern's best practices.

## General Design Principles

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Dark mode with elevated surfaces

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)
- Test colors in both light and dark modes

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)
- Adjust shadow intensity based on theme (lighter in dark mode)

---

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast (both themes)
- Respect reduced motion preferences

---

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions
9. **Be Themeable** - Support both dark and light modes seamlessly

---

