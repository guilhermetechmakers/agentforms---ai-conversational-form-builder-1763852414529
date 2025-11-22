# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

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

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

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
- Sufficient color contrast
- Respect reduced motion preferences

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


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

# AgentForms — Development Blueprint

AgentForms is an AI Conversational Form Builder that lets users design configurable “agents” which collect structured data via shareable public chat links. Each agent encapsulates a field schema, persona/tone, optional knowledge base, and visual branding. Visitors open a public URL to start a fresh session; an LLM-driven orchestration layer decides next questions, validates answers, and persists full conversation and structured responses. Admins can inspect sessions, export data, and forward responses via webhooks.

## 1. Pages (UI Screens)

- Landing Page
  - Purpose: public marketing and conversion funnel.
  - Key sections/components: Hero (headline, CTAs), Feature highlights, Live demo embed button, How it works flow, Pricing teaser, Customer logos, Footer links.

- Login / Signup
  - Purpose: authenticate users and onboard.
  - Key sections/components: Auth tabs (Login/Signup), social OAuth buttons, form fields (name, email, password, company), demo agent CTA, forgot password link, footer links.

- Password Reset
  - Purpose: request and complete password reset flow.
  - Key sections/components: email input, send reset button, reset form (token: new password, confirm, strength meter), validation messages.

- Email Verification
  - Purpose: confirm account ownership.
  - Key sections/components: verification status banner, resend verification button, continue to dashboard CTA, troubleshooting tips.

- Dashboard (Agent List)
  - Purpose: main workspace listing agents and quick management.
  - Key sections/components: top bar (create agent, search, filters, team selector), agent cards/table (name, description, sessions, conversion, actions), usage summary panel, onboarding checklist, bulk actions/pagination.

- Agent Builder
  - Purpose: create/edit agent schema, persona, knowledge, and visuals.
  - Key sections/components: left sidebar (field list with reorder), field editor panel (type, validation, placeholder, required toggle), persona & tone section, knowledge input/upload, appearance settings (color, avatar, logo, welcome message), publish controls (save draft, publish, test), real-time preview pane, footer autosave/validation warnings.

- Agent Sandbox / Test
  - Purpose: simulate conversations and validate flows.
  - Key sections/components: interactive chat window, session inspector (collected values, missing fields), LLM prompt controls (temperature, deterministic toggle), save test session, error/validation log.

- Public Agent Chat (Visitor UI)
  - Purpose: public-facing full-page chat session per agent link.
  - Key sections/components: welcome banner (avatar/logo, welcome message, privacy/consent), chat window (messages, typing indicator, timestamps), input area (text, quick-selects, attachments), session progress indicator (required fields), minimized branding footer (share/QR), session end screen (thanks, CTA, download option).

- Sessions List
  - Purpose: list sessions per agent with quick actions.
  - Key sections/components: agent selector, sessions table (id, started at, status, fields summary, actions), filters (date, status), bulk export, pagination.

- Session Inspector
  - Purpose: detailed session review and actions.
  - Key sections/components: conversation timeline (roles, timestamps, validation highlights), collected data panel (editable values, validation status), metadata (session id, agent id, IP, referrer), webhook delivery log, actions (export, redact, resend webhook, mark reviewed), audit trail.

- Webhook & Integrations
  - Purpose: configure webhook endpoints and delivery policies.
  - Key sections/components: webhook list (status, last delivery), webhook editor (URL, headers, auth, triggers, retry policy), test delivery, delivery logs with responses.

- Settings & Preferences
  - Purpose: account and app-wide configuration.
  - Key sections/components: billing & plan, team management, LLM & API settings, data retention & privacy, webhooks shortcut, logs & audit.

- Checkout / Billing
  - Purpose: upgrade plans and manage payments.
  - Key sections/components: plan summary, Stripe Elements payment form, billing address & VAT, coupon code, TOS checkbox, success confirmation.

- User Profile
  - Purpose: user details, security, and data controls.
  - Key sections/components: profile summary, edit profile form (avatar upload), security (change password, enable 2FA, active sessions, logout everywhere), data controls (export account, delete account).

- Admin Dashboard
  - Purpose: platform-level monitoring and moderation.
  - Key sections/components: system metrics, user management (suspend, impersonate), moderation queue, billing & invoices overview, audit & logs.

- About & Help (Docs Hub)
  - Purpose: searchable documentation and support resources.
  - Key sections/components: searchable docs, FAQs, sample prompt library, support contact/ticket form (attach session id), community links, changelog, roadmap.

- Privacy & Terms
  - Purpose: legal pages.
  - Key sections/components: privacy policy text, terms of service, cookie policy, legal request contact.

- 404 Not Found
  - Purpose: graceful handling of unknown routes.
  - Key sections/components: friendly error message, CTA to dashboard or landing, search field, contact support link.

- 500 Server Error
  - Purpose: inform of server issues and recovery options.
  - Key sections/components: apology message, retry action, report issue link (captures session id).

