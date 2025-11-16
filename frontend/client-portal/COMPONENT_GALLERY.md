# LEHELP Component Gallery

Quick reference for all available components in the new UI.

## 🎨 Shared Components

### StatusBadge
Display case status with color-coded badges.

**Import:**
```tsx
import { StatusBadge } from '../components/shared';
```

**Usage:**
```tsx
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="resolved" />
<StatusBadge status="urgent" />
```

**Props:**
- `status`: 'pending' | 'active' | 'resolved' | 'closed' | 'urgent'

**Colors:**
- Pending: Orange (#F59E0B)
- Active: Blue (#3B82F6)
- Resolved: Green (#10B981)
- Urgent: Red (#EF4444)
- Closed: Gray (#6B7280)

---

### UrgencyBadge
Display case urgency level.

**Import:**
```tsx
import { UrgencyBadge } from '../components/shared';
```

**Usage:**
```tsx
<UrgencyBadge urgency="critical" />
<UrgencyBadge urgency="high" />
<UrgencyBadge urgency="medium" />
<UrgencyBadge urgency="low" />
```

**Props:**
- `urgency`: 'low' | 'medium' | 'high' | 'critical'

**Colors:**
- Low: Green (#10B981)
- Medium: Orange (#F59E0B)
- High: Orange-Red (#F97316)
- Critical: Red (#EF4444)

---

### CaseCard
Reusable card for displaying case information.

**Import:**
```tsx
import { CaseCard } from '../components/shared';
```

**Usage:**
```tsx
<CaseCard 
  case={caseData} 
  onClick={() => navigate(`/cases/${caseData.id}`)}
  showUrgency={true}
/>
```

**Props:**
- `case`: Case object (required)
- `onClick`: () => void (optional)
- `showUrgency`: boolean (optional, default: false)

**Features:**
- Status badge
- Optional urgency badge
- Case number and title
- Description preview (120 chars)
- Creation date
- Document count
- Hover animation
- Click handler

---

### Navigation
Top navigation bar for public pages.

**Import:**
```tsx
import { Navigation } from '../components/shared';
```

**Usage:**
```tsx
<Navigation />
```

**Features:**
- LEHELP logo with Shield icon
- Responsive menu (desktop/mobile)
- Menu items: Home, Cases, Lawyers, Resources, About
- Sign In button (not authenticated)
- Dashboard + Sign Out (authenticated)
- Mobile drawer navigation
- Gradient CTA button

---

### Sidebar
Dashboard sidebar navigation.

**Import:**
```tsx
import { Sidebar } from '../components/shared';
```

**Usage:**
```tsx
<Sidebar 
  role="client"
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
```

**Props:**
- `role`: 'client' | 'lawyer' | 'activist' (required)
- `open`: boolean (optional, default: true)
- `onClose`: () => void (optional, for mobile)

**Menu Items by Role:**

**Client:**
- My Cases
- Messages
- Documents
- Profile

**Lawyer:**
- Dashboard
- My Cases
- Messages
- Documents
- Profile

**Activist:**
- Dashboard
- Cases
- Messages
- Profile

**Features:**
- Active state highlighting
- Icon + text labels
- Responsive (drawer on mobile)
- Lucide React icons

---

### Footer
Professional footer for public pages.

**Import:**
```tsx
import { Footer } from '../components/shared';
```

**Usage:**
```tsx
<Footer />
```

**Features:**
- LEHELP branding
- Platform description
- Copyright notice
- Privacy indicators
- Dark theme (gray-900 background)

---

## 📄 Page Components

### HomePage
Professional landing page.

**Route:** `/`

**Sections:**
1. **Hero** - Gradient background, title, CTAs, trust indicators
2. **Stats** - Cases resolved, expert lawyers
3. **Features** - 3-column grid with icons
4. **Case Types** - 6 human rights categories
5. **CTA** - Final conversion section
6. **Footer**

**Key Elements:**
- Navigation bar
- Gradient hero section
- Feature cards with hover effects
- Case type grid with icons
- Multiple CTAs

---

### LoginPage
Secure login interface.

**Route:** `/login`

**Features:**
- Shield icon logo
- Anonymous username field
- Password with show/hide toggle
- Security notice banner
- Error alerts
- Link to register
- Back to home button

**Form Fields:**
- Username (required)
- Password (required)

---

### RegisterPage
Multi-role registration.

**Route:** `/register`

**Features:**
- Role selector buttons (Client/Lawyer/Activist)
- Optional username (auto-generates)
- Optional display name
- Conditional organization field (lawyers/activists)
- Password with confirmation
- Security notice
- Show/hide password toggle

**Form Fields:**
- Role: client | lawyer | activist (required)
- Username (optional)
- Display Name (optional)
- Organization (optional, for lawyers/activists)
- Password (required, min 8 chars)
- Confirm Password (required)

---

### ClientDashboard
Client portal homepage.

**Route:** `/dashboard` (for clients)

**Features:**
- Top navigation with logo and user info
- Sidebar navigation
- Submit case CTA card (gradient)
- Active cases grid
- Empty state when no cases
- Mobile responsive

**Sections:**
1. Top bar with logout
2. Sidebar menu
3. Hero CTA card
4. Active cases grid

---

### LawyerDashboard
Lawyer portal homepage.

**Route:** `/dashboard` (for lawyers)

**Features:**
- Statistics cards (3-column)
- New case requests grid
- Accept/View actions
- Urgency badges
- Empty states

**Sections:**
1. Welcome message
2. Statistics cards:
   - Active Cases
   - New Requests
   - Total Resolved
3. New case requests grid

---

## 🎨 Design Tokens

### Colors
```tsx
// Primary
const primary = {
  main: '#4F46E5',
  light: '#6366F1',
  dark: '#4338CA',
};

// Secondary
const secondary = {
  main: '#7C3AED',
  light: '#8B5CF6',
  dark: '#6D28D9',
};

// Status
const success = '#10B981';
const warning = '#F59E0B';
const error = '#EF4444';
const info = '#3B82F6';
```

### Typography
```tsx
// Headings
h1: { fontSize: '3rem', fontWeight: 700 }
h2: { fontSize: '2.25rem', fontWeight: 700 }
h3: { fontSize: '1.875rem', fontWeight: 600 }
h4: { fontSize: '1.5rem', fontWeight: 600 }
h5: { fontSize: '1.25rem', fontWeight: 600 }

// Body
body1: { fontSize: '1rem', lineHeight: 1.6 }
body2: { fontSize: '0.875rem', lineHeight: 1.6 }

// Button
button: { fontSize: '0.875rem', fontWeight: 500 }
```

### Spacing
```tsx
// Grid: 8px base unit
const spacing = {
  xs: '4px',   // 0.5 unit
  sm: '8px',   // 1 unit
  md: '16px',  // 2 units
  lg: '24px',  // 3 units
  xl: '32px',  // 4 units
  xxl: '48px', // 6 units
};
```

### Border Radius
```tsx
const borderRadius = {
  small: '6px',   // Chips
  default: '8px', // Buttons, inputs
  large: '12px',  // Cards, papers
};
```

---

## 🔧 Usage Examples

### Building a New Page

```tsx
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Navigation, Footer, CaseCard } from '../components/shared';
import { Case } from '../types';

export default function MyPage() {
  const cases: Case[] = []; // Your data

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      
      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ mb: 4 }}>
            My Page Title
          </Typography>
          
          {cases.map(c => (
            <CaseCard key={c.id} case={c} showUrgency />
          ))}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
}
```

### Using Theme Colors

```tsx
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <Box sx={{
      bgcolor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      p: theme.spacing(3),
      borderRadius: theme.shape.borderRadius,
    }}>
      Content
    </Box>
  );
}
```

### Responsive Design

```tsx
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: { xs: 2, md: 4 },
  p: { xs: 2, md: 4 },
}}>
  {/* Stacks on mobile, row on desktop */}
</Box>
```

---

## 📦 Import Paths

```tsx
// Components
import { Navigation, Footer, Sidebar, CaseCard, StatusBadge, UrgencyBadge } from '@/components/shared';

// Types
import { User, Case, LawyerProfile, Message, Document } from '@/types';

// Context
import { useAuth } from '@/contexts/AuthContext';

// Theme
import { theme } from '@/theme';
```

---

## 🎯 Best Practices

1. **Always use shared components** instead of duplicating UI elements
2. **Import types** for type-safe props
3. **Use theme values** instead of hardcoded colors/spacing
4. **Responsive by default** - test on mobile, tablet, desktop
5. **Handle loading/error states** in all components
6. **Add hover/focus states** for interactive elements
7. **Follow naming conventions** - ComponentName.tsx
8. **Export from index.ts** for cleaner imports

---

**Last Updated:** November 16, 2025