## 2. Features

- Agent CRUD & Versioning
  - Technical details: Supabase DB tables for agents and agent_versions. Store JSON schema for fields, persona, knowledge metadata, visuals, and publish status. Implement optimistic locking and version history with diffs.
  - Implementation notes: autosave drafts; publish creates a new version and generates public URL.

- Agent Schema Designer
  - Technical details: field types (text, number, email, date, select, multi-select, attachments), validation rules (required, regex, min/max), ordering, example values, help text.
  - Implementation notes: client-side validation preview; server-side schema enforcement; store canonical field keys for payloads.

- Public Session Creation & Chat Engine
  - Technical details: public session API creates session row with session_id, agent_id, status=in-progress, visitor metadata. Use WebSocket (preferred) or SSE for real-time messages. Persist messages and field_value records.
  - Implementation notes: rate-limit creation endpoints, optional CAPTCHA, ephemeral session tokens for visitor sockets.

- LLM Orchestration & Prompting
  - Technical details: service composes prompt using persona, knowledge context (optionally retrieve embeddings), schema of remaining fields, and conversation history. Support provider abstraction layer (OpenAI, Anthropic, etc.) with fallback.
  - Implementation notes: deterministic mode = low temperature + explicit question templates; log prompts/responses with PII redaction; token budgeting and truncation logic.

- Validation Layer
  - Technical details: regex/type validation, required-field enforcement, LLM-suggested validation for complex answers. On each visitor response, run validators and either accept, request clarification, or propose normalization.
  - Implementation notes: implement server-side validators as canonical functions; return structured validation result to UI for inline messages.

- Session Storage & Search
  - Technical details: Supabase tables: sessions, messages, field_values, session_metadata. Index searchable fields and store conversation blobs. Provide export endpoints for CSV/JSON with streaming for large exports.
  - Implementation notes: soft-delete flag, retention TTL jobs, data redaction endpoints.

- Webhook Forwarding & Delivery
  - Technical details: queue-based delivery (e.g., background worker), HMAC signing option, retries with exponential backoff, dead-letter queue, detailed delivery logs table.
  - Implementation notes: include sample payload builder in UI; allow on-update and on-complete triggers.

- Exports & Downloads
  - Technical details: generate CSV/JSON, signed expiring download URLs via Supabase Storage, scheduled exports (cron jobs).
  - Implementation notes: permissions and audit logs for each export action.

- Agent Sandbox & Test Controls
  - Technical details: preview endpoint that runs orchestration in sandbox LLM mode; toggles for temperature and deterministic behavior; allow saving sandbox session to real sessions table.
  - Implementation notes: isolate sandbox LLM usage from billing quotas or clearly mark usage.

- User Authentication & Security
  - Technical details: email/password (bcrypt/argon2), OAuth integrations, JWT or secure session cookies, email verification tokens, password reset tokens, RBAC roles.
  - Implementation notes: 2FA via TOTP (RFC 6238) with backup codes; account protection rate-limits and brute-force detection.

- Billing & Subscriptions
  - Technical details: Stripe integration (subscriptions, coupons, invoices). Track usage (LLM calls, sessions) for quota enforcement.
  - Implementation notes: webhook handlers for Stripe events, UI billing portal links, plan limits enforced server-side.

- Admin & Moderation Tools
  - Technical details: admin RBAC, impersonation with audit, moderation queue for flagged sessions, usage dashboards (aggregated metrics).
  - Implementation notes: restrict sensitive actions and log all admin operations.

- Embedding & Knowledge Retrieval
  - Technical details: optional embeddings pipeline storing vectors in Supabase Vector for knowledge inputs; retrieval layer to include top-k contexts in prompts.
  - Implementation notes: size limits and summarization for large knowledge blobs.

- Monitoring & Observability
  - Technical details: Sentry/Datadog integration for errors and performance, metrics export for dashboards (MAA, MAS, conversion).
  - Implementation notes: instrument LLM costs per-agent for billing.

- Security & Compliance
  - Technical details: TLS in transit, encryption at rest, field-level PII redaction, audit logs, data retention policies, SSO (SAML/OIDC) for enterprise.
  - Implementation notes: implement data deletion / export workflows for GDPR; retention config stored per-organization.

- File Uploads & Storage
  - Technical details: Supabase Storage with signed URLs, image resizing for avatars/logo, content-scan for attachments (optional).
  - Implementation notes: limit file sizes and types; CDN caching for public assets.

## 3. User Journeys

- Visitor (Public Agent Link) — Conversational Lead Flow
  1. Visitor clicks public agent URL.
  2. Server creates new session and returns session_id and websocket token.
  3. Client loads welcome banner (avatar, welcome message, privacy/consent checkbox if enabled).
  4. Visitor consents (if required) and begins chat.
  5. Agent (LLM) asks first question based on persona/welcome message.
  6. Visitor responds via text/quick-select/attachment.
  7. Backend validation runs; if invalid, agent requests clarification; if valid, field_value saved.
  8. LLM decides next question based on remaining required fields and prior answers.
  9. Steps 6–8 repeat until required fields satisfied or session closed.
  10. On completion, session status set completed; session stored and webhook triggered (if configured); visitor sees end screen and optional CTA.

- Agent Creator (Admin/User) — Build → Publish → Analyze
  1. User signs up and verifies email.
  2. User opens Dashboard → Create Agent.
  3. In Agent Builder, user adds fields, sets validation, defines persona/tone, pastes or uploads knowledge, and configures visuals/welcome message.
  4. User tests agent in Sandbox and adjusts temperature/determinism.
  5. User saves draft, then clicks Publish → system generates public URL and increments agent version.
  6. User shares link; Dashboard shows sessions as they come in.
  7. User reviews Sessions List, opens Session Inspector to view conversation and collected structured data.
  8. User exports session(s) or configures/sends via webhook.

- Admin (Platform Admin) — Monitor & Moderate
  1. Admin logs into Admin Dashboard.
  2. Reviews system metrics (sessions, LLM usage, error rates).
  3. Checks moderation queue for flagged sessions; reviews and takes actions (suspend account, delete session).
  4. Accesses user management to suspend/impersonate accounts; audits actions recorded.
  5. Reviews billing summary and handles escalations.

- Billing Flow (User upgrading)
  1. User selects plan via Dashboard or Billing page.
  2. Checkout uses Stripe Elements to collect payment and create subscription.
  3. Backend stores subscription id and updates plan limits.
  4. Stripe webhooks update billing status; UI shows invoices and remaining quotas.

## 4. UI Guide

Apply the Visual Style and Implementation Notes consistently. Below are component-level specifications and behavior rules.

- Global Layout
  - Vertical collapsible sidebar (left) using primary background #22242A; fixed width with responsive collapse.
  - Top bar minimal with breadcrumbs and key actions.
  - Main content uses secondary backgrounds (#282A30 / #24262C) in cards/panels with consistent padding 20–32px.
  - Use Inter font family; headings 600–700 weight; body 400.

- Buttons
  - Primary: filled using accent Yellow #F6D365 or Blue #60A5FA depending on context; rounded corners 12px; hover: slight brighten + scale 1.02.
  - Secondary: ghost/outline with muted gray text (#A1A1AA); rounded corners.
  - Disabled: text #6B7280, no hover.

- Inputs & Form Controls
  - Rounded filled backgrounds; subtle border #303136; focus ring: #60A5FA blue glow.
  - Placeholders use secondary text #A1A1AA.
  - Validation messages: error color #F87171, info color #F6D365.

- Cards
  - Rounded corners 12–16px; soft shadow (#1A1B20 low opacity); header, content, footer hierarchy.
  - Hover: background slightly lighter, shadow intensifies, transform scale(1.02).

- Chat Components
  - Message bubbles: agent on left, visitor on right. Agent bubble uses subtle background variant with accent badges for follow-ups. Timestamps in secondary text #A1A1AA.
  - Typing indicator animate dots; streaming LLM responses via SSE/WebSocket chunking.
  - Input area fixed to bottom with accessible controls; attachments and quick-select chips use rounded pill style.

- Badges & Status
  - Pills for status/priority: high (#F87171), medium (#FBBF24), low (#6EE7B7).
  - Progress bars: thin, rounded, accent green #4ADE80.

- Sidebar Navigation
  - Dark background (#22242A) with grouped nav items, icons centered vertically. Active state: left accent bar #F6D365 and bold text. Collapsible groups animate.

- Dialogs/Modals
  - Centered with backdrop (semi-opaque). Use card styling and focus trap. Primary CTA button visible and prominent.

- Tables & Lists
  - Subtle separators #303136; row hover highlights with slightly lighter background. Use compact spacing for tables, generous spacing for card lists.

- Avatar & Logo Handling
  - Uploads resized and cropped server-side. Avatars circular, small accents (pink #F472B6) for placeholders.

- Accessibility
  - High contrast text (#F3F4F6 on dark backgrounds), keyboard navigable, aria labels for inputs, reachable focus states (visible blue ring #60A5FA), and screen-reader friendly messages.

- Micro-interactions
  - Smooth 150–250ms transitions for hovers, toggles, and collapses. Drag-and-drop reorder supports placeholder animation.

- Data Visualization & Metrics
  - Minimal charts; use status pills and small sparklines only. Colors must follow palette.

Implementation Notes:
- Reuse component library across pages; build accessible, themeable tokens mapping to palette.
- Ensure mobile responsiveness; sidebar collapses to bottom nav or hamburger.
- Test dark-first contrasts and device pixel ratios for icons.

Instructions to AI Development Tool:
After every development step, refer back to this blueprint to ensure correct implementation. Verify all features and pages are built according to specifications before completing the project. Pay special attention to the UI Guide section and ensure all visual elements follow the design system exactly.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
